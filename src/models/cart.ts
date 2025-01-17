import {
  BelongsToGetAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToSetAssociationMixin,
  CreationOptional,
  DataTypes,
  ForeignKey,
  HasOneGetAssociationMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import Review from "./review";
import Product from "./product";
import crypto from "crypto";
import User from "./user";

class Cart extends Model<InferAttributes<Cart>, InferCreationAttributes<Cart>> {
  declare id: string;
  declare total_amount: number;
  declare items: any[];
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare getUser: BelongsToGetAssociationMixin<User>;
  declare setUser: BelongsToSetAssociationMixin<User, string>;

  static associate(models: any){
    Cart.belongsTo(models.User);

  }

  async clearCart() {
    this.items = [];
  
    return this.save();
  }

  async addToCart(
    product: Product,
    quantity: number,
    variantId: string,
    price: number
  ) {

    const updatedCartTotalAmount =
     this.total_amount + price * quantity;
  
    const updatedCartItems = this.items.slice();
    const existingCartItemIndex = updatedCartItems.findIndex(
      item => item.variant_id === variantId
    );
    const existingCartItem = updatedCartItems[existingCartItemIndex];
    if (existingCartItem) {
      const updatedCartItem = {
        ...existingCartItem,
        quantity: existingCartItem.quantity + quantity
      };

      updatedCartItems[existingCartItemIndex] = updatedCartItem;

    } else {
          // Create a new CartItem instance for the new product
      const newProduct = {
        variant_id: variantId,
        quantity: quantity,
        product,
      };

      updatedCartItems.push(newProduct);
    }
  
    this.items = updatedCartItems;
    this.total_amount = updatedCartTotalAmount;
  
    return this.save();
  }

 async deductFromCart (
    variantId: string,
    quantity: number,
    price: number
  ) {

     const updatedCartItems = this.items.slice();

    const existingCartItemIndex = updatedCartItems.findIndex(
      item => item.variant_id === variantId
    );
    
    if (existingCartItemIndex === -1) throw new Error('Item not found in the cart');

    const existingCartItem = updatedCartItems[existingCartItemIndex];
    
    const updatedCartTotalAmount = this.total_amount - price * quantity;

    if ((existingCartItem.quantity) - quantity === 0) {
      updatedCartItems.splice(existingCartItemIndex, 1);  // Remove item
    } else {
      const updatedCartItem = {
        ...existingCartItem,
        quantity: existingCartItem.quantity - quantity
      };

      updatedCartItems[existingCartItemIndex] = updatedCartItem;
    }

    // Update cart values
    this.items = updatedCartItems;
    this.total_amount = updatedCartTotalAmount;

    // Save updated cart
    return this.save();
   }

   static initModel(sequelize: Sequelize){
    return Cart.init({
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      items: DataTypes.JSONB,
      total_amount: DataTypes.DOUBLE,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
      
    }, {
      tableName: "carts",
      sequelize,
      timestamps: true,
    });
   }
}
  // ...




export default Cart;
