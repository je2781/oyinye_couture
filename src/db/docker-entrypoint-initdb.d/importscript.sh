#!/bin/bash

# Import 'users' collection
mongoimport --db='oyinyecouture' --collection='users' --file='/tmp/users.json' --jsonArray --username='oyinye' --password='9pZToRnwda6wY97p' --authenticationDatabase=admin

# Import 'products' collection
mongoimport --db='oyinyecouture' --collection='products' --file='/tmp/products.json' --jsonArray --username='oyinye' --password='9pZToRnwda6wY97p' --authenticationDatabase=admin