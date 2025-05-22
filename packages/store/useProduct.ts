import { useContext } from "react"
import { ProductContext } from "./productContext";


const useProduct = () => {
    const data = useContext(ProductContext);

    return data;
}

export default useProduct;