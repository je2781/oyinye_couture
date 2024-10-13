import {
  BelongsToGetAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToSetAssociationMixin,
  CreationOptional,
  DataTypes,
  ForeignKey,
  HasManyGetAssociationsMixin,
  HasOneGetAssociationMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import Review from "./review";
import OrderItem from "./orderItem";
import Product from "./product";
import User from "./user";
import sequelize from "@/db/connection";


class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
  declare id: string;
  declare payment_info: CreationOptional<any>;
  declare status: CreationOptional<string>;
  declare sales: number;
  declare items: CreationOptional<OrderItem[]>;
  declare shipping_method: CreationOptional<string>;
  declare payment_type: CreationOptional<string>;
  declare payment_status: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare getUser: BelongsToGetAssociationMixin<User>;
  declare setUser: BelongsToSetAssociationMixin<User, string>;

  static associate(models: any){
    Order.belongsTo(models.User);

  }
  // ...
}


Order.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  items: DataTypes.ARRAY(DataTypes.JSONB),
  sales: DataTypes.DOUBLE,
  status: DataTypes.STRING,
  payment_info: DataTypes.JSONB,
  shipping_method: DataTypes.STRING,
  payment_type: DataTypes.STRING,
  payment_status: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
},{
  tableName: "orders",
  sequelize,
  timestamps: true,
});


export default Order;
