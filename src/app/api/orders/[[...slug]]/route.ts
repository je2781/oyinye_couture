import { models } from '@/db/connection';
import { getDataFromCart } from '@/helpers/getDataFromCart';
import { getDataFromOrder } from '@/helpers/getDataFromOrder';
import { sendMail } from '@/helpers/mailer';
import { EmailType } from '@/interfaces';
import axios from 'axios';
import { NextResponse, type NextRequest } from 'next/server';


export async function GET(request: NextRequest, { params }: { params: { slug?: string[] } }) {
  try {

      if(params.slug){
        const searchParams = request.nextUrl.searchParams;
        let page = searchParams.get('page');
        const updatedPage = +page! || 1;
        const ITEMS_PER_PAGE = +params.slug[0];
      
        let totalItems = (await models.Order.findAndCountAll()).count;
        let orders = await models.Order.findAll({
          offset: (updatedPage-1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
        });

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

        const updatedOrders = orders.map((order) => ({
            id: order.id,
            items: order.items.map(item => {
              let price: number = 0;
              let frontBase64Images: string[] = [];
              let colorType: string  = '';
              let size: number = 0;
              item.product.colors.forEach((color: any) => {
                if(color.sizes.find((size: any) => size.variant_id === item.variant_id)){
                  price = color.sizes.find((size: any) => size.variant_id === item.variant_id).price;
                  size = color.sizes.find((size: any) => size.variant_id === item.variant_id).number;
                  frontBase64Images = color.image_front_base64;
                  colorType = color.type;
                }
              });
              return {
                quantity: item.quantity,
                variantId: item.variant_id,
                productType: item.product.type,
                total: price * item.quantity,
                frontBase64Images,
                color: colorType,
                size
              };
            }),
            totalQuantity: order.items.map(item => item.quantity).reduce((prev: number, current: number) => prev + current, 0),
            sales: order.sales,
            date: order.createdAt,
            status: order.status,
            paymentType: order.payment_type ?? '',
            paymentStatus: order.payment_status ?? '',
            shippingMethod: order.shipping_method ?? ''
        }));


        return NextResponse.json({
            hasNextPage,
            hasPreviousPage,
            lastPage,
            currentPage,
            isActivePage: updatedPage,
            nextPage: currentPage + 1,
            previousPage: currentPage - 1,
            orders: updatedOrders,
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
      const order = await models.Order.findByPk(orderId);


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
                throw new Error("No order has been created");
              }

            }else{

              if (order) {
                order.payment_info = res.data;
                order.payment_status = 'failed';
      
                await order.save();

                return NextResponse.json({
                  message: res.data.ResponseDescription
                }, {
                  status: 200
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
              order.payment_status = paymentStatus;
    
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
          case 'reminder':
            const {items} = await request.json();
            const cartId = getDataFromCart(request);

            if(cartId){
              const cart = await models.Cart.findByPk(cartId);
              const extractedUser = await cart!.getUser();
              //sending cart reminder
              await sendMail({
                emailType: EmailType.request,
                email: extractedUser.email,
                emailBody: {
                  link: `${process.env.DOMAIN}/cart`,
                  id: cartId,
                  total: cart!.total_amount,
                  items
                }
              });

              return NextResponse.json({
                message: 'cart reminder sent',
                success: true
              }, {
                status: 201
              });
            }else{
              return NextResponse.json({
                message: 'invalid cart id',
                success: false
              }, {
                status: 200
              })
            }

            
        
          case 'payment-request':
            const {link, id, total} = await request.json();

            if (order) {
              let user = await order.getUser();
              await sendMail({
                email: user.email,
                userId: user.id,
                emailType: EmailType.request,
                emailBody: {
                  link,
                  id,
                  total
                }
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

        const extractedUser = await models.User.findOne({
          where: {email: userEmail}
        });


        if (order && extractedUser) {
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
            message: 'no user has created an order',
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
 

