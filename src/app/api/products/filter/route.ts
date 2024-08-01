import { connect } from "@/db/config";
import Filter from "@/models/filter";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(req: NextRequest) {
  try {

    const reqBody = await req.json();
    const { noOfFilters, isVisible, showOutOfStock, productType, priceRange, currentPriceBoundary } = reqBody;


    const filterSettings = await Filter.find();


    if (filterSettings.length > 0) {
      await Filter.updateMany(
        {},
        {
          $set: {
            noOfFilters,
            isVisible,
            showOutOfStock,
            productType,
            priceRange,
            currentPriceBoundary
          }
        }
      );
    } else {
      const newSettings = new Filter({
        noOfFilters,
        isVisible,
        showOutOfStock,
        productType,
        priceRange,
        currentPriceBoundary
      });

      await newSettings.save();
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
