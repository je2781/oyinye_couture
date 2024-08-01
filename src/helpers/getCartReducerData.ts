import { CartState } from "@/interfaces";
import Cart from "@/models/cart";

export const defaultCartState: CartState = {
    items: [],
    totalAmount: 0,
  };
  

export const cartReducer = (state: CartState, action: any) => {

  if (action.type === "ADD") {
    const updatedStateTotalAmount =
      state.totalAmount + (action.item.price * action.item.quantity);
    
    const existingCartItemIndex = state.items.findIndex((item: any) => item.variantId === action.item.variantId)
    const existingCartItem = state.items[existingCartItemIndex];

    let updatedStateItems;

    if(existingCartItem){
      const updatedStateItem = {
        ...existingCartItem, quantity: existingCartItem.quantity + action.item.quantity
      }
      updatedStateItems = [...state.items];
      updatedStateItems[existingCartItemIndex] = updatedStateItem;
    }else{
      // updatedStateItem = {...action.item};
      updatedStateItems = state.items.concat(action.item);
    }


    return {
      items: updatedStateItems,
      totalAmount: parseFloat(updatedStateTotalAmount.toFixed(2)),
    };
  }
  if(action.type === 'REMOVE'){
    let updatedStateItems;
    const existingCartItemIndex = state.items.findIndex((item: any) => item.variantId === action.item.variantId);
    const existingCartItem = state.items[existingCartItemIndex];
    const updatedStateTotalAmount =
      state.totalAmount - (action.item.price * action.item.quantity);

    if(existingCartItem.quantity - action.item.quantity <= 0){
      updatedStateItems = state.items.filter((item: any) => item.variantId !== existingCartItem.variantId);
    }else{
      const updatedStateItem = {
        ...existingCartItem, quantity: existingCartItem.quantity - action.item.quantity
      }
      updatedStateItems = [...state.items];
      updatedStateItems[existingCartItemIndex] = updatedStateItem;
    }

    return{
      items: updatedStateItems,
      totalAmount: parseFloat(updatedStateTotalAmount.toFixed(2)),
    };
  }
  if(action.type === 'UPDATE'){

    return{
      items: action.cartData.items,
      totalAmount: state.totalAmount,
    };
  }

  return defaultCartState;
};