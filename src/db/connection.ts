import { Sequelize } from 'sequelize';
import {SequelizeOptions} from 'sequelize-typescript';
import {options} from './config/config.mjs';
import Cart from '@/models/cart';
import User from '@/models/user';
import Review from '@/models/review';
import Order from '@/models/order';
import Enquiry from '@/models/enquiries';
import Visitor from '@/models/visitor';
import Product from '@/models/product';
import Filter from '@/models/filter';


const dbOptions = <SequelizeOptions>options;
dbOptions.dialectModule = require('pg');
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

Cart.associate({ User });
User.associate({ Review, Order, Enquiry, Cart, Visitor });
Review.associate({Product, User});
Product.associate({Review});
Order.associate({User});
Enquiry.associate({User});
Cart.associate({User});

sequelize.sync({ alter: true });
 // `alter: true` modifies the tables to match the model
export { sequelize, models };

