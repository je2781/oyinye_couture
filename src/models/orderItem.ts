import sequelize from "@/db/connection";
import { InferAttributes, InferCreationAttributes, CreationOptional, DataTypes, Model, ForeignKey } from "sequelize";
import Product from "./product";


class OrderItem extends Model<InferAttributes<OrderItem>, InferCreationAttributes<OrderItem>> {
    declare id: CreationOptional<string>;
    declare quantity: number;
    declare product: CreationOptional<Product>;
    declare variant_id: string;
    // ...
  }
  
OrderItem.init({
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
        tableName: "orderItems",
        sequelize,
});

export default OrderItem;
