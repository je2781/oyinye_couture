import { getDataFromCart } from 'packages/utils/getDataFromCart';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse, type NextRequest } from 'next/server';
import { getDataFromOrder } from 'packages/utils/getDataFromOrder';
import { initializeSequelize } from '@/admin/src/db/connection';

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});


export async function GET(request: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
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

      if(qParams.slug){
        const searchParams = request.nextUrl.searchParams;
        const page = searchParams.get('page');
        const updatedPage = +page! || 1;
        const ITEMS_PER_PAGE = +qParams.slug[0];
      
        const totalItems = (await models.Order.findAndCountAll()).count;
        const orders = await models.Order.findAll({
          offset: (updatedPage-1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
          include: [{ model: models.User, as: 'orderUser' }]
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

        const updatedOrders = orders.map((order: any) => ({
            id: order.id,
            items: order.items.map((item: any) => {
              let price: number = 0;
              let frontBase64Images: string[] = [];
              let colorType: string  = '';
              let size: number = 0;
              item.product.colors.forEach((color: any) => {
                if(color.sizes.find((size: any) => size.variant_id === item.variant_id)){
                  price = color.sizes.find((size: any) => size.variant_id === item.variant_id).price;
                  size = color.sizes.find((size: any) => size.variant_id === item.variant_id).number;
                  frontBase64Images = color.image_front_base64;
                  colorType = color.names;
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
            totalQuantity: order.items.map((item: any) => item.quantity).reduce((prev: number, current: number) => prev + current, 0),
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
 
 
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
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

    //retrieving order data for the current checkout session
    const order = await models.Order.findByPk(orderId,{
      include: [{ model: models.User, as: 'orderUser' }]
    });


    if(qParams.slug){
      switch (qParams.slug[1]) {
        case 'payment-status':{
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
              status: 404
            });
          }
        }
        case 'reminder':{
          const {items} = await request.json();

          const cartId = getDataFromCart(request);

          if(order && cartId){
            const extractedUser = await models.User.findByPk(order!.user_id);

            return NextResponse.json({
              message: 'cart reminder sent',
              emailJob: {
                email: extractedUser!.email,
                emailBody: {
                  link: `${process.env.ADMIN_DOMAIN!}/cart`,
                  id: cartId,
                  total: order!.sales,
                  items
                }
              },
              success: true
            }, {
              status: 201
            });
          }else{
            return NextResponse.json({
              message: 'invalid cart id',
            }, {
              status: 400
            });
          }

          
        }
        case 'payment-request': {
          const {link, id, total} = await request.json();

          if (order) {
            const user = await models.User.findByPk(order!.user_id);

            return NextResponse.json({
              message: 'payment request sent',
              emailJob: {
                email: user!.email,
                userId: user!.id,
                emailBody: {
                  link,
                  id,
                  total
                }
              },
              success: true
            }, {
              status: 201
            });
          }else{
            return NextResponse.json({
              message: 'No order has been created',
            }, {
              status: 404
            });
          }
        }
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

