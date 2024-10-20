import {
  BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize,
  } from "sequelize";
import User from "./user";
  
  
  class Enquiry extends Model<InferAttributes<Enquiry>, InferCreationAttributes<Enquiry>> {
    declare id: string;
    declare contact: CreationOptional<any>;
    declare order: CreationOptional<any>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare getUser: BelongsToGetAssociationMixin<User>;
    declare setUser: BelongsToSetAssociationMixin<User, string>;

    static associate(models: any){
      Enquiry.belongsTo(models.User);

    }

    static initModel(sequelize: Sequelize){
      return   Enquiry.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
          },
        contact: DataTypes.JSONB,
        order: DataTypes.JSONB,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    
    }, {
        tableName: "enquiries",
        sequelize,
        timestamps: true,
    }
      );
    }

  }



export default Enquiry;

