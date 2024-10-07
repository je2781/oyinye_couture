import { connect } from "@/db/config";
import Filter from "@/models/filter";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(req: NextRequest) {
  try {

    const reqBody = await req.json();
    const searchParams = req.nextUrl.searchParams;
    let type = searchParams.get('type');

    const { noOfFilters, isVisible, showOutOfStock, productType, priceRange, currentPriceBoundary, color } = reqBody;


    const filterSettings = await Filter.find();


    if (filterSettings.length > 0) {
      if(type === 'search'){

        await Filter.updateMany(
          {},
          {
            $set: {
              search: {
                noOfFilters,
                isVisible,
                showOutOfStock,
                productType,
                priceRange,
                currentPriceBoundary
              },
            }
          }
          
        );
      }
      if(type === 'collection'){

        await Filter.updateMany(
          {},
          {
            $set: {
              collection: {
                color,
                noOfFilters,
                isVisible
              },
            }
            
          }
        );
      }
    } else {
      if(type === 'search'){
        const newSettings = new Filter({
            search: {
              noOfFilters,
              isVisible,
              showOutOfStock,
              productType,
              priceRange,
              currentPriceBoundary
            }
          
        });
  
        await newSettings.save();
      }
      if(type === 'collection'){
        const newSettings = new Filter({
          collection: {
              color,
              noOfFilters,
              isVisible
            },
        });
  
        await newSettings.save();
      }
    }

    return NextResponse.json(
      {
        message: "filter settings saved successfully",
        success: true,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
