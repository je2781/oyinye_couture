import { models } from '@db/connection';
import { getDataFromCart } from '@helpers/getDataFromCart';
import { getDataFromOrder } from '@helpers/getDataFromOrder';
import { getUserData } from '@helpers/getUserData';
import { sanitizeInput } from '@helpers/sanitize';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import axios from 'axios';
import { NextResponse, type NextRequest } from 'next/server';

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});


export async function GET(request: NextRequest, { params }: { params: { slug?: string[] } }, res: NextResponse) {
  try {

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

      if(params.slug){
        const searchParams = request.nextUrl.searchParams;
        let page = searchParams.get('page');
        const updatedPage = +page! || 1;
        const ITEMS_PER_PAGE = +params.slug[0];
      
        let totalItems = (await models.Order.findAndCountAll()).count;
        let orders = await models.Order.findAll({
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
 


