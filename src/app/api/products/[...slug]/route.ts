import { connect } from "@/db/config";
import { getDataFromCart } from "@/helpers/getDataFromCart";
import { randomReference } from "@/helpers/getHelpers";
import { getVisitData } from "@/helpers/getVisitData";
import Cart from "@/models/cart";
import Order from "@/models/order";
import Product from "@/models/product";
import User from "@/models/user";
import mongoose from "mongoose";
import * as argon from "argon2";

import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/helpers/mailer";
import { EmailType } from "@/interfaces";
import Review from "@/models/review";
import { getUserData } from "@/helpers/getUserData";

connect();



export async function PATCH(req: NextRequest, { params }: { params: { slug: string[] } }) {
  try {

    if(params.slug[1] === 'likes-dislikes'){
      const {likes, dislikes, reviewId} = await req.json();

      await Review.findByIdAndUpdate(reviewId, {
        likes,
        dislikes
      });

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
    
    const user = await User.findOne({email});
    
    if(!user){
      const visitId = getVisitData(req);
      const newVisitId = mongoose.Types.ObjectId.createFromHexString(visitId!);

      let newPassword = randomReference();

      const hash = await argon.hash(newPassword);
      
      const newUser = new User({
        email,
        password: hash,
        firstName: name.split(' ').length === 2 ? name.split(' ')[0] : name,
        lastName: name.split(' ').length === 2 ? name.split(' ')[1] : name,
        'visitor.visitId': mongoose.Types.ObjectId.isValid(newVisitId) ? newVisitId : null,
        avatar
      });

      const savedUser = await newUser.save();

      //updating product with new user review
      const newReview = new Review({
        headline,
        rating: +rating,
        content: review,
        'author.authorId': savedUser._id,
        isMedia,
      });

      await newReview.save();

      const product = await Product.findOne({title});

      product.reviews = product.reviews.push({
        reviewId: newReview._id
      });

      await product.save();

      // Send password creation email
      await sendMail({
        password: newPassword,
        email: savedUser.email,
        emailType: EmailType.reminder,
      });

      //sending verification email
      await sendMail({
        email: savedUser.email,
        emailType: EmailType.verify_reviewer,
        userId: savedUser._id
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

      const newReview = new Review({
        headline,
        rating: +rating,
        content: review,
        'author.authorId': user._id,
        isMedia
      });
      
      await newReview.save();
      
      const product = await Product.findOne({title});
      
      product.reviews = product.reviews.push({
        reviewId: newReview._id
      });
      
      await product.save();

      //sending verification email
      await sendMail({
        email: user.email,
        emailType: EmailType.verify_reviewer,
        userId: user._id
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
    let extractedProductsArray: string[] = [];
    let authors: any[] = [];
    let updatedProducts: any[] = [];
    // Get the current viewed products from query params
    const viewedProducts = req.nextUrl.searchParams.get('viewed_p');

    const title = params.slug[0].charAt(0).toUpperCase() + params.slug[0].replace('-', ' ').slice(1);

    const product = await Product.findOne({ title });

    if (!product) {
      return NextResponse.json({ error: "product doesn't exist" }, { status: 404 });
    }

    const extractedColorObj = product.colors.find((color: any) => 
      color.type === (params.slug[1].charAt(0).toUpperCase() + params.slug[1].slice(1))
    );

    if (extractedColorObj) {

      if (viewedProducts) {
        const viewedProductsArray = JSON.parse(viewedProducts);
        //getting products attached to variant ids
        for (let viewedProduct of viewedProductsArray) {
          let extractedProduct = await Product.findOne({ 'colors.sizes.variantId': viewedProduct });
          extractedProductsArray.push(extractedProduct);
        }
      }

      //finding products similar in features to selected product
      const extractedProductsOfSimilarColor = await Product.find({ 'colors.type': extractedColorObj.type, 'colors.sizes.variantId': { $ne: params.slug[2] } });

        //finding related/grouped products of selected product
      let carts = await Cart.find({ 'items.productId': product._id });
      if(carts.length > 0){
        for (let cart of carts) {
          let updatedCart = await cart.populate('items.productId');
          const products = updatedCart.items.map((item: any) => ({ ...item.productId._doc }));
          updatedProducts.push(...products);
        }
      }

      updatedProducts = [...updatedProducts, ...extractedProductsArray, ...extractedProductsOfSimilarColor];

       //removing duplicates and storing them
      const relatedProducts = updatedProducts.filter((prod: any) => prod._id.toString() !== product._id.toString());

      //getting product reviews
      const updatedProduct = await product.populate('reviews.reviewId');

      const reviews = updatedProduct.reviews.map((review: any) => ({...review.reviewId._doc}));

      for (let review of reviews){
        const user = await User.findById(review.author.authorId);
        authors.push(user);
      }

      const updatedReviews = reviews.map((review: any) => {
        const extractedAuthor = authors.find(author => author._id.toString() === review.author.authorId.toString());

        return {
          ...review,
          author: extractedAuthor
        };
      });
      //sorting reviews with the most likes in descending order
      reviews.sort((a: any, b: any) => b.likes - a.likes);;
      
      return NextResponse.json({
        productSizes: extractedColorObj.sizes,
        productFrontBase64Images: extractedColorObj.imageFrontBase64,
        productId: product._id.toString(),
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

