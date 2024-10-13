import sequelize from "@/db/connection";
import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
  } from "sequelize";
  
  
  class Filter extends Model<InferAttributes<Filter>, InferCreationAttributes<Filter>> {
    declare id: string;
    declare search: CreationOptional<any>;
    declare collections: CreationOptional<any>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
  
  }

Filter.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
    search: DataTypes.JSONB,
    collections: DataTypes.JSONB,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
        // search: {
        //     noOfFilters: {
        //         type: Number,
        //     },
        //     isVisible: {
        //         type: Boolean,
        //     },
        //     showOutOfStock: {
        //         type: Boolean,
        //     },
        //     productType: {
        //         type: String,
        //     },
        //     priceRange: {
        //         type: String,
        //     },
        //     currentPriceBoundary: {
        //         type: Number,
        //     }
        // },
        // collections: {
        //     noOfFilters: {
        //         type: Number,
        //     },
        //     isVisible: {
        //         type: Boolean,
        //     },
        //     color: String,
        //     customProperty: {
        //         type: String,
        //         name: String
        //     }
        // }
  
},{
    tableName: "filters",
    sequelize,
});

export default Filter;

