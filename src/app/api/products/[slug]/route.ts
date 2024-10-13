import Filter from '@/models/filter';
import Order from '@/models/order';
import OrderItem from '@/models/orderItem';
import Product from '@/models/product';
import { NextResponse, type NextRequest } from 'next/server';
import { Op } from 'sequelize';


export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
    try {

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
      
        let totalItems =  await Product.count({where: {
          title: {
            [Op.regexp]: `^\\b${query}[^\\s]*$/i`,
          },
          
        },});
        let products = await Product.findAll({
          where: {
            title: {
              [Op.regexp]: `^\\b${query}[^\\s]*$/i`,
            },
            
          },
          offset: (updatedPage-1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
        });
  
        //filtering products by product type
        if(productType){
          products = products.filter(product => product.type === productType);
        }
  
        //getting prices of products to determine the most expensive
        for(let product of products){
          for(let color of product.colors){
            color.sizes.forEach((size: any) => priceList.push(size.price));
          }
        }
        
        const highestPrice = Math.max(...priceList);
  
        //retrieving filter settings
        if(availability || lte || gte || productType){
          filterSettings =  await Filter.findAll();
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
              highestPrice
            },
            { status: 200 }
          );
        }
        
        //filtering products to only show products whose prices fall within a range
        if(lte){
          for(let product of products){
            for(let color of product.colors){
              color.sizes = color.sizes.filter((size: any) => size.price <= parseInt(lte));
            }
          }
        }
        if(gte){
          for(let product of products){
            for(let color of product.colors){
              color.sizes = color.sizes.filter((size: any) => size.price >= parseInt(gte));
            }
          }
        }
        if(gte && lte){
          for(let product of products){
            for(let color of product.colors){
              color.sizes = color.sizes.filter((size: any) => (size.price >= parseInt(gte) && size.price <= parseInt(lte)));
            }
          }
        }
  
  
         //sorting sizes of product in ascending order
        for(let product of products){
          
          for(let color of product.colors){
            //filtering sizes of product to check if in stock
            if(availability){
              color.sizes = color.sizes.filter((size: any) => size.stock > 0);
            }
            color.sizes.sort((a: any, b: any) => (a?.number || 0) - (b?.number || 0));
            
          }
        }
  
  
        //sorting products according to price
        switch (sort) {
          case 'price-descending':
            products.sort((a, b) => {
              const priceA = a.colors?.[0]?.sizes?.[0]?.price || 0;  // Default to 0 if undefined
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
        
          default:
            for(let product of products){
              let noOfOrders = await Order.count({
                include: [{
                  model: OrderItem, // Assuming you have an OrderItem model
                  where: {
                    product_id: product.id // Assuming `product_id` is the field in the OrderItem model
                  }
                }]
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
        }, {
          status: 200
        });
      }

      if(params.slug === 'collections'){
        const searchParams = request.nextUrl.searchParams;
        let products: Product[] = [];
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
          totalItems =  await Product.count({
            where: {
              colors: {
                [Op.contains]: [{ type: dressColor }]
              }
            }
          });
          products = await Product.findAll({ 
            where: {
              colors: {
                [Op.contains]: [{ type: dressColor }]
              }
            },
            offset: (updatedPage-1) * ITEMS_PER_PAGE,
            limit: ITEMS_PER_PAGE,
          });
        }else if(dressFeature){
          totalItems =  await Product.count({
            where: {
              features: {
                [Op.contains]: [dressFeature]
              }
            }
          });
          products = await Product.findAll({ 
            where: {
              features: {
                [Op.contains]: [dressFeature]
              }
            },
            offset: (updatedPage-1) * ITEMS_PER_PAGE,
            limit: ITEMS_PER_PAGE,
          });
        }else if(dressLength){
          totalItems =  await Product.count({
            where: {
              features: {
                [Op.contains]: [dressLength]
              }
            }
          });
          products = await Product.findAll({ 
            where: {
              features: {
                [Op.contains]: []
              }
            },
            offset: (updatedPage-1) * ITEMS_PER_PAGE,
            limit: ITEMS_PER_PAGE,
          });
        }else if(fabric){
          totalItems =  await Product.count({
            where: {
              features: {
                [Op.contains]: [fabric]
              }
            }
          });
          products = await Product.findAll({ 
            where: {
              features: {
                [Op.contains]: [fabric]
              }
            },
            offset: (updatedPage-1) * ITEMS_PER_PAGE,
            limit: ITEMS_PER_PAGE,
          });
        }else if(neckLine){
          totalItems =  await Product.count({
            where: {
              features: {
                [Op.contains]: [neckLine]
              }
            }
          });
          products = await Product.findAll({ 
            where: {
              features: {
                [Op.contains]: [neckLine]
              }
            },
            offset: (updatedPage-1) * ITEMS_PER_PAGE,
            limit: ITEMS_PER_PAGE,
          });
        }else if(sleeveLength){
          totalItems =  await Product.count({
            where: {
              features: {
                [Op.contains]: [sleeveLength]
              }
            }
          });
          products = await Product.findAll({ 
            where: {
              features: {
                [Op.contains]: [sleeveLength]
              }
            },
            offset: (updatedPage-1) * ITEMS_PER_PAGE,
            limit: ITEMS_PER_PAGE,
          });
        }else{
          totalItems =  await Product.count();
          products = await Product.findAll({ 
            offset: (updatedPage-1) * ITEMS_PER_PAGE,
            limit: ITEMS_PER_PAGE,
          });
        }
        
        //retrieving filter settings
        if(dressColor || dressFeature || dressLength || fabric || neckLine || sleeveLength){
          filterSettings =  await Filter.findAll();
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
              let noOfOrders = await Order.count({
                include: [{
                  model: OrderItem,
                  where: {
                    product_id: product.id 
                  }
                }]
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
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }
}
 
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
    try {

      const reqBody = await request.json();
      
      await Product.create({
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