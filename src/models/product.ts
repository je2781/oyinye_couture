import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    HasManyAddAssociationMixin,
    HasManyAddAssociationsMixin,
    HasManyGetAssociationsMixin,
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
    declare collated_reviews: CreationOptional<Array<ForeignKey<string>>>;
    declare type: string;
    declare no_of_orders: CreationOptional<number>;
    declare is_hidden: CreationOptional<boolean>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
  
    // ...
    static associate(models:any){
      Product.hasMany(models.Review,{
        foreignKey: 'product_id',
        as: 'reviews'
      });

    }

    static initModel(sequelize: Sequelize){
      return Product.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
          },
        title: DataTypes.STRING,
        is_feature: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        colors: DataTypes.JSONB,
        description: DataTypes.STRING,
        no_of_orders: {
            type: DataTypes.INTEGER
        },
        type: DataTypes.STRING,
        is_hidden: DataTypes.BOOLEAN,
        features: DataTypes.JSONB,
        collated_reviews: DataTypes.JSONB,
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
  