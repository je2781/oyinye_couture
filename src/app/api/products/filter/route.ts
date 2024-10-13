import Filter from "@/models/filter";
import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {

    const reqBody = await req.json();
    const searchParams = req.nextUrl.searchParams;
    let type = searchParams.get('type');

    const { noOfFilters, isVisible, showOutOfStock, productType, priceRange, currentPriceBoundary, color, customProp } = reqBody;


    const filterSettings = await Filter.findAll();


    if (filterSettings.length > 0) {
      if(type === 'search'){

        await Filter.update(
          {
            search: {
              noOfFilters,
              isVisible,
              showOutOfStock,
              productType,
              priceRange,
              currentPriceBoundary
            }
          },
          {
            where: {}
          }
        );
        
      }
      if(type === 'collections'){

        await Filter.update(
          {
            collections: {
              color,
              noOfFilters,
              isVisible,
              customProperty: customProp
            }
            
          },
          {
            where: {}
          }
        );
      }
    } else {
      if(type === 'search'){
        const newSettings = await Filter.create({
            id: (await crypto.randomBytes(6)).toString("hex"),
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
        const newSettings = await Filter.create({
          id: (await crypto.randomBytes(6)).toString("hex"),
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
