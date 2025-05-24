import { Sequelize } from "sequelize";
import { SequelizeOptions } from "sequelize-typescript";
import User from "@/admin/src/models/user";
import Order from "@/admin/src/models/order";
import Enquiry from "@/admin/src/models/enquiries";
import Visitor from "@/admin/src/models/visitor";
import Product from "@/admin/src/models/product";

const env = process.env.NODE_ENV || "development";

export async function initializeSequelize() {
  const configModule = await import("./config/config.mjs");
  const dbOptions = configModule.default[env] as SequelizeOptions;

  dbOptions.dialectModule = require("pg"); // Or pg if using Postgres

  const sequelize = new Sequelize(dbOptions);

  const models = {
    User: User.initModel(sequelize),
    Enquiry: Enquiry.initModel(sequelize),
    Visitor: Visitor.initModel(sequelize),
    Order: Order.initModel(sequelize),
    Product: Product.initModel(sequelize),
  };

  // Set up associations
  User.associate(models);
  Order.associate(models);
  Enquiry.associate(models);
  Visitor.associate(models);

  // Sync models with DB
  await sequelize.sync({ alter: env === "development" });

  return { sequelize, models };
}
