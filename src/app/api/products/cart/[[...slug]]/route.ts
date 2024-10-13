import { getDataFromCart } from "@/helpers/getDataFromCart";
import Cart from "@/models/cart";
import Order from "@/models/order";
import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';
import CartItem from "@/models/cartItem";
import Product from "@/models/product";
import User from "@/models/user";


export async function GET(req: NextRequest, { params }: { params: { slug?: string[] } }) {
    try {


        if (params.slug![0]) {
          let cart = await Cart.findByPk(params.slug![0]);


          const cartItems = cart!.items.map((item, i) => {
            return {
              product: item.product,
              quantity: item.quantity,
              variantId: item.variant_id,
            };
          });
  
          return NextResponse.json(
            {
              cartItems,
              total: cart!.total_amount,
              success: true,
            },
            {
              status: 200,
            }
          );
        }else{
          throw new Error('Invalid cart id');
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
      

      if(params.slug![0] === 'remove'){

        const reqBody = await req.json();
        const { quantity, variantId, price} = reqBody;

        const cartId = getDataFromCart(req);
    
        if (cartId) {
            //retrieving cart data for the current public session
            const cart = await Cart.findByPk(cartId);
      
            await cart!.deductFromCart(variantId, quantity, price);

            const updatedCartItems = cart!.items.filter(item => item.quantity > 0);

            cart!.items = updatedCartItems;

            await cart!.save();

            //checking for empty cart
            if(cart!.items.length === 0){
              //removing cart document from database and clearing its cookie from browser
             const cart =  await Cart.findByPk(cartId);

             await cart!.destroy();
                  
              const res =  NextResponse.json(
                {
                  message: "Cart updated successfully",
                  totalAmount: 0,
                  items: [],
                  success: true,
                },
                { status: 201 }
              );

              res.cookies.set('cart', '', {
                httpOnly: true,
                path: '/',
                maxAge: 0
              });
              return res;
            }

            const cartItems = cart!.items.map((item, i) => {
              return {
                product: item.product,
                quantity: item.quantity,
                variantId: item.variant_id,
              };
            });

            return NextResponse.json(
                {
                  message: "Cart updated successfully",
                  totalAmount: cart!.total_amount,
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
          
          const product = await Product.findByPk(id);

          if (!cartId) {
            
            const newCart = await Cart.create({ 
              id: (await crypto.randomBytes(6)).toString("hex"),
              items: [
                  CartItem.build({
                    id: (await crypto.randomBytes(6)).toString("hex"),
                    variant_id: variantId,
                    quantity: parseInt(quantity),
                    product: product!
                  }
                )
              ],
              total_amount: totalAmount
             });

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
            
            res.cookies.set("cart", newCart.id, {
              expires: expiryDate,
              secure: process.env.NODE_ENV === 'production',
              path: '/'
            });
            
            return res;
          }else{

              //retrieving cart data for the current public session
              const cart = await Cart.findByPk(cartId);
              
              await cart!.addToCart(
                product!,
                parseInt(quantity),
                variantId,
                parseInt(price)
                );
    
              const cartItems = cart!.items.map((item, i) => {
                return {
                  product: item.product,
                  quantity: item.quantity,
                  variantId: item.variant_id,
                };
              });
            
                return NextResponse.json(
                  {
                    message: "Cart updated successfully",
                    totalAmount: cart!.total_amount,
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

  
  export async function PATCH(req: NextRequest, { params }: { params: { slug?: string[] } }) {
    try {
      

        const reqBody = await req.json();
        const { userId} = reqBody;
    
        const cartId = getDataFromCart(req);

    
        if (cartId && userId) {
            //creating checkout session token
            const buffer = await crypto.randomBytes(32);
            const hashedToken = buffer.toString("hex");

            const remainingMilliseconds = 5184000000; // 2 month
            const now = new Date();
            const expiryDate = new Date(now.getTime() + remainingMilliseconds);

            //retrieving cart data for the current public session and storing user data
            const cart = await Cart.findByPk(cartId);

            const user = await User.findByPk(userId);
            await cart!.setUser(user!);

            //creating add to cart state in order
            let orderId = (await crypto.randomBytes(6)).toString("hex");

            const newOrder = await Order.create({ 
              id: orderId,
              status: 'add to cart',
              sales: cart!.total_amount
             });

            await newOrder.setUser(user!);

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
              secure: process.env.NODE_ENV === 'production',
            });
      
            res.cookies.set("order", newOrder.id, {
              expires: expiryDate,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
            });
      
            res.cookies.set("user", userId, {
              expires: expiryDate,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
            });
      

            return res;
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
  

