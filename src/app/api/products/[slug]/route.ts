
import { models } from '@/db/connection';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse, type NextRequest } from 'next/server';
import { Op, Sequelize} from 'sequelize';

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});



export async function GET(request: NextRequest, { params }: { params: { slug: string } }, res: NextResponse) {
  try {

    const ip = request.headers.get('x-forwarded-for');

    const { success, limit, remaining, reset } = await ratelimit.limit(String(ip));

    if (!success) {
      const res = NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
      res.headers.set('X-RateLimit-Limit', limit.toString());
      res.headers.set('X-RateLimit-Remaining', remaining.toString());
      res.headers.set('X-RateLimit-Reset', reset.toString());
      return res;
    }

    let priceList: number[] = [];
    let filterSettings: any[] = [];
    const ITEMS_PER_PAGE = 21;

    if(params.slug === 'search'){

      const searchParams = request.nextUrl.searchParams;
      let query = searchParams.get('q');
      let page = searchParams.get('page');
      let sort = searchParams.get('sort_by');
      let gte = searchParams.get('filter.v.price.gte');
      let lte = searchParams.get('filter.v.price.lte');
      let availability = searchParams.get('filter.v.availability');
      let productType = searchParams.get('filter.p.product_type');
      const updatedPage = +page! || 1;
      

      let totalItems = await models.Product.count({
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
                [Op.like]: `% %${query}%`
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

      for (let product of products) {
        for (let color of product.colors) {
          color.sizes.forEach((size: any) => priceList.push(size.price));
        }
      }

      const highestPrice = Math.max(...priceList);

      if (availability || lte || gte || productType) {
        filterSettings = await models.Filter.findAll();
      }

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
        for (let product of products) {
          for (let color of product.colors) {
            color.sizes = color.sizes.filter((size: any) => size.price <= parseInt(lte));
          }
        }
      }

      if (gte) {
        for (let product of products) {
          for (let color of product.colors) {
            color.sizes = color.sizes.filter((size: any) => size.price >= parseInt(gte));
          }
        }
      }

      if (gte && lte) {
        for (let product of products) {
          for (let color of product.colors) {
            color.sizes = color.sizes.filter((size: any) => (size.price >= parseInt(gte) && size.price <= parseInt(lte)));
          }
        }
      }

      // Sorting sizes and checking availability
      for (let product of products) {
        for (let color of product.colors) {
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
          for (let product of products) {
            let noOfOrders = await models.Order.count({
              where: {
                items: {
                  [Op.contains]: [{ product: { id: product.id } }]
                }
              }
            });
            product.setDataValue('no_of_orders', noOfOrders);
          }
          products.sort((a, b) => (b.no_of_orders - a.no_of_orders) || (b.collated_reviews.length - a.collated_reviews.length));
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
        filterSettings,
        highestPrice,
        success: true
      }, { status: 200 });
    }

    if(params.slug === 'collections'){
      const searchParams = request.nextUrl.searchParams;
      let products: any[] = [];
      let totalItems = 0;
      let page = searchParams.get('page');
      let sort = searchParams.get('sort_by');
      let dressColor = searchParams.get('filter.p.m.custom.colors');
      let dressFeature = searchParams.get('filter.p.m.custom.feature');
      let dressLength = searchParams.get('filter.p.m.custom.dress_length');
      let fabric = searchParams.get('filter.p.m.custom.fabric');
      let neckLine = searchParams.get('filter.p.m.custom.neckline');
      let sleeveLength = searchParams.get('filter.p.m.custom.sleeve_length');
      const updatedPage = +page! || 1;
    
      if(dressColor){
        totalItems =  await models.Product.count({
          where: {
            colors: {
              [Op.contains]: [{ type: { en: dressColor} }]
            },
            is_hidden: false
          }
        });
        products = await models.Product.findAll({ 
          where: {
            colors: {
              [Op.contains]: [{ type: { en: dressColor} }]
            },
            is_hidden: false
          },
          offset: (updatedPage-1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
        });
      }else if(dressFeature){
        totalItems =  await models.Product.count({
          where: {
            features: {
              [Op.contains]: [dressFeature]
            },
            is_hidden: false

          }
        });
        products = await models.Product.findAll({ 
          where: {
            features: {
              [Op.contains]: [dressFeature]
            },
            is_hidden: false

          },
          offset: (updatedPage-1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
        });
      }else if(dressLength){
        totalItems =  await models.Product.count({
          where: {
            features: {
              [Op.contains]: [dressLength]
            },
            is_hidden: false

          }
        });
        products = await models.Product.findAll({ 
          where: {
            features: {
              [Op.contains]: [dressLength]
            },
            is_hidden: false

          },
          offset: (updatedPage-1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
        });
      }else if(fabric){
        totalItems =  await models.Product.count({
          where: {
            features: {
              [Op.contains]: [fabric]
            },
            is_hidden: false

          }
        });
        products = await models.Product.findAll({ 
          where: {
            features: {
              [Op.contains]: [fabric]
            },
            is_hidden: false

          },
          offset: (updatedPage-1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
        });
      }else if(neckLine){
        totalItems =  await models.Product.count({
          where: {
            features: {
              [Op.contains]: [neckLine]
            },
            is_hidden: false

          }
        });
        products = await models.Product.findAll({ 
          where: {
            features: {
              [Op.contains]: [neckLine]
            },
            is_hidden: false

          },
          offset: (updatedPage-1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
        });
      }else if(sleeveLength){
        totalItems =  await models.Product.count({
          where: {
            features: {
              [Op.contains]: [sleeveLength]
            },
            is_hidden: false

          }
        });
        products = await models.Product.findAll({ 
          where: {
            features: {
              [Op.contains]: [sleeveLength]
            },
            is_hidden: false

          },
          offset: (updatedPage-1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
        });
      }else{
        totalItems =  await models.Product.count({
          where: {
            is_hidden: false
          }
        });
        products = await models.Product.findAll({ 
          offset: (updatedPage-1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
          where: {
            is_hidden: false
          }
        });
      }
      
      //retrieving filter settings
      if(dressColor || dressFeature || dressLength || fabric || neckLine || sleeveLength){
        filterSettings =  await models.Filter.findAll();
      }

      const currentPage = updatedPage;
      const hasPreviousPage = currentPage > 1;
      const hasNextPage =
          totalItems > currentPage * ITEMS_PER_PAGE;
      const lastPage = 
           Math.ceil(totalItems / ITEMS_PER_PAGE);

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
          },
          { status: 200 }
        );
      }

      //sorting products
      switch (sort) {
        case 'created-ascending':
          products.sort((a, b) => {
            const productA = new Date(a.createdAt).getTime();  
            const productB = new Date(b.createdAt).getTime();
            return productA - productB;
          });
          break;
        case 'created-descending':
          products.sort((a, b) => {
            const productA = new Date(a.createdAt).getTime();  
            const productB = new Date(b.createdAt).getTime();
            return productB - productA;
          });
          break;
        case 'title-descending':
          products.sort((a, b) => {
            return b.title.charAt(0).localeCompare(a.title.charAt(0));

          });
          break;
        case 'title-ascending':
          products.sort((a, b) => {
            return a.title.charAt(0).localeCompare(b.title.charAt(0));
          });
          break;
        case 'price-descending':
          products.sort((a, b) => {
            const priceA = a.colors?.[0]?.sizes?.[0]?.price || 0;  
            const priceB = b.colors?.[0]?.sizes?.[0]?.price || 0;
            return priceB - priceA;
          });
          break;
        case 'price-ascending':
          products.sort((a, b) => {
            const priceA = a.colors?.[0]?.sizes?.[0]?.price || 0;
            const priceB = b.colors?.[0]?.sizes?.[0]?.price || 0;
            return priceA - priceB;
          });
          break;
        case 'best-selling':
          for(let product of products){
            let noOfOrders = await models.Order.count({
              where: {
                items: {
                  [Op.contains] : [{product: {id: product.id}}]
                }
              }
            });
  
            product.setDataValue('no_of_orders', noOfOrders);
          }
  
          products.sort((a, b) => {
            if (b.no_of_orders === a.no_of_orders) {
              return b.reviews.length - a.reviews.length;
            }
            return b.no_of_orders - a.no_of_orders;
          });

          break;
      
        default:
          products = products.filter((product: any) => product.isFeature === true);

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
        filterSettings,
        success: true
      }, {
        status: 200
      });
    }
    
  } catch (error: any) {
    console.log('fetching results failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

 
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
    try {

      const ip = request.headers.get('x-forwarded-for');

      const { success, limit, remaining, reset } = await ratelimit.limit(String(ip));

      if (!success) {
        const res = NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
        res.headers.set('X-RateLimit-Limit', limit.toString());
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());
        return res;
      }

      const reqBody = await request.json();

      await models.Product.create({
        ...reqBody
      });    
      
      return NextResponse.json({
        message: 'New product created!',
        success: true
      }, {
        status: 201
      });
       
    } catch (error: any) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }
}
 
export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
    try {

      const ip = request.headers.get('x-forwarded-for');

      const { success, limit, remaining, reset } = await ratelimit.limit(String(ip));

      if (!success) {
        const res = NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
        res.headers.set('X-RateLimit-Limit', limit.toString());
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());
        return res;
      }

      const reqBody = await request.json();
      
      await models.Product.update({
        ...reqBody
      },{
        where: {
          id: params.slug
        }
      });    
      
      return NextResponse.json({
        message: 'product updated!',
        success: true
      }, {
        status: 201
      });
       
    } catch (error: any) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }
}
 