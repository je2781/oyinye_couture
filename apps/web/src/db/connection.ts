import { Sequelize } from "sequelize";
import { SequelizeOptions } from "sequelize-typescript";
import Cart from "@/web/src/models/cart";
import User from "@/web/src/models/user";
import Review from "@/web/src/models/review";
import Order from "@/web/src/models/order";
import Enquiry from "@/web/src/models/enquiries";
import Visitor from "@/web/src/models/visitor";
import Product from "@/web/src/models/product";
import Filter from "@/web/src/models/filter";

const env = process.env.NODE_ENV || "development";

export async function initializeSequelize() {
  const configModule = await import("./config/config.mjs");
  const dbOptions = configModule.default[env] as SequelizeOptions;

  dbOptions.dialectModule = require("pg"); // Or pg if using Postgres

  const sequelize = new Sequelize(dbOptions);

  const models = {
    User: User.initModel(sequelize),
    Product: Product.initModel(sequelize),
    Enquiry: Enquiry.initModel(sequelize),
    Filter: Filter.initModel(sequelize),
    Order: Order.initModel(sequelize),
    Cart: Cart.initModel(sequelize),
    Review: Review.initModel(sequelize),
    Visitor: Visitor.initModel(sequelize),
  };
  
  Cart.associate(models);
  User.associate(models);
  Review.associate(models);
  Product.associate(models);
  Order.associate(models);
  Enquiry.associate(models);

  // Sync models with DB
  await sequelize.sync({ alter: env === "development" });

  return { sequelize, models };
}



