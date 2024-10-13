import sequelize from "@/db/connection";
import { InferAttributes, InferCreationAttributes, CreationOptional, DataTypes, Model, ForeignKey } from "sequelize";
import Product from "./product";


class CartItem extends Model<InferAttributes<CartItem>, InferCreationAttributes<CartItem>> {
    declare id: CreationOptional<string>;
    declare quantity: any;
    declare product: CreationOptional<Product>;
    declare variant_id: string;
  
    // ...
  }
  
CartItem.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product: DataTypes.JSONB,
    variant_id: DataTypes.STRING
}, {
        tableName: "cartItems",
        sequelize,
});

export default CartItem;
