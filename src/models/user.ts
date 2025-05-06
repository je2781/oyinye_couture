import {
  CreationOptional,
  DataTypes,
  HasManyGetAssociationsMixin,
  HasOneGetAssociationMixin,
  InferCreationAttributes,
  Model,
  BelongsToGetAssociationMixin,
  InferAttributes,
  BelongsToSetAssociationMixin,
  Sequelize,
  ForeignKey
} from "sequelize";
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
  declare email: CreationOptional<string>;
  declare password: CreationOptional<string>;
  declare enable_email_marketing: CreationOptional<boolean>;
  declare visitor_id: ForeignKey<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate(models: any) {
    // Define your associations here, referencing models dynamically
    User.hasMany(models.Review, { foreignKey: 'author_id', as: 'author' });
    
    User.hasMany(models.Order, { foreignKey: 'user_id', as: 'orderUser' });
    
    User.hasMany(models.Enquiry, { foreignKey: 'user_id', as: 'user' });
    
    User.hasOne(models.Cart, { foreignKey: 'user_id', as: 'cartUser' });
    
    User.belongsTo(models.Visitor, { foreignKey: 'visitor_id', as: 'visitor' });
  }

  static initModel(sequelize: Sequelize){
    return User.init(
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
        visitor_id: {
          type: DataTypes.STRING,
          references: {
            model: 'visitors',
            key: 'id'
          },
          onDelete: 'CASCADE'
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
  }
  // ...
}




export default User;
