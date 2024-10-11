print('Start #################################################################');

db = db.getSiblingDB(process.env.MONGO_DB);
db.createUser(
  {
    user: process.env.MONGO_USER,
    pwd: process.env.MONGO_PASS,
    roles: [{ role: 'root', db: 'admin' }]
  },
);
db.createCollection('users');
db.createCollection('products');


print('END #################################################################');