import mongoose, { Document, Model, Schema } from "mongoose";

// Define the CartItem interface
interface CartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  variantId: string;
}

// Define the Cart document interface
interface ICart extends Document {
  items: CartItem[];
  user?: {
    userId: mongoose.Types.ObjectId;
  };
  totalAmount: any;
  addToCart(product: any): Promise<void>;
  removeFromCart(variantId: string, quantity: number): Promise<void>;
  clearCart(): Promise<void>;
}

const CartSchema = new Schema<ICart>({
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "products",
        required: true,
      },
      quantity: {
        type: Number,
      },
      variantId: {
        type: String,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  user: {
    userId: {
      ref: "users",
      type: Schema.Types.ObjectId,
    },
  },
}, {
  timestamps: true
});

CartSchema.methods.removeFromCart = function (
  variantId: string,
  quantity: number,
  price: number
) {
  let updatedCartItems = this.items.slice();

  const existingCartItemIndex = updatedCartItems.findIndex(
    (item: any) => item.variantId === variantId
  );
  const existingCartItem = updatedCartItems[existingCartItemIndex];
  const updatedCartTotalAmount = this.totalAmount - price * quantity;

  if (existingCartItem.quantity - quantity <= 0) {
    updatedCartItems = updatedCartItems.filter(
      (item: any) => item.variantId !== existingCartItem.variantId
    );
  } else {
    const updatedCartItem = {
      ...existingCartItem,
      quantity: existingCartItem.quantity - quantity,
    };
    updatedCartItems[existingCartItemIndex] = updatedCartItem;
  }

  this.items = updatedCartItems;
  this.totalAmount = updatedCartTotalAmount;

  return this.save();
};

CartSchema.methods.addToCart = function (product: any) {
  const updatedCartTotalAmount =
    this.totalAmount + product.price * product.quantity;

  const updatedCartItems = this.items.slice();
  const existingCartItemIndex = updatedCartItems.findIndex(
    (item: any) => item.variantId === product.variantId
  );
  const existingCartItem = updatedCartItems[existingCartItemIndex];
  if (existingCartItem) {
    const updatedCartItem = {
      ...existingCartItem,
      quantity: existingCartItem.quantity + product.quantity,
    };
    updatedCartItems[existingCartItemIndex] = updatedCartItem;
  } else {
    updatedCartItems.push({
      productId: product.id,
      quantity: product.quantity,
      variantId: product.variantId,
    });
  }

  this.items = updatedCartItems;
  this.totalAmount = updatedCartTotalAmount;

  return this.save();
};

CartSchema.methods.clearCart = function () {
  this.items = [];

  return this.save();
};

const Cart = mongoose.models.carts ?? mongoose.model("carts", CartSchema);

export default Cart;
