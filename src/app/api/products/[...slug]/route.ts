import { getDataFromCart } from "@/helpers/getDataFromCart";
import { randomReference } from "@/helpers/getHelpers";
import { getVisitData } from "@/helpers/getVisitData";
import Cart from "@/models/cart";
import Product from "@/models/product";
import User from "@/models/user";
import * as argon from "argon2";
import crypto from 'crypto';
import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/helpers/mailer";
import { EmailType } from "@/interfaces";
import Review from "@/models/review";
import { Op } from "sequelize";
import CartItem from "@/models/cartItem";
import Visitor from "@/models/visitor";

export async function PATCH(req: NextRequest, { params }: { params: { slug: string[] } }) {
  try {

    if(params.slug[1] === 'likes-dislikes'){
      const {likes, dislikes, reviewId} = await req.json();

      const review = await Review.findByPk(reviewId);

      review!.likes = likes;
      review!.dislikes = dislikes;

      await review!.save();

      return NextResponse.json(
        {
          message: "Product reviews updated successfully",
          success: true,
        },
        { status: 201 }
      );
    }
    
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(req: NextRequest, { params }: { params: { slug: string[] } }) {
  try {

    const {rating, email, name, review, headline, isMedia, avatar} = await req.json();

    const title = params.slug[0].charAt(0).toUpperCase() + params.slug[0].replace('-', ' ').slice(1);
    
    const user = await User.findOne({
      where: {email}
    });

    const product = await Product.findOne({
      where: {title}
    });
    
    if(!user){
      const visitId = getVisitData(req);

      let newPassword = randomReference();

      const hash = await argon.hash(newPassword);
      
      const newUser = await User.create({
        id: (await crypto.randomBytes(6)).toString("hex"),
        email,
        password: hash,
        first_name: name.split(' ').length === 2 ? name.split(' ')[0] : name,
        last_name: name.split(' ').length === 2 ? name.split(' ')[1] : name,
        avatar
      });

      if(visitId){
        const visitor = await Visitor.findByPk(visitId);
        await newUser.setVisitor(visitor!);
      }
      
      //updating product with new user review
      const newReview = await Review.create({
        id: (await crypto.randomBytes(6)).toString("hex"),
        headline,
        rating: +rating,
        author_id: newUser.id,
        content: review,
        is_media: isMedia,
      });

      await newReview.setUser(newUser);
      await newReview.setProduct(product!);
      await product!.addReview(newReview);

      product!.reviews.push(newReview.id);

      await product!.save();

      // Send password creation email
      await sendMail({
        password: newPassword,
        email: newUser.email,
        emailType: EmailType.reminder,
      });

      //sending verification email
      await sendMail({
        email: newUser.email,
        emailType: EmailType.verify_reviewer,
        userId: newUser.id
      });

      return NextResponse.json(
        {
          message: "product updated successfully",
          success: true,
        },
        { status: 201 }
      );
    }else{
      //updating product and user record with new user review and avatar
      user.avatar = avatar;

      await user.save();

      const newReview = await Review.create({
        id: (await crypto.randomBytes(6)).toString("hex"),
        headline,
        rating: +rating,
        author_id: user!.id,
        content: review,
        is_media: isMedia,
      });
      
      await newReview.setUser(user!);
      await newReview.setProduct(product!);
      await product!.addReview(newReview);

      product!.reviews.push(newReview.id);

      await product!.save();

      //sending verification email
      await sendMail({
        email: user.email,
        emailType: EmailType.verify_reviewer,
        userId: user.id
      });

      return NextResponse.json(
        {
          message: "Product updated successfully",
          success: true,
        },
        { status: 201 }
      );
    }
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function GET(req: NextRequest, { params }: { params: { slug: string[] } }) {
  try {
    let extractedProductsArray: Product[] = [];
    let authors: User[] = [];
    let updatedProducts: Product[] = [];
    // Get the current viewed products from query params
    const viewedProducts = req.nextUrl.searchParams.get('viewed_p');

    const title = params.slug[0].charAt(0).toUpperCase() + params.slug[0].replace('-', ' ').slice(1);

    const product = await Product.findOne({
      where: { title }
    });

    if (!product) {
      return NextResponse.json({ error: "product doesn't exist" }, { status: 404 });
    }

    const extractedColorObj = product.colors.find(color => 
      color.type === (params.slug[1].charAt(0).toUpperCase() + params.slug[1].slice(1))
    );

    if (extractedColorObj) {

      if (viewedProducts) {
        const viewedProductsArray = JSON.parse(viewedProducts);
        //getting products attached to variant ids
        for (let viewedProduct of viewedProductsArray) {
          let extractedProduct = await Product.findOne({ 
            where: {
              colors: {
                [Op.contains]: [{sizes: [
                  {variant_id: viewedProduct}
                ]}]
              }
            }
          });
          extractedProductsArray.push(extractedProduct!);
        }
      }

      //finding products similar in features to selected product
      const extractedProductsOfSimilarColor = await Product.findAll({
        where: {
          colors: {
            [Op.contains]: [{type: extractedColorObj.type}, {sizes: [
              {variant_id: {
                [Op.ne]: params.slug[2]
              }}
            ]}]
          }
        }
      });

        //finding related/grouped products of selected product
      let carts = await Cart.findAll({
        include: [
          {
            model: CartItem,
            where: {
              product_id: product.id
            }
          }
        ]
       });
      if(carts.length > 0){
        for (let cart of carts) {
          let products = cart.items.map(item => item.product);
          updatedProducts.push(...products);
        }
      }

      updatedProducts = [...updatedProducts, ...extractedProductsArray, ...extractedProductsOfSimilarColor];

       //removing duplicates and storing them
      const relatedProducts = updatedProducts.filter((prod: any) => prod.id !== product.id);

      //getting product reviews
      const reviews = await product.getReviews();

      for (let review of reviews){
        const user = await review.getUser();
        authors.push(user!);
      }

      const updatedReviews = reviews.map(review => {
        const extractedAuthor = authors.find(author => author.id === review.author_id);

        return {
          ...review,
          author: extractedAuthor!
        };
      });
      //sorting reviews with the most likes in descending order
      reviews.sort((a, b) => b.likes - a.likes);;
      
      return NextResponse.json({
        productSizes: extractedColorObj.sizes,
        productFrontBase64Images: extractedColorObj.imageFrontBase64,
        productId: product.id,
        productColors: product.colors,
        productReviews: updatedReviews,
        relatedProducts,
        success: true
      }, { status: 200 });

    } else {
      return NextResponse.json({ error: "product color doesn't exist" }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

