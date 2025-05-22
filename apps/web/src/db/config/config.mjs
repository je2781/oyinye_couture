
export const options = {
  username: process.env.USER,
  password: process.env.PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  migrationStorageTableName: 'migrations',
  pool: {
    max: 10, 
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
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