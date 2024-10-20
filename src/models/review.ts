import { BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import Product from './product';
import User from './user';

class Review extends Model<InferAttributes<Review>, InferCreationAttributes<Review>> {
    declare id: string;
    declare headline: string;
    declare is_media: boolean;
    declare rating: number;
    declare likes: CreationOptional<number>;
    declare dislikes: CreationOptional<number>;
    declare content: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare author_id: ForeignKey<string>;
    declare getUser: BelongsToGetAssociationMixin<User>;
    declare setUser: BelongsToSetAssociationMixin<User, string>;
    declare getProduct: BelongsToGetAssociationMixin<Product>;
    declare setProduct: BelongsToSetAssociationMixin<Product, string>;

    static associate(models: any){
        Review.belongsTo(models.Product);
    	Review.belongsTo(models.User);
    }

    static initModel(sequelize: Sequelize){
        return Review.init({
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
              },
            headline: {
                type: DataTypes.STRING,
            },
            rating: DataTypes.INTEGER,
            content: DataTypes.STRING,
            is_media: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            likes: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            author_id: {
                type: DataTypes.STRING,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            dislikes: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },  {
            tableName: "reviews",
            sequelize,
            timestamps: true,
          }
        );
    }
    // ...
  }
  



export default Review;

