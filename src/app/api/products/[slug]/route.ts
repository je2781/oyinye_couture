import { connect } from '@/db/config';
import Order from '@/models/order';
import Product from '@/models/product';
import User from '@/models/user';
import { access } from 'fs';
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
        const updatedPage = +page! || 1;
        const ITEMS_PER_PAGE = 21;
      
        let totalItems;
      
        totalItems =  await Product.find().countDocuments();
        const products = await Product.find({title: new RegExp(`\\b${query}[^\\s]*$`, 'i')})
        .skip((updatedPage-1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);

        //sorting sizes of product in ascending order
        for(let product of products){
          for(let color of product.colors){
            color.sizes.sort((a: any, b: any) => a.number - b.number);
          }
        }

        //filtering products to only show products whose prices fall with a range
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
              let noOfReviews = await User.find({'reviews.productId': product._id}).countDocuments();
              let noOfOrders = await Order.find({'items.productId': product._id}).countDocuments();
    
              product.set('noOfOrders', noOfOrders, { strict: false });
              product.set('noOfReviews', noOfReviews, { strict: false });
            }
    
            products.sort((a, b) => {
              if (b.noOfOrders === a.noOfOrders) {
                return b.noOfReviews - a.noOfReviews;
              }
              return b.noOfOrders - a.noOfOrders;
            });

            break;
        }

        if (!products) {
          return NextResponse.json(
            { error: "No products have been uploaded" },
            { status: 404 }
          );
        }

        const currentPage = updatedPage;
        const hasPreviousPage = currentPage > 1;
        const hasNextPage =
            totalItems > currentPage * ITEMS_PER_PAGE;
        const lastPage = 
             Math.ceil(totalItems / ITEMS_PER_PAGE);
      
        return NextResponse.json({
          products,
          hasNextPage,
          hasPreviousPage,
          lastPage,
          currentPage,
          isActivePage: updatedPage,
          nextPage: currentPage + 1,
          previousPage: currentPage - 1,
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