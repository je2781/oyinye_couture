import { connect } from '@/db/config';
import Filter from '@/models/filter';
import Order from '@/models/order';
import Product from '@/models/product';
import User from '@/models/user';
import { NextResponse, type NextRequest } from 'next/server';

connect();
 
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
    try {

        const searchParams = request.nextUrl.searchParams;
        let query = searchParams.get('q');
        let page = searchParams.get('page');
        let sort = searchParams.get('sort_by');
        let gte = searchParams.get('filter.v.price.gte');
        let lte = searchParams.get('filter.v.price.lte');
        let availability = searchParams.get('filter.v.availability');
        let productType = searchParams.get('filter.p.product_type');
        const updatedPage = +page! || 1;
        const ITEMS_PER_PAGE = 21;
        let priceList: number[] = [];
      
        let filterSettings = [];
      
        let totalItems =  await Product.find().countDocuments();
        let products = await Product.find({title: new RegExp(`\\b${query}[^\\s]*$`, 'i')})
        .skip((updatedPage-1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);

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
          filterSettings =  await Filter.find();
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
            color.sizes.sort((a: any, b: any) => a.number - b.number);
          }
        }


        //sorting products according to price
        switch (sort) {
          case 'price-descending':
            products.sort((a, b) => {
              return b.colors[0].sizes[0].price - a.colors[0].sizes[0].price;
            });

            break;
          case 'price-ascending':
            products.sort((a, b) => {
              return a.colors[0].sizes[0].price - b.colors[0].sizes[0].price;
            });
            break;
        
          default:
            for(let product of products){
              let noOfOrders = await Order.find({'items.product._id': product._id}).countDocuments();
    
              product.set('noOfOrders', noOfOrders, { strict: false });
            }
    
            products.sort((a, b) => {
              if (b.noOfOrders === a.noOfOrders) {
                return b.reviews.length - a.reviews.length;
              }
              return b.noOfOrders - a.noOfOrders;
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
      
      const newProduct = new Product({
        ...reqBody
      });    
      
      await newProduct.save();

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