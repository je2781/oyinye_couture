import { connect } from "@/db/config";
import Filter from "@/models/filter";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(req: NextRequest) {
  try {

    const reqBody = await req.json();
    const searchParams = req.nextUrl.searchParams;
    let type = searchParams.get('type');

    const { noOfFilters, isVisible, showOutOfStock, productType, priceRange, currentPriceBoundary, color, customProp } = reqBody;


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
      if(type === 'collections'){

        await Filter.updateMany(
          {},
          {
            $set: {
              collections: {
                color,
                noOfFilters,
                isVisible,
                customProperty: customProp
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
      if(type === 'collections'){
        const newSettings = new Filter({
          collections: {
              color,
              noOfFilters,
              isVisible,
              customProperty: customProp
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
