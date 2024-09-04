import { connect } from '@/db/config';
import { getDataFromOrder } from '@/helpers/getDataFromOrder';
import { sendMail } from '@/helpers/mailer';
import { EmailType } from '@/interfaces';
import Order from '@/models/order';
import User from '@/models/user';
import axios from 'axios';
import mongoose from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';

connect();


export async function GET(request: NextRequest, { params }: { params: { slug?: string[] } }) {
  try {

      if(params.slug){
        const searchParams = request.nextUrl.searchParams;
        let page = searchParams.get('page');
        const updatedPage = +page! || 1;
        const ITEMS_PER_PAGE = +params.slug[0];

        let totalItems =  await Order.find().countDocuments();
        let orders = await Order.find().skip((updatedPage-1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);

        const currentPage = updatedPage;
        const hasPreviousPage = currentPage > 1;
        const hasNextPage =
            totalItems > currentPage * ITEMS_PER_PAGE;
        const lastPage = 
             Math.ceil(totalItems / ITEMS_PER_PAGE);

        if (orders.length === 0) {
            return NextResponse.json(
              {
                hasNextPage,
                hasPreviousPage,
                lastPage,
                currentPage,
                isActivePage: updatedPage,
                nextPage: currentPage + 1,
                previousPage: currentPage - 1,
                orders
            },
                { status: 200 }
            );
        }

        orders = orders.map((order) => ({
            id: order._id,
            items: order.items.map((item: any) => {
              let price: number | undefined;
              item.product.colors.forEach((color: any) => {
                if(color.sizes.find((size: any) => size.variantId === item.variantId)){
                  price = color.sizes.find((size: any) => size.variantId === item.variantId).price;
                }
              });
              return {
                quantity: item.quantity,
                variantId: item.variantId,
                productType: item.product.type,
                total: price ? price * item.quantity : 0
              };
            }),
            sales: order.sales,
            date: order.createdAt,
            status: order.status,
            paymentType: order.paymentType ?? '',
            paymentStatus: order.paymentStatus ?? '',
            shippingMethod: order.shippingMethod ?? ''
        }));


        return NextResponse.json({
            hasNextPage,
            hasPreviousPage,
            lastPage,
            currentPage,
            isActivePage: updatedPage,
            nextPage: currentPage + 1,
            previousPage: currentPage - 1,
            orders,
            success: true
        }, {
            status: 200
        });
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
 
export async function POST(request: NextRequest, { params }: { params: { slug?: string[] } }) {
    try {
      
      const [orderId, checkoutSessionToken] = getDataFromOrder(request);

      //retrieving order data for the current checkout session
      const order = await Order.findById(orderId);


      if(params.slug){
        switch (params.slug[1]) {
          case 'transaction-status':
            const reqBody = await request.json();
            const {txn_ref, merchant_code, amount} = reqBody;

            const res = await axios.get(`https://webpay.interswitchng.com/collections/api/v1/gettransaction.json?merchantcode=${
              merchant_code
            }&transactionreference=${
            txn_ref
            }&amount=${amount}`);

            if(res.data.ResponseCode === '10' || res.data.ResponseCode === '11' || res.data.ResponseCode === '00'){
              //trimming data object
              delete res.data.ResponseCode;

              if (order) {
                order.paymentInfo = res.data;
                order.paymentStatus = 'paid';
                order.status = 'closed';
      
                await order.save();

                return NextResponse.json({
                  message: res.data.ResponseDescription,
                  success: true
                }, {
                  status: 201
                });
              }else{
                throw new Error("No order has been created");
              }

            }else{

              if (order) {
                order.paymentInfo = res.data;
                order.paymentStatus = 'failed';
      
                await order.save();

                return NextResponse.json({
                  message: res.data.ResponseDescription
                }, {
                  status: 400
                });
              }else{
                return NextResponse.json({
                  message: 'No order has been created',
                  success: false
                }, {
                  status: 200
                });
              }

              
            }
        
          case 'payment-status':
            const {paymentStatus} = await request.json();

            if (order) {
              order.paymentStatus = paymentStatus;
    
              await order.save();

              return NextResponse.json({
                message: 'order updated',
                success: true
              }, {
                status: 201
              });
            }else{
              return NextResponse.json({
                message: 'No order has been created',
                success: false
              }, {
                status: 200
              });
            }
        
          case 'payment-request':
            const {content} = await request.json();

            if (order) {
              let updatedOrder = await order.populate('user.userId');
              const user = {...updatedOrder.user.userId._doc};
              await sendMail({
                email: user.email,
                userId: user._id.toString(),
                emailType: EmailType.request,
                emailBody: content
              });

              return NextResponse.json({
                message: 'payment requst sent',
                success: true
              }, {
                status: 201
              });
            }else{
              return NextResponse.json({
                message: 'No order has been created',
                success: false
              }, {
                status: 200
              });
            }

        }

      
      }else{
        const reqBody = await request.json();
        const {shippingInfo, billingInfo, saveBillingInfo, saveShippingInfo, paymentType, status, paymentStatus, shippingMethod, userEmail} = reqBody;

        const extractedUser = await User.findOne({email: userEmail});

        if (order && extractedUser) {
          order.paymentStatus = paymentStatus;
          order.status = status;
          order.paymentType = paymentType;
          order.shippingMethod = shippingMethod;

          extractedUser.saveBillingInfo = saveBillingInfo;
          extractedUser.saveShippingInfo = saveShippingInfo;
          extractedUser.shippingInfo = shippingInfo;
          extractedUser.billingInfo = billingInfo;
  
          await order.save();
          await extractedUser.save();

          return NextResponse.json({
            message: 'order updated',
            success: true
          }, {
            status: 201
          });
        }else{
          return NextResponse.json({
            message: 'Got back to cart and checkout again',
            success: false
          }, {
            status: 200
          });
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
 

