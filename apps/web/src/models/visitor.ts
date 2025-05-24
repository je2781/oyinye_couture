import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Model,
  Sequelize,
} from "sequelize";

class Visitor extends Model<
  InferAttributes<Visitor>,
  InferCreationAttributes<Visitor>
> {
  declare id: string;
  declare ip: CreationOptional<string>;
  declare browser: CreationOptional<string>;
  declare device: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate(models: any) {
    // Define your associations here, referencing models dynamically
    Visitor.hasOne(models.User, { foreignKey: "visitor_id", as: "visitor" });
  }

  // ...
  static initModel(sequelize: Sequelize) {
    return Visitor.init(
      {
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
        sequelize,
        timestamps: true,
      }
    );
  }
}

export default Visitor;
