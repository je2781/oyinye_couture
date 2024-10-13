import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  HasManyGetAssociationsMixin,
  HasOneGetAssociationMixin,
  InferCreationAttributes,
  Model,
  BelongsToGetAssociationMixin,
  InferAttributes,
  BelongsToSetAssociationMixin,
} from "sequelize";
import sequelize from "../db/connection";
import Review from "./review";
import Order from "./order";
import Enquiry from "./enquiries";
import Visitor from "./visitor";
import Cart from "./cart";


class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: string;
  declare first_name: CreationOptional<string>;
  declare last_name: CreationOptional<string>;
  declare avatar: CreationOptional<string>;
  declare is_admin: CreationOptional<boolean>;
  declare shipping_info: CreationOptional<any>;
  declare billing_info: CreationOptional<any>;
  declare save_billing_info: CreationOptional<boolean>;
  declare save_shipping_info: CreationOptional<boolean>;
  declare buyer_is_verified: CreationOptional<boolean>;
  declare account_is_verified: CreationOptional<boolean>;
  declare reviewer_is_verified: CreationOptional<boolean>;
  declare verify_token: CreationOptional<string | null>;
  declare verify_token_expiry_date: CreationOptional<Date | null>;
  declare reset_token: CreationOptional<string | null>;
  declare reset_token_expiry_date: CreationOptional<Date | null>;
  declare email: string;
  declare password: CreationOptional<string>;
  declare enable_email_marketing: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare getReviews: HasManyGetAssociationsMixin<Review>;
  declare getOrders: HasManyGetAssociationsMixin<Order>;
  declare getEnquiries: HasManyGetAssociationsMixin<Enquiry>;
  declare getCart: HasOneGetAssociationMixin<Cart>;
  declare getVisitor: BelongsToGetAssociationMixin<Visitor>;
  declare setVisitor: BelongsToSetAssociationMixin<Visitor, string>;

  static associate(models: any) {
    // Define your associations here, referencing models dynamically
    User.hasMany(models.Review, {
      as: "reviews",
      constraints: true,
      onDelete: "CASCADE",
      foreignKey: "author_id",
    });
    
    User.hasMany(models.Order);
    
    User.hasMany(models.Enquiry);
    
    User.hasOne(models.Cart);
    
    User.belongsTo(models.Visitor);
  }
  // ...
}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
    },
    last_name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
    enable_email_marketing: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    avatar: DataTypes.STRING,
    buyer_is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    account_is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reviewer_is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    shipping_info: {
      type: DataTypes.JSONB,
    },
    billing_info: {
      type: DataTypes.JSONB,
    },
    save_shipping_info: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    save_billing_info: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verify_token: {
      type: DataTypes.STRING,
    },
    verify_token_expiry_date: {
      type: DataTypes.DATE,
    },
    reset_token: {
      type: DataTypes.STRING,
    },
    reset_token_expiry_date: {
      type: DataTypes.DATE,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "users",
    sequelize,
    timestamps: true,
  }
);


export default User;
