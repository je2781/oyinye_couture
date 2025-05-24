
export const options = {
  username: process.env.ADMIN_USER,
  password: process.env.ADMIN_PASS,
  database: process.env.ADMIN_DB_NAME,
  host: process.env.ADMIN_DB_HOST,
  port: process.env.ADMIN_DB_PORT,
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

if(process.env.NODE_ENV === 'production'){
  options.dialectOptions = {
    ssl: {
      require: false, 
      rejectUnauthorized: false
    }
  }
}

const config =  {
  development: options,
  production: options,
  test: options
}

export default config;