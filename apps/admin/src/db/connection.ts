import { Sequelize } from "sequelize";
import { SequelizeOptions } from "sequelize-typescript";
import { options } from "./config/config.mjs";
import User from "@models/user";
import Order from "@models/order";
import Enquiry from "@models/enquiries";
import Visitor from "@models/visitor";
import Product from "@models/product";

const dbOptions = <SequelizeOptions>options;
dbOptions.dialectModule = require("pg");
const sequelize = new Sequelize(dbOptions);

const models = {
  User: User.initModel(sequelize),
  Product: Product.initModel(sequelize),
  Enquiry: Enquiry.initModel(sequelize),
  Order: Order.initModel(sequelize),
  Visitor: Visitor.initModel(sequelize),
};

User.associate(models);
Product.associate(models);
Order.associate(models);
Enquiry.associate(models);

(async () => await sequelize.sync({ alter: process.env.NODE_ENV === 'development' ? true : false }))();
// `alter: true` modifies the tables to match the model
export { sequelize, models };
