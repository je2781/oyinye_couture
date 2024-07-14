import { CartState } from "@/interfaces";

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
        ...existingCartItem, amount: existingCartItem.quantity + action.item.quantity
      }
      updatedStateItems = [...state.items];
      updatedStateItems[existingCartItemIndex] = updatedStateItem;
    }else{
      // updatedStateItem = {...action.item};
      updatedStateItems = state.items.concat(action.item);
    }

    return {
      items: updatedStateItems,
      totalAmount: updatedStateTotalAmount,
    };
  }
  if(action.type === 'REMOVE'){
    let updatedStateItems;
    const existingCartItemIndex = state.items.findIndex((item: any) => item.variantId === action.variantId);
    const existingCartItem = state.items[existingCartItemIndex];
    const updatedStateTotalAmount =
      state.totalAmount - existingCartItem.price;

    if(existingCartItem.quantity === 1){
      updatedStateItems = state.items.filter((item: any) => item.variantId !== existingCartItem.variantId);
    }else{
      const updatedStateItem = {
        ...existingCartItem, amount: existingCartItem.quantity - 1
      }
      updatedStateItems = [...state.items];
      updatedStateItems[existingCartItemIndex] = updatedStateItem;
    }

    return{
      items: updatedStateItems,
      totalAmount: updatedStateTotalAmount
    };
  }

  return defaultCartState;
};