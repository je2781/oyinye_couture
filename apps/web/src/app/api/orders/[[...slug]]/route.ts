
import { getDataFromOrder } from 'packages/utils/getDataFromOrder';
import { getUserData } from 'packages/utils/getUserData';
import { sanitizeInput } from 'packages/utils/sanitize';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import axios from 'axios';
import { NextResponse, type NextRequest } from 'next/server';
import { initializeSequelize } from '@/web/src/db/connection';

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});

 
export async function POST(request: NextRequest, { params }: { params:Promise<{ slug?: string[] }> }) {
    try {
      const {models} = await initializeSequelize();

      const qParams = await params;

      const ip = request.headers.get('x-forwarded-for');

      const { success, limit, remaining, reset } = await ratelimit.limit(String(ip));

      if (!success) {
        const res = NextResponse.json(
          { message: 'Rate limit exceeded' },
          { status: 429 }
        );
        res.headers.set('X-RateLimit-Limit', limit.toString());
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());
        return res;
      }
      
      const [orderId, checkoutSessionToken] = getDataFromOrder(request);
      const userId = getUserData(request);

      //retrieving order data for the current checkout session
      const order = await models.Order.findByPk(orderId,{
        include: [{ model: models.User, as: 'orderUser' }]
      });


      if(qParams.slug){
        switch (qParams.slug[1]) {
          case 'transaction-status': {
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
                order.payment_info = res.data;
                order.payment_status = 'paid';
                order.status = 'closed';
      
                await order.save();

                return NextResponse.json({
                  message: res.data.ResponseDescription,
                  success: true
                }, {
                  status: 201
                });
              }else{
                return NextResponse.json({
                  message: 'No order has been created',
                  success: false
                }, {
                  status: 404
                });
              }

            }else{

              if (order) {
                order.payment_info = res.data;
                order.payment_status = 'failed';
      
                await order.save();

                return NextResponse.json({
                  message: res.data.ResponseDescription
                }, {
                  status: 201
                });
              }else{
                return NextResponse.json({
                  message: 'No order has been created',
                  success: false
                }, {
                  status: 404
                });
              }

              
            }
          }
        }
      
      }else{
        const reqBody = await request.json();
        const {shippingInfo, billingInfo, saveBillingInfo, saveShippingInfo, paymentType, status, paymentStatus, shippingMethod, userEmail} = reqBody;

        const cleanEmail = sanitizeInput(userEmail);
        const extractedUser = await models.User.findOne({
          where: {email: cleanEmail!}
        });


        if (order && extractedUser) {
          //protecting against unauthorized access
          if(order!.user_id != userId){
            return NextResponse.json({
              message: 'Not Authorized'
            }, {
              status: 401
            });
          }
          
          order.payment_status = paymentStatus;
          order.status = status;
          order.payment_type = paymentType;
          order.shipping_method = shippingMethod;

          extractedUser.save_billing_info = saveBillingInfo;
          extractedUser.save_shipping_info = saveShippingInfo;
          extractedUser.shipping_info = shippingInfo;
          extractedUser.billing_info = billingInfo;
  
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
            message: 'No user has created an order',
            success: false
          }, {
            status: 404
          });
        }

      }
    
      
       
    } catch (error: any) {
      const e = error as Error;
      return NextResponse.json(
        {
          error: e.message,
        },
        { status: 500 }
      );
    }
}
 

