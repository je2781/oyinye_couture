
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse, type NextRequest } from 'next/server';
import { Op} from 'sequelize';
import { initializeSequelize } from '@/admin/src/db/connection';

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});



export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
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

    const priceList: number[] = [];
    const filterSettings: any[] = [];
    const ITEMS_PER_PAGE = 21;

    if(qParams.slug === 'search'){

      const searchParams = request.nextUrl.searchParams;
      const query = searchParams.get('q');
      const page = searchParams.get('page');
      const sort = searchParams.get('sort_by');
      const gte = searchParams.get('filter.v.price.gte');
      const lte = searchParams.get('filter.v.price.lte');
      const availability = searchParams.get('filter.v.availability');
      const productType = searchParams.get('filter.p.product_type');
      const updatedPage = +page! || 1;
      

      const totalItems = await models.Product.count({
        where: {
          [Op.and]: [
            {
              title: {
                [Op.like]: `% %${query}%`
              }
            },
            { is_hidden: false },
          ],
        }
      });
      

      let products = await models.Product.findAll({
        where: {
          [Op.and]: [
            {
              title: {
                [Op.like]: `%${query}%`
              }
            },
            { is_hidden: false },
          ],
        },
        offset: (updatedPage - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      });


      if (productType) {
        products = products.filter(product => product.type === productType);
      }

      for (const product of products) {
        for (const color of product.colors) {
          color.sizes.forEach((size: any) => priceList.push(size.price));
        }
      }

      const highestPrice = Math.max(...priceList);

      const currentPage = updatedPage;
      const hasPreviousPage = currentPage > 1;
      const hasNextPage = totalItems > currentPage * ITEMS_PER_PAGE;
      const lastPage = Math.ceil(totalItems / ITEMS_PER_PAGE);

      if (products.length === 0) {
        return NextResponse.json(
          {
            products,
            hasNextPage,
            hasPreviousPage,
            lastPage,
            currentPage,
            isActivePage: updatedPage,
            nextPage: currentPage + 1,
            previousPage: currentPage - 1,
            filterSettings,
            highestPrice
          },
          { status: 200 }
        );
      }

      // Filtering products based on price range
      if (lte) {
        for (const product of products) {
          for (const color of product.colors) {
            color.sizes = color.sizes.filter((size: any) => size.price <= parseInt(lte));
          }
        }
      }

      if (gte) {
        for (const product of products) {
          for (const color of product.colors) {
            color.sizes = color.sizes.filter((size: any) => size.price >= parseInt(gte));
          }
        }
      }

      if (gte && lte) {
        for (const product of products) {
          for (const color of product.colors) {
            color.sizes = color.sizes.filter((size: any) => (size.price >= parseInt(gte) && size.price <= parseInt(lte)));
          }
        }
      }

      // Sorting sizes and checking availability
      for (const product of products) {
        for (const color of product.colors) {
          if (availability) {
            color.sizes = color.sizes.filter((size: any) => size.stock > 0);
          }
          color.sizes.sort((a: any, b: any) => (a?.number || 0) - (b?.number || 0));
        }
      }

      // Sorting products according to price
      switch (sort) {
        case 'price-descending':
          products.sort((a, b) => (b.colors?.[0]?.sizes?.[0]?.price || 0) - (a.colors?.[0]?.sizes?.[0]?.price || 0));
          break;
        case 'price-ascending':
          products.sort((a, b) => (a.colors?.[0]?.sizes?.[0]?.price || 0) - (b.colors?.[0]?.sizes?.[0]?.price || 0));
          break;
        default:
          for (const product of products) {
            const noOfOrders = await models.Order.count({
              where: {
                items: {
                  [Op.contains]: [{ product: { id: product.id } }]
                }
              }
            });
            product.setDataValue('no_of_orders', noOfOrders);
          }
          products.sort((a, b) => {
            if (b.no_of_orders === a.no_of_orders) {
              return b.collated_reviews.length - a.collated_reviews.length;
            }
            return b.no_of_orders - a.no_of_orders;
          });
          break;
      }

      return NextResponse.json({
        products,
        hasNextPage,
        hasPreviousPage,
        lastPage,
        currentPage,
        isActivePage: updatedPage,
        nextPage: currentPage + 1,
        previousPage: currentPage - 1,
        highestPrice,
        success: true
      }, { status: 200 });
    }

    
  } catch (error: any) {
    console.log('fetching results failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

 
// export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
//     try {

//       const ip = request.headers.get('x-forwarded-for');

//       const { success, limit, remaining, reset } = await ratelimit.limit(String(ip));

//       if (!success) {
//         const res = NextResponse.json(
//           { message: 'Rate limit exceeded' },
//           { status: 429 }
//         );
//         res.headers.set('X-RateLimit-Limit', limit.toString());
//         res.headers.set('X-RateLimit-Remaining', remaining.toString());
//         res.headers.set('X-RateLimit-Reset', reset.toString());
//         return res;
//       }

//       const reqBody = await request.json();

//       await models.Product.create({
//         ...reqBody
//       });    
      
//       return NextResponse.json({
//         message: 'New product created!',
//         success: true
//       }, {
//         status: 201
//       });
       
//     } catch (error: any) {
//       return NextResponse.json(
//         {
//           error: error.message,
//         },
//         { status: 500 }
//       );
//     }
// }
 
// export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
//     try {

//       const ip = request.headers.get('x-forwarded-for');

//       const { success, limit, remaining, reset } = await ratelimit.limit(String(ip));

//       if (!success) {
//         const res = NextResponse.json(
//           { message: 'Rate limit exceeded' },
//           { status: 429 }
//         );
//         res.headers.set('X-RateLimit-Limit', limit.toString());
//         res.headers.set('X-RateLimit-Remaining', remaining.toString());
//         res.headers.set('X-RateLimit-Reset', reset.toString());
//         return res;
//       }

//       const reqBody = await request.json();
      
//       await models.Product.update({
//         ...reqBody
//       },{
//         where: {
//           id: params.slug
//         }
//       });    
      
//       return NextResponse.json({
//         message: 'product updated!',
//         success: true
//       }, {
//         status: 201
//       });
       
//     } catch (error: any) {
//       return NextResponse.json(
//         {
//           error: error.message,
//         },
//         { status: 500 }
//       );
//     }
// }
 