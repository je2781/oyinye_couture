import { randomReference } from "@/helpers/getHelpers";
import { getVisitData } from "@/helpers/getVisitData";
import * as argon from "argon2";
import crypto from 'crypto';
import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/helpers/mailer";
import { EmailType } from "@/interfaces";
import { Op, Sequelize } from "sequelize";
import { models } from "@/db/connection";

export async function PATCH(req: NextRequest, { params }: { params: { slug: string[] } }) {
  try {

    if(params.slug && params.slug[1] === 'likes-dislikes'){
      const {likes, dislikes, reviewId} = await req.json();

      const review = await models.Review.findByPk(reviewId);

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
    }else{
      const hide = req.nextUrl.searchParams.get('hide');

      if(hide){

        await models.Product.update({
          is_hidden: hide === 'true' ? true : false,
        }, {
          where: {
            id: params.slug[1]
          }
        }); 
  
        return NextResponse.json(
          {
            message: "Product hidden successfully",
            success: true,
          },
          { status: 201 }
        );
      }
    }
    
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(req: NextRequest, { params }: { params: { slug: string[] } }) {
  try {

    const {rating, email, name, review, headline, isMedia, avatar} = await req.json();

    const title = params.slug[0].charAt(0).toUpperCase() + params.slug[0].replace('-', ' ').slice(1);
    
    const user = await models.User.findOne({
      where: {email: email}
    });

    const product = await models.Product.findOne({
      where: {title: title}
    });
    
    if(!user){
      const visitId = getVisitData(req);

      let newPassword = randomReference();

      const hash = await argon.hash(newPassword);
      
      const newUser = await models.User.create({
        id: (await crypto.randomBytes(6)).toString("hex"),
        email,
        password: hash,
        first_name: name.split(' ').length === 2 ? name.split(' ')[0] : name,
        last_name: name.split(' ').length === 2 ? name.split(' ')[1] : name,
        avatar
      });

      if(visitId){
        const visitor = await models.Visitor.findByPk(visitId);
        await newUser.setVisitor(visitor!);
      }
      
      //updating product with new user review
      const newReview = await models.Review.create({
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

      const newReview = await models.Review.create({
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
    let extractedProductsArray: any[] = [];
    let authors: any[] = [];
    let updatedProducts: any[] = [];

    const viewedProducts = req.nextUrl.searchParams.get('viewed_p') === 'undefined' ? undefined : req.nextUrl.searchParams.get('viewed_p');

    const title = params.slug[0].charAt(0).toUpperCase() + params.slug[0].replace('-', ' ').slice(1);

    const product = await models.Product.findOne({
      where: Sequelize.where(
        Sequelize.literal(`title->>'en'`), 
        { [Op.eq]: title }
      ),
    });

    if (!product) {
      return NextResponse.json({ error: "product doesn't exist" }, { status: 404 });
    }

    const extractedColorObj = product.colors.find((color: any) => color.type['en'] === params.slug[1].replace('-', ' '));

    if (!extractedColorObj) {
      return NextResponse.json({ error: "product color doesn't exist" }, { status: 404 });
    }

    if (viewedProducts) {
      const viewedProductsArray = JSON.parse(viewedProducts);

      for (let viewedProduct of viewedProductsArray) {
        let extractedProduct = await models.Product.findOne({
          where: {
            colors: {
              [Op.contains]: [{ sizes: [{ variant_id: viewedProduct }] }],
            },
          },
        });
        if (extractedProduct) {
          extractedProductsArray.push(extractedProduct);
        }
      }
    }

    const extractedProductsOfSimilarColor = await models.Product.findAll({
      where: {
        colors: {
          [Op.contains]: [
            { type: { en: extractedColorObj.type['en'] } },
            { sizes: [{ variant_id: { [Op.ne]: params.slug[2] } }] },
          ],
        },
      },
    });

    let carts = await models.Cart.findAll({
      where: {
        items: {
          [Op.contains]: [{ product: { id: product.id } }],
        },
      },
    });

    if (carts.length > 0) {
      for (let cart of carts) {
        let products = cart.items.map((item: any) => item.product);
        updatedProducts.push(...products);
      }
    }

    updatedProducts = [...updatedProducts, ...extractedProductsArray, ...extractedProductsOfSimilarColor];

    const relatedProducts = updatedProducts.filter((prod: any) => prod.id !== product.id);

    const reviews = await product.getReviews();

    for (let review of reviews) {
      const user = await review.getUser();
      authors.push(user);
    }

    const updatedReviews = reviews.map((review: any) => {
      const extractedAuthor = authors.find((author: any) => author.id === review.author_id);
      return { ...review, author: extractedAuthor };
    });

    reviews.sort((a: any, b: any) => b.likes - a.likes);

    return NextResponse.json({
      productSizes: extractedColorObj.sizes,
      productFrontBase64Images: extractedColorObj.image_front_base64,
      productId: product.id,
      productColor: extractedColorObj.type,
      productTitle: product.title,
      productColors: product.colors,
      productReviews: updatedReviews,
      relatedProducts,
      success: true,
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



export async function DELETE(request: NextRequest, { params }: { params: { slug: string[] } }) {
  try {
    
    const product = await models.Product.findByPk(params.slug[1]); 
    
    await product!.destroy();
    
    return NextResponse.json({
      message: 'product deleted',
      success: true
    }, {
      status: 201
    });
     
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}

