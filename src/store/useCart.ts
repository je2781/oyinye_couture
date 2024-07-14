import { useContext } from "react"
import { CartContext } from "./cartContext";


const useCart = () => {
    const data = useContext(CartContext);

    return data;
}

export default useCart;