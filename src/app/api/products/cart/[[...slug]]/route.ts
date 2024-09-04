import { connect } from "@/db/config";
import { getDataFromCart } from "@/helpers/getDataFromCart";
import Cart from "@/models/cart";
import Order from "@/models/order";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';
import { getVisitData } from "@/helpers/getVisitData";

connect();

export async function GET(req: NextRequest, { params }: { params: { slug?: string[] } }) {
    try {

      if(params.slug){

        //retrieving cart data for the current public session
        let newCartId = mongoose.Types.ObjectId.createFromHexString(params.slug[0]);
        
        
        if (mongoose.Types.ObjectId.isValid(newCartId)) {
          let cart = await Cart.findById(newCartId);

          let updatedCart = await cart.populate('items.productId');

          const cartItems = updatedCart.items.map((cartItem: any) => {
            return {
              product: {...cartItem.productId._doc},
              quantity: cartItem.quantity,
              variantId: cartItem.variantId,
            };
          });
  
          return NextResponse.json(
            {
              cartItems,
              total: cart.totalAmount,
              success: true,
            },
            {
              status: 200,
            }
          );
        }else{
          throw new Error('Invalid cart id');
        }
  
      }
  
     

    } catch (error: any) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }
  }

  export async function POST(req: NextRequest, { params }: { params: { slug?: string[] } }) {
    try {
      
      if(params.slug && params.slug[0] === 'remove'){

        const reqBody = await req.json();
        const { quantity, variantId, price} = reqBody;
    
        const cartId = getDataFromCart(req);
  
        const newObjectId = mongoose.Types.ObjectId.createFromHexString(cartId);
    
        if (mongoose.Types.ObjectId.isValid(newObjectId)) {
            //retrieving cart data for the current public session
            const cart = await Cart.findById(newObjectId);
      
            await cart.removeFromCart(variantId, quantity, price);

            let updatedCart = await cart.populate('items.productId');
            const cartItems = updatedCart.items.map((cartItem: any) => {
              return {
                product: {...cartItem.productId._doc},
                quantity: cartItem.quantity,
                variantId: cartItem.variantId,
              };
            });
        
            return NextResponse.json(
              {
                message: "Cart updated successfully",
                totalAmount: cart.totalAmount,
                items: cartItems,
                success: true,
              },
              { status: 201 }
            );
        }else{
          throw new Error('Invalid cart id');
        }
      }else{
        const reqBody = await req.json();
        const { price, quantity, variantId, id, totalAmount } = reqBody;
    
        const cartId = getDataFromCart(req);
        
        if (cartId.length === 0) {
          const newCart = new Cart({
            items: [
              {
                productId: mongoose.Types.ObjectId.createFromHexString(id),
                variantId,
                quantity,
              },
            ],
            totalAmount,
          });
          
          await newCart.save();
          
          const remainingMilliseconds = 5184000000; // 2 month
          const now = new Date();
          const expiryDate = new Date(
            now.getTime() + remainingMilliseconds
          );
          
          const res = NextResponse.json(
            {
              message: "Cart created successfully",
              success: true,
            },
            { status: 201 }
          );
          
          res.cookies.set("cart", newCart._id.toString(), {
            expires: expiryDate,
            path: '/'
          });
          
          return res;
        }else{
          const newCartId = mongoose.Types.ObjectId.createFromHexString(cartId);

          if(mongoose.Types.ObjectId.isValid(newCartId)){

            //retrieving cart data for the current public session
            const cart = await Cart.findById(newCartId);
            
            await  cart.addToCart({
              price,
              quantity,
                id,
                variantId,
              });
  
              let updatedCart = await cart.populate('items.productId');
              const cartItems = updatedCart.items.map((cartItem: any) => {
                return {
                  product: {...cartItem.productId._doc},
                  quantity: cartItem.quantity,
                  variantId: cartItem.variantId,
                };
              });
          
              return NextResponse.json(
                {
                  message: "Cart updated successfully",
                  totalAmount: cart.totalAmount,
                  items: cartItems,
                  success: true,
                },
                { status: 201 }
              );
          }else{
            throw new Error('invalid cart id');
          }
        }
      }
      
    } catch (error: any) {
      return NextResponse.json(
        {
          error: error.message,
          success: false,
        },
        { status: 500 }
      );
    }
  }

  
  export async function PATCH(req: NextRequest, { params }: { params: { slug?: string[] } }) {
    try {
      
      if(params.slug){

        const reqBody = await req.json();
        const { userId} = reqBody;
    
        const cartId = getDataFromCart(req);

        const newCartId = mongoose.Types.ObjectId.createFromHexString(cartId);
        const newUserId = mongoose.Types.ObjectId.createFromHexString(userId);
    
        if (mongoose.Types.ObjectId.isValid(newCartId) && mongoose.Types.ObjectId.isValid(newUserId)) {
            //creating checkout session token
            const buffer = await crypto.randomBytes(32);
            const hashedToken = buffer.toString("hex");

            const remainingMilliseconds = 5184000000; // 2 month
            const now = new Date();
            const expiryDate = new Date(now.getTime() + remainingMilliseconds);

            //retrieving cart data for the current public session and storing user data
            const cart = await Cart.findById(newCartId);
    
            cart.user.userId = newUserId;

            await cart.save();

            //creating add to cart state in order
            let orderId = (await crypto.randomBytes(6)).toString("hex");

            const newOrder = new Order({
              _id: orderId,
              status: 'add to cart',
              'user.userId': newUserId,
              sales: cart.totalAmount
            });

            await newOrder.save();

            const res = NextResponse.json(
              {
                message: "Order created!",
                checkout_session_token: hashedToken,
                success: true,
              },
              { status: 201 }
            );
      
            res.cookies.set("checkout_session_token", hashedToken, {
              expires: expiryDate,
              httpOnly: true,
            });
      
            res.cookies.set("order", newOrder._id.toString(), {
              expires: expiryDate,
              httpOnly: true,
            });
      
            res.cookies.set("user", userId, {
              expires: expiryDate,
              httpOnly: true,
            });
      

            return res;
        }
      }
      
    } catch (error: any) {
      return NextResponse.json(
        {
          error: error.message,
          success: false,
        },
        { status: 500 }
      );
    }
  }
  
  