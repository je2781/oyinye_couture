import { useContext } from "react"
import { GlobalContext } from "./globalContext";


const useGlobal = () => {
    const data = useContext(GlobalContext);

    return data;
}

export default useGlobal;