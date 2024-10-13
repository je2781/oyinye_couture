import dotenv from 'dotenv';
dotenv.config('../../../.env');

export const options = {
  username: process.env.USER,
  password: process.env.PASS,
  database: process.env.DB_NAME,
  host: process.env.NODE_ENV === 'development' ? 'localhost' : 'postgres',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  migrationStorageTableName: 'migrations'
};

// if(process.env.NODE_ENV === 'production'){
//   options.dialectOptions = {
//     ssl: {
//       require: false, 
//       rejectUnauthorized: false
//     }
//   }
// }

export default {
  development: options,
  production: options
}