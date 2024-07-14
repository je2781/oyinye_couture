import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the CartItem interface
interface CartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

// Define the Cart document interface
interface ICart extends Document {
  items: CartItem[];
  user?: {
    userId: mongoose.Types.ObjectId;
  },
  totalAmount: number;
  addToCart(product: any): Promise<void>,
  deleteCartItem(prodId: mongoose.Types.ObjectId): Promise<void>,
  clearCart(): Promise<void>
}

const CartSchema = new Schema<ICart>({
    items: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'products',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
            
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    user: {
        userId: {
            ref: 'users',
            type: Schema.Types.ObjectId
        }
    }
    
});

CartSchema.methods.deleteCartItem = function(prodId: mongoose.ObjectId){        
    const updatedCartItems = this.items.filter((i: any) => i.productId.toString() !== prodId.toString());
  
    this.items = updatedCartItems;
    
    return this.save();
    
  }
  
  
  CartSchema.methods.addToCart = function(product: any){

    const updatedStateTotalAmount = this.totalAmount + (product.price * product.quantity);

    const updatedCartItems = this.items.slice();
    const existingCartItemIndex = updatedCartItems.findIndex((item: any) => item.productId.toString() === product.id.toString());
    const existingCartItem = updatedCartItems[existingCartItemIndex];
    if(existingCartItem){
       const updatedCartItem = {
        ...existingCartItem, amount: existingCartItem.quantity + product.quantity
      }
      updatedCartItems[existingCartItemIndex] = updatedCartItem;
    }else{
        updatedCartItems.push({productId: product.id, quantity : product.quantity});
    }
  
    this.items = updatedCartItems;
    this.totalAmount = updatedStateTotalAmount;
    
    return this.save();
  }
  
  CartSchema.methods.clearCart = function(){
    this.items = [];
  
    return this.save();
  }

const Cart = mongoose.model('carts', CartSchema);

export default Cart;

