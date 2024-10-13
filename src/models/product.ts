import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    HasManyAddAssociationMixin,
    HasManyAddAssociationsMixin,
    HasManyGetAssociationsMixin,
    HasOneGetAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
  } from "sequelize";
  import Review from "./review";
import sequelize from "@/db/connection";
  
  
  class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
    declare id: string;
    declare is_feature: boolean;
    declare title: string;
    declare features: string[];
    declare colors: any[];
    declare description: string;
    declare reviews: CreationOptional<Array<ForeignKey<string>>>;
    declare type: string;
    declare no_of_orders: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare getReviews: HasManyGetAssociationsMixin<Review>;
    declare addReviews: HasManyAddAssociationsMixin<Review, string>;
    declare addReview: HasManyAddAssociationMixin<Review, string>;
  
    // ...
    static associate(models:any){
      Product.hasMany(models.Review);

    }
  }
  

Product.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_feature: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    colors: DataTypes.ARRAY(DataTypes.JSONB),
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    no_of_orders: {
        type: DataTypes.INTEGER
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    features: DataTypes.ARRAY(DataTypes.STRING),
    reviews: DataTypes.ARRAY(DataTypes.STRING),
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    
}, {
    tableName: "products",
    sequelize,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true,
});


export default Product;
  