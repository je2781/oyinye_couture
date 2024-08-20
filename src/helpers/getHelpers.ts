
import {
  Base64ImagesObj,
  CartItemObj,
  CartState,
  DressColorObj,
  DressSizesJsxObj,
  DressSizesObj,
  SizeData,
} from "@/interfaces";
import axios from "axios";
import crypto from "crypto";
import toast from "react-hot-toast";
import countries from "i18n-iso-countries";

// Load the necessary locale data (for example, English)
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

// Function to convert ISO alpha-2/alpha-3 code to ISO numeric code
export function convertToNumericCode(isoCode: string) {
  const alpha3Code = countries.alpha2ToAlpha3(isoCode) || isoCode;
  return countries.alpha3ToNumeric(alpha3Code);
}

export function randomReference() {
  let length = 15;
  let chars = "0123456789abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}


export const sizes = [8, 10, 12, 14, 16, 18];

export const regex = /^[0-9]+$/;

export const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const extractProductDetails = (
  cartItems: any[],
  cartItemObj: CartItemObj,
  frontBase64ImagesObj: Base64ImagesObj
) => {
  for (let item of cartItems) {
    for (let color of item.product.colors) {
      let size = color.sizes.find(
        (size: any) => size.variantId === item.variantId
      );

      if (size) {
        cartItemObj[`${color.type}-${size.number}`] = {
          ...size,
          variantId: size.variantId,
          title: item.product.title,
          color: color.type,
          quantity: item.quantity,
          id: item.product._id.toString(),
        };
        frontBase64ImagesObj[`${color.type}-${size.number}`] = color.imageFrontBase64;
      }
    }
  }
};

export const appsList = ["Email", "Calendar", "File Manager"];

export const tablesList = ["Order Management"];

export const defaultCartState: CartState = {
  items: [],
  totalAmount: 0,
};



export const generateBase64FromImage = (
  imageFile: any
): Promise<string | ArrayBuffer | null | undefined> => {
  if (!imageFile) {
    return new Promise((resolve, reject) => {});
  }

  const reader = new FileReader();
  const promise = new Promise(
    (
      resolve: (result: string | ArrayBuffer | null | undefined) => void,
      reject: (reason: any) => void
    ) => {
      reader.onload = (e: ProgressEvent<FileReader>) =>
        resolve(e.target?.result);
      reader.onerror = (err) => reject(err);
    }
  );

  reader.readAsDataURL(imageFile);
  return promise;
};

export const colorsReducer = (state: DressColorObj[], action: any) => {
  if (action.type === "ADD") {
    let updatedColorsObj = state.slice();
    let existingColorObjIndex = updatedColorsObj.findIndex(
      (colorObj) => Object.keys(colorObj)[0] === action.color.type
    );
    let existingColorObj = updatedColorsObj[existingColorObjIndex];

    if (existingColorObj) {
      let updatedColorObj = {
        ...existingColorObj,
        [action.color.type]: {
          imageFront: action.color.front
            ? [
                ...existingColorObj[action.color.type].imageFront,
                action.color.front,
              ]
            : existingColorObj[action.color.type].imageFront,
          imageBack: action.color.back
            ? action.color.back
            : existingColorObj[action.color.type].imageBack,
        },
      };

      updatedColorsObj[existingColorObjIndex] = updatedColorObj;
    } else {
      updatedColorsObj.push({
        [action.color.type]: {
          imageFront: action.color.front ? [action.color.front] : [],
          imageBack: action.color.back ? action.color.back : "",
        },
      });
    }

    return updatedColorsObj;
  }

  if (action.type === "REMOVE") {
    let updatedColorsObj = state.slice();
    let existingColorObjIndex = updatedColorsObj.findIndex(
      (colorObj) => Object.keys(colorObj)[0] === action.color.type
    );
    let existingColorObj = updatedColorsObj[existingColorObjIndex];

    if (existingColorObj) {
      updatedColorsObj = state.filter(
        (colorObj) => Object.keys(colorObj)[0] !== action.color.type
      );
    }

    return updatedColorsObj;
  }

  return [];
};

export async function handleSubmit(
  e: React.FormEvent,
  title: string,
  desc: string,
  type: string,
  dressColorsState: DressColorObj[],
  currentBgColors: string[],
  sizeData: SizeData[],
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  e.preventDefault();
  let sizeDataArray: SizeData[] = [];

  if (title.length === 0) {
    return toast.error(`title missing`, {
      position: "top-center",
    });
  }

  if (desc.length === 0) {
    return toast.error(`description missing`, {
      position: "top-center",
    });
  }

  if (type.length === 0) {
    return toast.error(`product type missing`, {
      position: "top-center",
    });
  }

  if (
    Object.values(dressColorsState[dressColorsState.length - 1])[0].imageFront
      .length === 0
  ) {
    return toast.error(`front image(s) missing`, {
      position: "top-center",
    });
  }
  if (
    Object.values(dressColorsState[dressColorsState.length - 1])[0].imageBack
      .length === 0
  ) {
    return toast.error(`back image missing`, {
      position: "top-center",
    });
  }
  //extracting size data for each size in every dress color
  for (let bgColor of currentBgColors) {
    let updatedSizeData = sizeData.filter((datum) => datum.color === bgColor);
    for (let size of sizes) {
      let newSizeData = updatedSizeData.filter(
        (datum) => datum.number! === size
      );
      sizeDataArray.push(newSizeData[newSizeData.length - 1]);
    }
  }

  const hashedId = await crypto.randomBytes(32);

  const Product = {
    title,
    description: desc,
    noOfOrders: 0,
    type,
    noOfReviews: 0,
    colors: currentBgColors.map((bgColor) => {
      let updatedSizeData = sizeDataArray
        .filter((datum) => datum !== undefined)
        .filter((datum) => datum.color === bgColor);
      return {
        type: bgColor,
        imageFrontBase64: Object.values(
          dressColorsState[dressColorsState.length - 1]
        )[0].imageFront,
        imageBackBase64: Object.values(
          dressColorsState[dressColorsState.length - 1]
        )[0].imageBack,
        sizes: updatedSizeData.map((datum) => ({
          number: datum.number!,
          price: parseFloat(datum.price!),
          stock: datum.stock ? datum.stock : 0,
          variantId: hashedId,
        })),
      };
    }),
  };

  try {
    setIsLoading(true);
    await axios.post("/api/products/new", Product);
    toast.success("Product created!");
  } catch (error: any) {
    toast.error(error);
  } finally {
    setIsLoading(false);
  }
}

export async function handleBackImageupload(
  dispatchAction: React.Dispatch<any>,
  currentBgColors: string[],
  setImgData: React.Dispatch<
    React.SetStateAction<
      {
        size: string;
        filename: string;
      }[]
    >
  >,
  setBackFilename: React.Dispatch<React.SetStateAction<string | null>>,
  backUploadRef: React.RefObject<HTMLInputElement>,
  file: File | null
) {
  try {
    file = backUploadRef.current!.files![0];

    let base64Str = await generateBase64FromImage(file);
    dispatchAction({
      type: "ADD",
      color: {
        type: currentBgColors[currentBgColors.length - 1],
        back: base64Str,
      },
    });
  } catch (error) {
    toast.error("image conversion failed");
  } finally {
    setBackFilename(file!.name);
    setImgData((prevState) => [
      ...prevState,
      {
        size: (file!.size / 1024).toFixed(2),
        filename: file!.name,
      },
    ]);
  }
}

export async function handleFrontImagesupload(
  e: React.ChangeEvent,
  dispatchAction: React.Dispatch<any>,
  currentBgColors: string[],
  setImgData: React.Dispatch<
    React.SetStateAction<
      {
        size: string;
        filename: string;
      }[]
    >
  >,
  setFrontFilename: React.Dispatch<React.SetStateAction<string | null>>,
  frontUploadRef: React.RefObject<HTMLInputElement>,
  file: File | null
) {
  try {
    file = frontUploadRef.current!.files![0];

    let base64Str = await generateBase64FromImage(file);
    dispatchAction({
      type: "ADD",
      color: {
        type: currentBgColors[currentBgColors.length - 1],
        front: base64Str,
      },
    });
  } catch (error) {
    toast.error("image conversion failed");
  } finally {
    setFrontFilename(file!.name);
    setImgData((prevState) => [
      ...prevState,
      {
        size: (file!.size / 1024).toFixed(2),
        filename: file!.name,
      },
    ]);
  }
}

export function handlePriceChange(
  e: React.ChangeEvent<HTMLInputElement>,
  currentBgColors: string[],
  sizeData: SizeData[],
  setSizeData: React.Dispatch<React.SetStateAction<SizeData[]>>,
  setPrice: React.Dispatch<React.SetStateAction<string>>
) {
  if (currentBgColors.length === 0) {
    return toast.error(`Select a dress color`, {
      position: "top-center",
    });
  }
  if (currentBgColors.length > 0 && sizeData.length === 0) {
    return toast.error(
      `Select a dress size for ${currentBgColors[currentBgColors.length - 1]}`,
      {
        position: "top-center",
      }
    );
  }

  setPrice(e.target.value);

  //storing size data of previous active size
  setSizeData((prevState) => [
    ...prevState,
    {
      ...prevState[prevState.length - 1],
      color: currentBgColors[currentBgColors.length - 1],
      price: e.target.value,
    },
  ]);
}

export function handleStockChange(
  e: React.ChangeEvent<HTMLInputElement>,
  currentBgColors: string[],
  sizeData: SizeData[],
  setIsChecked: React.Dispatch<React.SetStateAction<boolean>>
) {
  let sizes = document.querySelectorAll("[id^=size]") as NodeListOf<
    HTMLSpanElement
  >;
  if (currentBgColors.length === 0) {
    return toast.error(`Select a dress color`, {
      position: "top-center",
    });
  }
  if (currentBgColors.length > 0 && sizeData.length === 0) {
    return toast.error(
      `Select a dress size for ${currentBgColors[currentBgColors.length - 1]}`,
      {
        position: "top-center",
      }
    );
  }

  setIsChecked(e.currentTarget.checked!);
}

export const cartReducer = (state: CartState, action: any) => {
  if (action.type === "ADD") {
    const updatedStateTotalAmount =
      state.totalAmount + action.item.price * action.item.quantity;

    const existingCartItemIndex = state.items.findIndex(
      (item: any) => item.variantId === action.item.variantId
    );
    const existingCartItem = state.items[existingCartItemIndex];

    let updatedStateItems;

    if (existingCartItem) {
      const updatedStateItem = {
        ...existingCartItem,
        quantity: existingCartItem.quantity + action.item.quantity,
      };
      updatedStateItems = [...state.items];
      updatedStateItems[existingCartItemIndex] = updatedStateItem;
    } else {
      // updatedStateItem = {...action.item};
      updatedStateItems = state.items.concat(action.item);
    }

    return {
      items: updatedStateItems,
      totalAmount: parseFloat(updatedStateTotalAmount.toFixed(2)),
    };
  }
  if (action.type === "REMOVE") {
    let updatedStateItems;
    const existingCartItemIndex = state.items.findIndex(
      (item: any) => item.variantId === action.item.variantId
    );
    const existingCartItem = state.items[existingCartItemIndex];
    const updatedStateTotalAmount =
      state.totalAmount - action.item.price * action.item.quantity;

    if (existingCartItem.quantity - action.item.quantity <= 0) {
      updatedStateItems = state.items.filter(
        (item: any) => item.variantId !== existingCartItem.variantId
      );
    } else {
      const updatedStateItem = {
        ...existingCartItem,
        quantity: existingCartItem.quantity - action.item.quantity,
      };
      updatedStateItems = [...state.items];
      updatedStateItems[existingCartItemIndex] = updatedStateItem;
    }

    return {
      items: updatedStateItems,
      totalAmount: parseFloat(updatedStateTotalAmount.toFixed(2)),
    };
  }
  if (action.type === "UPDATE") {
    return {
      items: action.cartData.items,
      totalAmount: state.totalAmount,
    };
  }

  return defaultCartState;
};

export const driveList = ["All Files", "Recent", "Important", "Deleted"];

// export let sizesJsxObj: DressSizesJsxObj  = {};
// export let sizesObj: DressSizesObj  = {};
// export let colorsObj: DressColorsObj  = {};
// export let frontBase64ImagesObj: Base64ImagesObj = {};

// export function sortAndStoreDressColors(product: any){
//     //sorting extracted sizes for all dress colors and storing them for later use
//     for(let color of product.colors){
//         color.sizes = color.sizes.filter((size: any) => size.stock > 0);
//         color.sizes.sort((a: any, b: any) => a.number - b.number);

//         for(let size of color.sizes){
//             colorsObj[color.type]
//             ? colorsObj[color.type].push(size.number)
//             : colorsObj[color.type] = [size.number];
//         }
//     }
// }

// export function handleColorChange(e: React.MouseEvent, colorsObj: DressColorsObj, selectedColor: string, setSelectedSize: React.Dispatch<React.SetStateAction<string>>, setSelectedColor: React.Dispatch<React.SetStateAction<string>>, sizes: number[], colors: any){
//     let activeColorEl = e.currentTarget as HTMLSpanElement;

//     let colorNodeList = activeColorEl.parentNode!.querySelectorAll('span') as NodeListOf<HTMLSpanElement>;
//     let otherColorEls = Array.from(colorNodeList);
//     let sizeNodeList = activeColorEl.closest('p')!.parentNode!.querySelectorAll('#size-list > div > span') as NodeListOf<HTMLSpanElement>;
//     let sizeEls = Array.from(sizeNodeList);

//     otherColorEls.forEach(el => {
//         if(el.classList.contains('bg-black') || el.style.getPropertyValue('background-color') === 'black'){
//             el.style.setProperty('background-color', 'transparent');
//             el.style.setProperty('color', 'rgb(75, 85, 99 )');
//             el.classList.add('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
//             el.classList.remove('bg-black');
//         }
//     });

//     activeColorEl.style.setProperty('background-color', 'black');
//     activeColorEl.style.setProperty('color', 'white');
//     activeColorEl.classList.remove('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
//     activeColorEl.classList.add('bg-black');

//     /**updating active dress color ***/
//     for(let color of colors){
//         for (let i = 0; i < sizes.length; i++) {
//             if (color.type === activeColorEl.innerText && !color.sizes.some((size: any) => size.number === colorsObj[selectedColor][i]) && colorsObj[selectedColor][i]) {
//                 // Setting properties of size element not contained in active dress color to 'not in stock'
//                 sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === colorsObj[selectedColor][i].toString())].style.setProperty('background-color', 'transparent');
//                 sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === colorsObj[selectedColor][i].toString())].style.setProperty('color', 'rgb(156, 163, 175)');
//                 sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === colorsObj[selectedColor][i].toString())].classList.add('border', 'border-gray-200');

//                 // Setting properties of first size element contained in active dress color to 'current selection'
//                 sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === color.sizes[0].number.toString())].style.setProperty('background-color', 'black');
//                 sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === color.sizes[0].number.toString())].style.setProperty('color', 'white');
//                 sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === color.sizes[0].number.toString())].classList.remove('hover:ring-1', 'ring-gray-600');
//                 // Setting properties of other size elements contained in active dress color to 'available for selection'
//                 if (color.sizes.slice(1).length > 0) {
//                     for (let size of color.sizes.slice(1)) {
//                         sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === size.number.toString())].style.setProperty('color', 'rgb(75, 85, 99)');
//                     }
//                 }

//                 setSelectedSize(color.sizes[0].number.toString());
//             }
//         }

//     }
//     setSelectedColor(activeColorEl.innerText);

// }

// export function handleSizeChange(e: React.MouseEvent, setSelectedSize: React.Dispatch<React.SetStateAction<string>>){
//     let activeSizeEl = e.currentTarget as HTMLSpanElement;

//     let nodeList = activeSizeEl.parentNode!.querySelectorAll('span') as NodeListOf<HTMLSpanElement>;
//     let otherSizeEls = Array.from(nodeList);

//     otherSizeEls.forEach(el => {
//         if(el.classList.contains('bg-black') || el.style.getPropertyValue('background-color') === 'black'){
//             el.style.setProperty('background-color', 'transparent');
//             el.style.setProperty('color', 'rgb(75, 85, 99 )');
//             el.classList.add('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
//             el.classList.remove('bg-black');
//         }
//     });

//     activeSizeEl.style.setProperty('background-color', 'black');
//     activeSizeEl.style.setProperty('color', 'white');
//     activeSizeEl.classList.remove('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
//     activeSizeEl.classList.add('bg-black');
//     //updating active dress size
//     setSelectedSize(activeSizeEl.innerText.split(' ')[1]);
// }
