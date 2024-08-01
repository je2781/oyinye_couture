import { connect } from "@/db/config";
import { getDataFromCart } from "@/helpers/getDataFromCart";
import Cart from "@/models/cart";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(req: NextRequest, { params }: { params: { slug?: string[] } }) {
    try {

      if(params.slug){

        //retrieving cart data for the current public session
        const cart = await Cart.findById(mongoose.Types.ObjectId.createFromHexString(params.slug[0]));
    
    
        if (cart) {
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
      
      if(params.slug){

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
          
          const remainingMilliseconds = 2629746000; // 1 month
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
          const newObjectId = mongoose.Types.ObjectId.createFromHexString(cartId);

          //retrieving cart data for the current public session
          const cart = await Cart.findById(newObjectId);
          
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
  