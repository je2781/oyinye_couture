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
    Sequelize,
  } from "sequelize";
  import Review from "./review";
  
  
  class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
    declare id: string;
    declare is_feature: boolean;
    declare title: any;
    declare features: string[];
    declare colors: any[];
    declare description: any;
    declare reviews: CreationOptional<Array<ForeignKey<string>>>;
    declare type: string;
    declare no_of_orders: CreationOptional<number>;
    declare is_hidden: CreationOptional<boolean>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare getReviews: HasManyGetAssociationsMixin<Review>;
    declare addReviews: HasManyAddAssociationsMixin<Review, string>;
    declare addReview: HasManyAddAssociationMixin<Review, string>;
  
    // ...
    static associate(models:any){
      Product.hasMany(models.Review);

    }

    static initModel(sequelize: Sequelize){
      return Product.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
          },
        title: DataTypes.JSONB,
        is_feature: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        colors: DataTypes.JSONB,
        description: DataTypes.JSONB,
        no_of_orders: {
            type: DataTypes.INTEGER
        },
        type: DataTypes.JSONB,
        is_hidden: DataTypes.BOOLEAN,
        features: DataTypes.JSONB,
        reviews: DataTypes.JSONB,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        
    }, {
        tableName: "products",
        sequelize,
        timestamps: true,
    });
    }
  }
  



export default Product;
  