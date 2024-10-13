import sequelize from "@/db/connection";
import { InferAttributes, InferCreationAttributes, CreationOptional, DataTypes, Model } from "sequelize";


class Visitor extends Model<InferAttributes<Visitor>, InferCreationAttributes<Visitor>> {
    declare id: string;
    declare ip: CreationOptional<string>;
    declare browser: CreationOptional<string>;
    declare device: CreationOptional<string>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
  
    // ...
  }
  
Visitor.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
    ip: {
        type: DataTypes.STRING,
    },
    browser: {
        type: DataTypes.STRING,
    },
    device: {
        type: DataTypes.STRING,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
},
{
    tableName: "visitors",
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    sequelize,
    timestamps: true,
}
);

export default Visitor;

