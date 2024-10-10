
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
import Cookies from 'js-cookie';

let now = new Date();
export let currentYear = now.getFullYear();
export let currentMonth = now.getMonth();
export let currentDay = now.getDay();
export let currentDate = now.getDate();
export let lastMonthValues: {
  [key: number]: number
} = {};
let monthDataLabels: {
  [key: number]: string[]
} = {};
let dailyDataLabels: {
  [key: number]: string[]
} = {};
let annualDataLabels: {
  [key: number]: number[]
} = {};
let dailyData: {
  [key: number]: any
} = {};
let dailyProductTypeData: {
  [key: number]: any
} = {};
let dailyDeliveryOptionsData: {
  [key: number]: any
} = {};
let dailyPaymentTypeData: {
  [key: number]: any
} = {};
let dailyVisitorsData: {
  [key: number]: any
} = {};
let monthData: {
  [key: number]: any
} = {};
let monthProductTypeData: {
  [key: number]: any
} = {};
let monthVisitorsData: {
  [key: number]: any
} = {};
let monthDeliveryOptionsData: {
  [key: number]: any
} = {};
let monthPaymentTypeData: {
  [key: number]: any
} = {};
let annualData: {
  [key: number]: any
} = {};
let annualProductTypeData: {
  [key: number]: any
} = {};
let annualVisitorsData: {
  [key: number]: any
} = {};
let annualDeliveryOptionsData: {
  [key: number]: any
} = {};
let annualPaymentTypeData: {
  [key: number]: any
} = {};
let monthSalesData: {
  [key: string]: {
    [key: string]: any[]
  }

} = {};
let dailySalesData: {
  [key: string]: {
    [key: string]: any[]
  }

} = {};
let annualSalesData: {
  [key: string]: {
    [key: string]: any[]
  }

} = {};
let monthSalesDataAmount: {
  [key: string]: {
    [key: string]: number
  } 

} = {};
let monthDressesSalesDataAmount: {
  [key: string]: {
    [key: string]: number
  } 

} = {};
let monthJumpsuitSalesDataAmount: {
  [key: string]: {
    [key: string]: number
  } 

} = {};
let monthTrousersSalesDataAmount: {
  [key: string]: {
    [key: string]: number
  } 

} = {};
let monthNoOfAddToCart: {
  [key: string]: {
    [key: string]: number
  }

} = {};
let monthNoOfCheckout: {
  [key: string]: {
    [key: string]: number
  }

} = {};
let monthNoOfClosed: {
  [key: string]: {
    [key: string]: number
  }  

} = {};
let monthNoOfStreetzwyze: {
  [key: string]: {
    [key: string]: number
  }

} = {};
let monthNoOfInterswitch: {
  [key: string]: {
    [key: string]: number
  }
} = {};
let monthNoOfIsland: {
  [key: string]: {
    [key: string]: number
  }

} = {};
let monthNoOfMainland: {
  [key: string]: {
    [key: string]: number
  }
} = {};
let monthNoOfOutside: {
  [key: string]: {
    [key: string]: number
  }
} = {};
let dailySalesDataAmount: {
  [key: string]: {
    [key: string]: number
  }

} = {};
let dailyDressesSalesDataAmount: {
    [key: string]: {
    [key: string]: number
  } 

} = {};
let dailyJumpsuitSalesDataAmount: {
  [key: string]: {
    [key: string]: number
  }

} = {};
let dailyTrousersSalesDataAmount: {
  [key: string]: {
    [key: string]: number
  } 

} = {};
let dailyNoOfAddToCart: {
  [key: string]: {
    [key: string]: number
  }

} = {};
let dailyNoOfCheckout: {
  [key: string]: {
    [key: string]: number
  }
} = {};
let dailyNoOfClosed: {
  [key: string]: {
    [key: string]: number
  }

} = {};
let dailyNoOfStreetzwyze: {
  [key: string]: {
    [key: string]: number
  }

} = {};
let dailyNoOfInterswitch: {
  [key: string]: {
    [key: string]: number
  }
} = {};
let dailyNoOfIsland: {
  [key: string]: {
    [key: string]: number
  }

} = {};
let dailyNoOfMainland: {
  [key: string]: {
    [key: string]: number
  }
} = {};
let dailyNoOfOutside: {
  [key: string]: {
    [key: string]: number
  }
} = {};

let annualSalesDataAmount: {
    [key: string]: {
      [key: string]: any
    } 

} = {};
let annualDressesSalesDataAmount: {
    [key: string]: {
      [key: string]: any
    } 

} = {};
let annualJumpsuitSalesDataAmount: {
    [key: string]: {
      [key: string]: any
    } 

} = {};
let annualTrousersSalesDataAmount: {
    [key: string]: {
      [key: string]: any
    } 

} = {};
let annualNoOfAddToCart: {
  [key: string]: {
    [key: string]: number
  }

} = {};
let annualNoOfCheckout: {
  [key: string]: {
    [key: string]: number
  }
} = {};
let annualNoOfStreetzwyze: {
  [key: string]: {
    [key: string]: number
  }

} = {};
let annualNoOfInterswitch: {
  [key: string]: {
    [key: string]: number
  }
} = {};
let annualNoOfIsland: {
  [key: string]: {
    [key: string]: number
  }

} = {};
let annualNoOfMainland: {
  [key: string]: {
    [key: string]: number
  }
} = {};
let annualNoOfOutside: {
  [key: string]: {
    [key: string]: number
  }
} = {};
let annualNoOfClosed: {
  [key: string]: {
    [key: string]: number
  }
} = {};
let sortedMonthDataLabels: {
    [key: number]: {
      [key: string]: string
    }[]

} = {};
let sortedDailyDataLabels: {
    [key: number]: any[]

} = {};

const days = [
  'Sun',
  'Mon',
  'Tue' ,
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];

export const months = [
  'Jan',
  'Feb' ,
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];


// Load the necessary locale data (for example, English)
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

// Function to convert ISO alpha-2/alpha-3 code to ISO numeric code
export function convertToNumericCode(isoCode: string) {
  const alpha3Code = countries.alpha2ToAlpha3(isoCode) || isoCode;
  return countries.alpha3ToNumeric(alpha3Code);
}


export const generateBase64FromMedia = (
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

export  function getDeviceType(userAgent: string) {

  if (/Mobile|Android|iPhone/i.test(userAgent)) {
      return 'Mobile';
  }

  if (/Tablet|iPad|Playbook|Silk/i.test(userAgent)) {
      return 'Tablet';
  }

  return 'Desktop';
}

export function getBrowser(userAgent: string) {
  if (userAgent.includes('Edg/')) {
      return 'Edge (Chromium)';
  } else if (userAgent.includes('Edge/')) {
      return 'Edge (Legacy)';
  } else if (userAgent.includes('Chrome')) {
      return 'Chrome';
  } else if (userAgent.includes('Safari')) {
      return 'Safari';
  } else if (userAgent.includes('Firefox')) {
      return 'Firefox';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      return 'Opera';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
      return 'IE'; // Internet Explorer
  } else {
      return 'Unknown';
  }
}

export let setBrowserUsageData = (data: any) => {
  return {
    Chrome: {
      color: 'rgb(228, 79, 79)',
      total: data.chrome
    },
    IE: {
        color: 'rgb(73, 182, 106)',
        total: data.ie
    } ,
    FireFox: {
        color: 'rgb(255, 165, 0)',
        total: data.firefox
    },
    Safari: {
        color: 'rgb(81, 178, 202)',
        total: data.safari
    },
    Opera: {
        color: 'rgb(74, 72, 199)',
        total: data.opera
    },
    EdgeC: {
        color: 'rgb(230, 230, 250)',
        total: data.edgeC
    },
    EdgeL: {
        color: 'rgb(176, 176, 185)',
        total: data.edgeL
    }
  };
};

export function decodedBase64(base64String: string) {
  // Decode the Base64 string
  const decodedString = atob(base64String);

  return decodedString;
}

export function randomReference() {
  let length = 8;
  let chars = "0123456789abcdefghijklmnopqrstuvwxyz_?£&*%!#%><ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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
  frontBase64ImagesObj: Base64ImagesObj,
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

export const appsList = ["Emails", "Calendar", "Product Listing"];

export const viewsList = ["Orders"];

export const insightList = ["Summary"];

export const defaultCartState: CartState = {
  items: [],
  totalAmount: 0,
};

export const getRouteNames = (list: string[]) => {
  return list.map(app => {
    let routeName, firstWord, secondWord = '';
    let newWord = [];
    switch (app) {
        case 'Product Listing':
            firstWord = app.split(' ')[0].charAt(0).toLowerCase() + app.split(' ')[0].slice(1);
            secondWord = app.split(' ')[1].charAt(0).toLowerCase() + app.split(' ')[1].slice(1);
  
            newWord = [firstWord, secondWord];
            routeName =  newWord.join('-');
            break;
        default:
            routeName = app.charAt(0).toLowerCase() + app.slice(1);
            break;
  
    }
  
    return routeName;
  });
}

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
  embelishment: string,
  fabric: string,
  sleeveL: string,
  dresslength: string,
  neckLine: string,
  isFeature: boolean,
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

  // if (embelishment.length === 0) {
  //   return toast.error(`embelishment missing`, {
  //     position: "top-center",
  //   });
  // }

  // if (fabric.length === 0) {
  //   return toast.error(`fabric missing`, {
  //     position: "top-center",
  //   });
  // }

  // if (dresslength.length === 0) {
  //   return toast.error(`dress length missing`, {
  //     position: "top-center",
  //   });
  // }

  // if (sleeveL.length === 0) {
  //   return toast.error(`sleeve length missing`, {
  //     position: "top-center",
  //   });
  // }

  // if (neckLine.length === 0) {
  //   return toast.error(`neck line missing`, {
  //     position: "top-center",
  //   });
  // }

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

  const hashedId = (await crypto.randomBytes(32)).toString("hex");

  const Product = {
    title,
    description: desc,
    noOfOrders: 0,
    type,
    reviews: [],
    isFeature,
    features: [
      embelishment,
      sleeveL,
      dresslength,
      fabric,
      neckLine].filter(element => element !== ""),
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
  e: React.ChangeEvent<HTMLInputElement>,
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
) {
  const file = e.target.files![0];
  try {

    let base64Str = await generateBase64FromMedia(file);
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
    setBackFilename(file.name);
    setImgData((prevState) => [
      ...prevState,
      {
        size: (file.size / 1024).toFixed(2),
        filename: file.name,
      },
    ]);
  }
}

export async function handleFrontImagesupload(
  e: React.ChangeEvent<HTMLInputElement>,
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
) {
  const file = e.target.files![0];
  try {

    let base64Str = await generateBase64FromMedia(file);
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
    setFrontFilename(file.name);
    setImgData((prevState) => [
      ...prevState,
      {
        size: (file.size / 1024).toFixed(2),
        filename: file.name,
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

export const cartReducer = (state: CartState, action: any) => {
  if (action.type === "ADD") {
    const updatedStateTotalAmount =
      state.totalAmount + (action.item.price * action.item.quantity);

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
    const updatedStateTotalAmount = state.totalAmount - (action.item.price * action.item.quantity);

    if (existingCartItem.quantity - action.item.quantity === 0) {
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


export const lineGraphOptions = {
  layout: {
      padding: { 
          top: 10,
          bottom: 20
      }
  },
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
      legend: {
          labels: {
              color: "#9a9cab",
              font: {
                weight: "bold" as "bold" | "normal" | "lighter" | "bolder"
              }
          },
      },
      display: true
  },
  scales: {
  y: {
      grid: {
          display: false,  // Disable y-axis grid lines
      },
      title: {
          display: true,
          text: "Naira ( ₦ )",
          color: "#9a9cab",
          font: {
            weight: "bold" as "bold" | "normal" | "lighter" | "bolder",
          }
      },
      beginAtZero: true,
      stacked: true ,
      ticks: {
          color: "rgb(156, 163, 175 )",
          font: {
              size: 12
          }
      }
  },
  x: {
      grid: {
      display: false
      },
      stacked: true ,
      ticks: {
          color: "rgb(156, 163, 175 )",
          font: {
              size: 12
          }
      }
  }
  }
};

export const verticalBarGraphOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
      legend: {
          labels: {
              color: '#9a9cab',
              font: {
                weight: "bold" as "bold" | "normal" | "lighter" | "bolder",
              }
          },
          display: true
      }
  },
  scales: {
      x: {
          grid: {
              display: false  // Disable y-axis grid lines
          },
          beginAtZero: true,
          ticks: {
              color: 'rgb(156, 163, 175 )',
              font: {
                  size: 12
              }
          }
      },
      y: {
          grid: {
              display: false  // Disable y-axis grid lines
          }, 
          ticks: {
              color: 'rgb(156, 163, 175 )',
              font: {
                  size: 12
              }
          }
          
      }
  },
  
};

export const productTypeGraphOptions = {
  indexAxis: 'y' as "y" | "x" | undefined,  // Flip the axis
  plugins: {
      legend: {
          labels: {
              color: '#9a9cab',
              font: {
                weight: "bold" as "bold" | "normal" | "lighter" | "bolder",
              }
          },
          display: true
      }
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
      x: {
          grid: {
              display: false  // Disable y-axis grid lines
          },
          beginAtZero: true,
          ticks: {
              color: 'rgb(156, 163, 175 )',
              font: {
                  size: 12
              }
          },
          title: {
            display: true,
            text: "Naira ( ₦ )",
            color: "#9a9cab",
            font: {
              weight: "bold" as "bold" | "normal" | "lighter" | "bolder",
            }
          },
      },
      y: {
          grid: {
              display: false  // Disable y-axis grid lines
          }, 
          ticks: {
              color: 'rgb(156, 163, 175 )',
              font: {
                  size: 12
              }
          }
          
      }
  },
  
};

export const deliveryOptionsGraphOptions = {
  indexAxis: 'y' as "y" | "x" | undefined,  // Flip the axis
  plugins: {
      legend: {
          labels: {
              color: '#9a9cab',
              font: {
                weight: "bold" as "bold" | "normal" | "lighter" | "bolder",
              }
          },
          display: true
      }
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
      x: {
          grid: {
              display: false  // Disable y-axis grid lines
          },
          beginAtZero: true,
          ticks: {
              color: 'rgb(156, 163, 175 )',
              font: {
                  size: 12
              }
          },
      },
      y: {
          grid: {
              display: false  // Disable y-axis grid lines
          }, 
          ticks: {
              color: 'rgb(156, 163, 175 )',
              font: {
                  size: 12
              }
          }
          
      }
  },
  
};

export const getDataset = (orders: any[]) => {

  days.map((day, i) => {

    let labels: string[] = [];
        
    labels[0] = days.slice(currentDay-2, currentDay-1 !== 0 ? currentDay-1 : undefined)[0];
    labels[1] = days.slice(currentDay-1, currentDay !== 0 ? currentDay : undefined)[0];
    labels[2] = days.slice(currentDay-7, currentDay-6 !== 0 ? currentDay-6 : undefined)[0];
    labels[3] = days.slice(currentDay-6, currentDay-5 !== 0 ? currentDay-5 : undefined)[0];
    labels[4] = days.slice(currentDay-5, currentDay-4 !== 0 ? currentDay-4 : undefined)[0];
    labels[5] = days.slice(currentDay-4, currentDay-3 !== 0 ? currentDay-3 : undefined)[0];
    labels[6] = days.slice(currentDay-3, currentDay-2 !== 0 ? currentDay-2 : undefined)[0];
    labels[7] = days.slice(currentDay-2, currentDay-1 !== 0 ? currentDay-1 : undefined)[0];
    labels[8] = days.slice(currentDay-1, currentDay !== 0 ? currentDay : undefined)[0];
    labels[9] = days.slice(currentDay-7, currentDay-6 !== 0 ? currentDay-6 : undefined)[0];
    labels[10] = days.slice(currentDay-6, currentDay-5 !== 0 ? currentDay-5 : undefined)[0];
    labels[11] = days.slice(currentDay-5, currentDay-4 !== 0 ? currentDay-4 : undefined)[0];
    labels[12] = days.slice(currentDay-4, currentDay-3 !== 0 ? currentDay-3 : undefined)[0];
    labels[13] = days.slice(currentDay-3, currentDay-2 !== 0 ? currentDay-2 : undefined)[0];
    labels[14] = days.slice(currentDay-2, currentDay-1 !== 0 ? currentDay-1 : undefined)[0];
    labels[15] = days.slice(currentDay-1, currentDay !== 0 ? currentDay : undefined)[0];
    labels[16] = days.slice(currentDay-7, currentDay-6 !== 0 ? currentDay-6 : undefined)[0];
    labels[17] = days.slice(currentDay-6, currentDay-5 !== 0 ? currentDay-5 : undefined)[0];
    labels[18] = days.slice(currentDay-5, currentDay-4 !== 0 ? currentDay-4 : undefined)[0];
    labels[19] = days.slice(currentDay-4, currentDay-3 !== 0 ? currentDay-3 : undefined)[0];
    labels[20] = days.slice(currentDay-3, currentDay-2 !== 0 ? currentDay-2 : undefined)[0];
    labels[21] = days.slice(currentDay-2, currentDay-1 !== 0 ? currentDay-1 : undefined)[0];
    labels[22] = days.slice(currentDay-1, currentDay !== 0 ? currentDay : undefined)[0];
    labels[23] = days.slice(currentDay-7, currentDay-6 !== 0 ? currentDay-6 : undefined)[0];
    labels[24] = days.slice(currentDay-6, currentDay-5 !== 0 ? currentDay-5 : undefined)[0];
    labels[25] = days.slice(currentDay-5, currentDay-4 !== 0 ? currentDay-4 : undefined)[0];
    labels[26] = days.slice(currentDay-4, currentDay-3 !== 0 ? currentDay-3 : undefined)[0];
    labels[27] = days.slice(currentDay-3, currentDay-2 !== 0 ? currentDay-2 : undefined)[0];
    labels[28] = days.slice(currentDay-2, currentDay-1 !== 0 ? currentDay-1 : undefined)[0];
    labels[29] = days.slice(currentDay-1, currentDay !== 0 ? currentDay : undefined)[0];
    labels[30] = days[currentDay];


    for(let j = 0; j < 30; j++){
      dailyDataLabels[j+1] = labels.slice(-(j+2));

      //sorting data labels for use in sales data calculation
      sortedDailyDataLabels[j+1] = labels.slice(-(j+2)).reverse().map((val, index) => {
        for(let k = 0; k < days.length; k++){
          if(val === days[k]){
            return {
              [val]: currentDate - index <= 0 ? new Date(currentMonth === 0 ? currentYear -1 : currentYear, currentMonth === 0 ? 12 : currentMonth, 0).getDate() - Math.abs(currentDate-index) : currentDate - index
            };
          }
        }
      });
    }
      
    
  });

  months.forEach((month, i) => {

    let labels: string[] = [];
    
    labels[0] = months.slice(currentMonth-12, currentMonth-11 !== 0 ? currentMonth-11 : undefined)[0];
    labels[1] = months.slice(currentMonth-11, currentMonth-10 !== 0 ? currentMonth-10 : undefined)[0];
    labels[2] = months.slice(currentMonth-10, currentMonth-9 !== 0 ? currentMonth-9 : undefined)[0];
    labels[3] = months.slice(currentMonth-9, currentMonth-8 !== 0 ? currentMonth-8 : undefined)[0];
    labels[4] = months.slice(currentMonth-8, currentMonth-7 !== 0 ? currentMonth-7 : undefined)[0];
    labels[5] = months.slice(currentMonth-7, currentMonth-6 !== 0 ? currentMonth-6 : undefined)[0];
    labels[6] = months.slice(currentMonth-6, currentMonth-5 !== 0 ? currentMonth-5 : undefined)[0];
    labels[7] = months.slice(currentMonth-5, currentMonth-4 !== 0 ? currentMonth-4 : undefined)[0];
    labels[8] = months.slice(currentMonth-4, currentMonth-3 !== 0 ? currentMonth-3 : undefined)[0];
    labels[9] = months.slice(currentMonth-3, currentMonth-2 !== 0 ? currentMonth-2 : undefined)[0];
    labels[10] = months.slice(currentMonth-2, currentMonth-1 !== 0 ? currentMonth-1 : undefined)[0];
    labels[11] = months.slice(currentMonth-1, currentMonth !== 0 ? currentMonth : undefined)[0];
    labels[12] = months[currentMonth];

    for(let j = 0; j < 14; j++){
      monthDataLabels[j+1] = labels.slice(-(j+2));

       //sorting data labels for use in sales data calculation
      sortedMonthDataLabels[j+1] = labels.slice(-(j+2)).reverse().map((val, index) => {
        for(let k = 0; k < months.length; k++){
          if(val === months[k]){
            return {
              [k]:  val + '-' + `${currentMonth - index < 0 ? currentYear-1 : currentYear}`
            };
          }
        }

        return {};
      });
      
    }

    
  });

  for(let i = 1; i < 13; i++){
    annualDataLabels[i] = Array(i+1).fill(0).map((_, index)=> index).map((index, _) => currentYear - index).sort();
  }
  

  //extracting order items to generate sales data

  for (let i = 0; i < 30; i++) {
    if (!dailyNoOfAddToCart[i + 1]) {
      dailyNoOfAddToCart[i + 1] = {};
    }
    if (!dailyNoOfCheckout[i + 1]) {
      dailyNoOfCheckout[i + 1] = {};
    }
    if (!dailyNoOfClosed[i + 1]) {
      dailyNoOfClosed[i + 1] = {};
    }
    if (!dailyNoOfStreetzwyze[i + 1]) {
      dailyNoOfStreetzwyze[i + 1] = {};
    }
    if (!dailyNoOfInterswitch[i + 1]) {
      dailyNoOfInterswitch[i + 1] = {};
    }
    if (!dailyNoOfMainland[i + 1]) {
      dailyNoOfMainland[i + 1] = {};
    }
    if (!dailyNoOfIsland[i + 1]) {
      dailyNoOfIsland[i + 1] = {};
    }
    if (!dailyNoOfOutside[i + 1]) {
      dailyNoOfOutside[i + 1] = {};
    }

    if(!dailySalesDataAmount[i+1]){
      dailySalesDataAmount[i+1] = {};
    }
    if(!dailyDressesSalesDataAmount[i+1]){
      dailyDressesSalesDataAmount[i+1] = {};
    }
    if(!dailyJumpsuitSalesDataAmount[i+1]){
      dailyJumpsuitSalesDataAmount[i+1] = {};
    }
    if(!dailyTrousersSalesDataAmount[i+1]){
      dailyTrousersSalesDataAmount[i+1] = {};
    }
    if(!dailySalesData[i+1]){
      dailySalesData[i+1] = {};
    }

    for(let j = 0; j < Object.values(sortedDailyDataLabels)[i].length; j++){
      dailySalesData[i + 1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]] = [];
      dailyNoOfAddToCart[i + 1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]] = 0;
      dailyNoOfCheckout[i + 1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]] = 0;
      dailyNoOfClosed[i + 1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]] = 0;

      for(let order of orders){
        let extractedDate = new Date(order.date);
        
        if ( extractedDate.getDate() === Object.values(Object.values(sortedDailyDataLabels)[i][j])[0] && extractedDate.getFullYear() === (currentMonth === 0 && currentDate -(j+1) <= 0 ? currentYear -1 : currentYear) && extractedDate.getMonth() === (currentMonth === 0 && currentDate -(j+1) <= 0 ? 11 : currentDate - (j+1) <= 0 ? currentMonth-1 : currentMonth)) {
          dailySalesData[i + 1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]].push({
            sale: order.sales,
            items: order.items,
          });

          //calculating count of different order status
          dailyNoOfAddToCart[i+1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]] += order.status === 'add to cart' ? 1 : 0;
          dailyNoOfCheckout[i+1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]] += order.status === 'checkout' ? 1 : 0;
          dailyNoOfClosed[i+1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]] += order.status === 'closed' ? 1 : 0;

          //calculating count of different payment type and shipping methods
          dailyNoOfStreetzwyze[i+1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]] += order.paymentType === 'streetzwyze' ? 1 : 0;
          dailyNoOfInterswitch[i+1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]] += order.paymentType === 'interswitch' ? 1 : 0;
          dailyNoOfIsland[i+1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]] += order.shippingMethod === 'island' ? 1 : 0;
          dailyNoOfMainland[i+1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]] += order.shippingMethod === 'mainland' ? 1 : 0;
          dailyNoOfOutside[i+1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]] += order.shippingMethod === 'outside' ? 1 : 0;

          ///calculating daily revenue, together with the separate revenues from dresses, jumpsuits, and trousers
          dailySalesDataAmount[i+1][Object.values(Object.values(sortedDailyDataLabels)[i][j])[0] as string] = dailySalesData[i + 1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]].map(saleData => saleData.sale).reduce((prev, current) => prev + current, 0.0);
          dailyDressesSalesDataAmount[i+1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]] = dailySalesData[i + 1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]].map((saleData) => {
            let sales = saleData.items.filter((item: any)=> item.productType  === 'Dresses').map((item: any) => item.total).reduce((prev: number, current: number) => prev + current, 0.0);;
            return sales;
          }).filter((sales) => sales > 0).reduce((prev, current) => prev + current, 0.0);
          dailyJumpsuitSalesDataAmount[i+1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]] = dailySalesData[i + 1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]].map((saleData) => {
            let sales = saleData.items.filter((item: any)=> item.productType  === 'Jumpsuit').map((item: any) => item.total).reduce((prev: number, current: number) => prev + current, 0.0);
            return sales;
  
          }).filter((sales) => sales > 0).reduce((prev, current) => prev + current, 0.0);
          dailyTrousersSalesDataAmount[i+1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]] = dailySalesData[i + 1][Object.keys(Object.values(sortedDailyDataLabels)[i][j])[0]].map((saleData) => {
            let sales = saleData.items.filter((item: any)=> item.productType  === 'Trousers').map((item: any) => item.total).reduce((prev: number, current: number) => prev + current, 0.0);
            return sales;
  
          }).filter((sales) => sales > 0).reduce((prev, current) => prev + current, 0.0);
        }
      }

      // extracting data for daily graphs
      dailyVisitorsData[i+1] = {
        labels: [
            'Total Visits',
            'Add to Cart',
            'Checkout',
            'Closed',
          ],
          datasets: [
            {
              label: `Visitors: ${(currentDate-(i+1)) <= 0 ? `${new Date(currentMonth === 0 ? currentYear-1 : currentYear, currentMonth === 0 ? 12 : currentMonth, 0).getDate() - Math.abs(currentDate-(i+1))} ${currentMonth === 0 ? months[11] : months[currentMonth-1]}, ${currentMonth === 0 ? currentYear-1 : currentYear}` : `${currentDate-(i+1)} ${months[currentMonth]}, ${currentYear}`} - ${currentDate} ${months[currentMonth]}, ${currentYear}`,
              data:  [
                  Object.values(dailyNoOfAddToCart[i+1]).reduce((prev, current) => prev + current, 0.0) + 
                  Object.values(dailyNoOfCheckout[i+1]).reduce((prev, current) => prev + current, 0.0) +
                  Object.values(dailyNoOfClosed[i+1]).reduce((prev, current) => prev + current, 0.0),
                  Object.values(dailyNoOfAddToCart[i+1]).reduce((prev, current) => prev + current, 0.0),
                  Object.values(dailyNoOfCheckout[i+1]).reduce((prev, current) => prev + current, 0.0),
                  Object.values(dailyNoOfClosed[i+1]).reduce((prev, current) => prev + current, 0.0)
                ],
                backgroundColor: [
                'rgba(255, 165, 0, 0.5)',
                'rgba(81, 178, 202, 0.5)',
                'rgba(74, 72, 199, 0.5)',
                'rgba(230, 230, 250, 0.5)'
                ],
                borderColor: [
                'rgb(255, 165, 0)',
                'rgb(81, 178, 202)',
                'rgb(74, 72, 199)',
                'rgb(230, 230, 250)'
                ],
                borderWidth: 1  
            }
        ]
      };
      dailyProductTypeData[i+1] = {
        labels: [
            'Dresses',
            'Jumpsuit',
            'Trousers'
        ],
        datasets: [
            {
              label: `Sales: ${(currentDate-(i+1)) <= 0 ? `${new Date(currentMonth === 0 ? currentYear-1 : currentYear, currentMonth === 0 ? 12 : currentMonth, 0).getDate() - Math.abs(currentDate-(i+1))} ${currentMonth === 0 ? months[11] : months[currentMonth-1]}, ${currentMonth === 0 ? currentYear-1 : currentYear}` : `${currentDate-(i+1)} ${months[currentMonth]}, ${currentYear}`} - ${currentDate} ${months[currentMonth]}, ${currentYear}`,
              data:  [
                  Object.values(dailyDressesSalesDataAmount[i+1]).reduce((prev, current) => prev + current, 0.0),
                  Object.values(dailyJumpsuitSalesDataAmount[i+1]).reduce((prev, current) => prev + current, 0.0),
                  Object.values(dailyTrousersSalesDataAmount[i+1]).reduce((prev, current) => prev + current, 0.0)
                ],
                backgroundColor: [
                'rgba(255, 165, 0, 0.5)',
                'rgba(81, 178, 202, 0.5)',
                'rgba(74, 72, 199, 0.5)',
                'rgba(230, 230, 250, 0.5)'
                ],
                borderColor: [
                'rgb(255, 165, 0)',
                'rgb(81, 178, 202)',
                'rgb(74, 72, 199)',
                'rgb(230, 230, 250)'
                ],
                borderWidth: 1  
            }
        ]
      };
      dailyData[i+1] = {
      labels: Object.values(dailyDataLabels)[i],
      datasets: [
            {
            label: `Sales: ${(currentDate-(i+1)) <= 0 ? `${new Date(currentMonth === 0 ? currentYear-1 : currentYear, currentMonth === 0 ? 12 : currentMonth, 0).getDate() - Math.abs(currentDate-(i+1))} ${currentMonth === 0 ? months[11] : months[currentMonth-1]}, ${currentMonth === 0 ? currentYear-1 : currentYear}` : `${currentDate-(i+1)} ${months[currentMonth]}, ${currentYear}`} - ${currentDate} ${months[currentMonth]}, ${currentYear}`,
            data: Object.values(sortedDailyDataLabels)[i].map(val => {
                  for(let key in dailySalesDataAmount[i+1]){
                      if(parseInt(key) === Object.values(val)[0]){
                          return dailySalesDataAmount[i+1][key];
                      }
                  }
                  return 0;
              }).reverse(),
              fill: true,
              backgroundColor: 'rgba(80, 200, 120, 0.5)',
              tension: 0.4
          }
      ]
      };
      dailyDeliveryOptionsData[i+1] =  {
        labels: [
            'Mainland',
            'Island',
            'Outside Lagos'
        ],
        datasets: [
            {
              label: `Shipping: ${(currentDate-(i+1)) <= 0 ? `${new Date(currentMonth === 0 ? currentYear-1 : currentYear, currentMonth === 0 ? 12 : currentMonth, 0).getDate() - Math.abs(currentDate-(i+1))} ${currentMonth === 0 ? months[11] : months[currentMonth-1]}, ${currentMonth === 0 ? currentYear-1 : currentYear}` : `${currentDate-(i+1)} ${months[currentMonth]}, ${currentYear}`} - ${currentDate} ${months[currentMonth]}, ${currentYear}`,
              data:  [
                    Object.values(dailyNoOfMainland[i+1]).reduce((prev, current) => prev + current, 0.0),
                    Object.values(dailyNoOfIsland[i+1]).reduce((prev, current) => prev + current, 0.0),
                    Object.values(dailyNoOfOutside[i+1]).reduce((prev, current) => prev + current, 0.0)
                ],
                backgroundColor: [
                'rgba(255, 165, 0, 0.5)',
                'rgba(81, 178, 202, 0.5)',
                'rgba(74, 72, 199, 0.5)',
                ],
                borderColor: [
                'rgb(255, 165, 0)',
                'rgb(81, 178, 202)',
                'rgb(74, 72, 199)',
                ],
                borderWidth: 1  
            }
        ]
      };
      dailyPaymentTypeData[i+1] = {
        labels: [
          'streetzwyze',
          'interswitch'
        ],
        datasets: [{
            label: 'Payment Type Selected',
            data: [
              Object.values(dailyNoOfStreetzwyze[i+1]).reduce((prev, current) => prev + current, 0.0),
              Object.values(dailyNoOfInterswitch[i+1]).reduce((prev, current) => prev + current, 0.0),
            ],
            backgroundColor: [
              'rgba(255, 165, 0, 0.5)',
              'rgba(81, 178, 202, 0.5)'
            ],
            hoverOffset: 4
        }]
      }
      
    }

  }
  
  for (let i = 0; i < 14; i++) {
    if (!monthNoOfAddToCart[i + 1]) {
      monthNoOfAddToCart[i + 1] = {};
    }
    if (!monthNoOfCheckout[i + 1]) {
      monthNoOfCheckout[i + 1] = {};
    }
    if (!monthNoOfClosed[i + 1]) {
      monthNoOfClosed[i + 1] = {};
    }
    if (!monthNoOfStreetzwyze[i + 1]) {
      monthNoOfStreetzwyze[i + 1] = {};
    }
    if (!monthNoOfInterswitch[i + 1]) {
      monthNoOfInterswitch[i + 1] = {};
    }
    if (!monthNoOfMainland[i + 1]) {
      monthNoOfMainland[i + 1] = {};
    }
    if (!monthNoOfIsland[i + 1]) {
      monthNoOfIsland[i + 1] = {};
    }
    if (!monthNoOfOutside[i + 1]) {
      monthNoOfOutside[i + 1] = {};
    }
    if(!monthSalesDataAmount[i+1]){
      monthSalesDataAmount[i+1] = {};
    }
    if(!monthDressesSalesDataAmount[i+1]){
      monthDressesSalesDataAmount[i+1] = {};
    }
    if(!monthJumpsuitSalesDataAmount[i+1]){
      monthJumpsuitSalesDataAmount[i+1] = {};
    }
    if(!monthTrousersSalesDataAmount[i+1]){
      monthTrousersSalesDataAmount[i+1] = {};
    }
    if(!monthSalesData[i+1]){
      monthSalesData[i+1] =  {};
    }
    
    for(let j = 0; j < Object.values(sortedMonthDataLabels)[i].length; j++){
      monthSalesData[i + 1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]] = [];
      monthNoOfAddToCart[i + 1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]] = 0;
      monthNoOfCheckout[i + 1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]] = 0;
      monthNoOfClosed[i + 1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]] = 0;
      
      for(let order of orders){
        let extractedDate = new Date(order.date);
        if (  extractedDate.getMonth() === parseInt(Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]) && extractedDate.getFullYear() === parseInt(Object.values(Object.values(sortedMonthDataLabels)[i][j])[0].split('-')[1])) {
          monthSalesData[i + 1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]].push({
            sale: order.sales,
            items: order.items,
          });
          //calculating count of different order status
          monthNoOfAddToCart[i+1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]] += order.status === 'add to cart' ? 1 : 0;
          monthNoOfCheckout[i+1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]] += order.status === 'checkout' ? 1 : 0;
          monthNoOfClosed[i+1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]] += order.status === 'closed' ? 1 : 0;

          //calculating count of different payment type and shipping methods
          monthNoOfStreetzwyze[i+1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]] += order.paymentType === 'streetzwyze' ? 1 : 0;
          monthNoOfInterswitch[i+1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]] += order.paymentType === 'interswitch' ? 1 : 0;
          monthNoOfIsland[i+1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]] += order.shippingMethod === 'island' ? 1 : 0;
          monthNoOfMainland[i+1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]] += order.shippingMethod === 'mainland' ? 1 : 0;
          monthNoOfOutside[i+1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]] += order.shippingMethod === 'outside' ? 1 : 0;

          ///calculating monthly revenue, together with the separate revenues from dresses, jumpsuits, and trousers
          monthSalesDataAmount[i+1][Object.values(Object.values(sortedMonthDataLabels)[i][j])[0]] = monthSalesData[i + 1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]].map(saleData => saleData.sale).reduce((prev, current) => prev + current, 0.0);
          monthDressesSalesDataAmount[i+1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]] = monthSalesData[i + 1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]].map((saleData) => {
            let sales = saleData.items.filter((item: any)=> item.productType  === 'Dresses').map((item: any) => item.total).reduce((prev: number, current: number) => prev + current, 0.0);
            return sales;
          }).filter((sales) => sales > 0).reduce((prev, current) => prev + current, 0.0);
          monthJumpsuitSalesDataAmount[i+1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]] = monthSalesData[i + 1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]].map((saleData) => {
            let sales = saleData.items.filter((item: any)=> item.productType  === 'Jumpsuit').map((item: any) => item.total).reduce((prev: number, current: number) => prev + current, 0.0);
            return sales;

          }).filter((sales) => sales > 0).reduce((prev, current) => prev + current, 0.0);
          monthTrousersSalesDataAmount[i+1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]] = monthSalesData[i + 1][Object.keys(Object.values(sortedMonthDataLabels)[i][j])[0]].map((saleData) => {
            let sales = saleData.items.filter((item: any)=> item.productType  === 'Trousers').map((item: any) => item.total).reduce((prev: number, current: number) => prev + current, 0.0);
            return sales;

          }).filter((sales) => sales > 0).reduce((prev, current) => prev + current, 0.0);
        }
      }


      // extracting data for monthly graphs     
      lastMonthValues[i+1] =  Object.values(monthDataLabels)[i].length-1;
      monthVisitorsData[i+1] =  {
        labels: [
            'Total Visits',
            'Add to Cart',
            'Checkout',
            'Closed',
        ],
        datasets: [
            {
              label: `Visitors: ${new Date(currentMonth === 0 ? currentYear-1 : currentYear, currentMonth === 0 ? 12-(i+1-1) : currentMonth-i+1, 0).getDate() - Math.abs(currentDate - 29)} ${Object.values(monthDataLabels)[i][0]}, ${Object.values(Object.values(sortedMonthDataLabels)[i][j])[0].split('-')[1]} - ${currentDate} ${Object.values(monthDataLabels)[i][lastMonthValues[i+1]]}, ${currentYear}`,
              data:  [
                Object.values(monthNoOfAddToCart[i+1]).reduce((prev, current) => prev + current, 0.0) + 
                Object.values(monthNoOfCheckout[i+1]).reduce((prev, current) => prev + current, 0.0) +
                Object.values(monthNoOfClosed[i+1]).reduce((prev, current) => prev + current, 0.0),
                Object.values(monthNoOfAddToCart[i+1]).reduce((prev, current) => prev + current, 0.0),
                Object.values(monthNoOfCheckout[i+1]).reduce((prev, current) => prev + current, 0.0),
                Object.values(monthNoOfClosed[i+1]).reduce((prev, current) => prev + current, 0.0),,
                ],
                backgroundColor: [
                'rgba(255, 165, 0, 0.5)',
                'rgba(81, 178, 202, 0.5)',
                'rgba(74, 72, 199, 0.5)',
                'rgba(230, 230, 250, 0.5)'
                ],
                borderColor: [
                'rgb(255, 165, 0)',
                'rgb(81, 178, 202)',
                'rgb(74, 72, 199)',
                'rgb(230, 230, 250)'
                ],
                borderWidth: 1  
            }
        ]
      };
      monthProductTypeData[i+1] =  {
        labels: [
            'Dresses',
            'Jumpsuit',
            'Trousers'
        ],
        datasets: [
            {
              label: `Sales: ${new Date(currentMonth === 0 ? currentYear-1 : currentYear, currentMonth === 0 ? 12-(i+1-1) : currentMonth-i+1, 0).getDate() - Math.abs(currentDate - 29)} ${Object.values(monthDataLabels)[i][0]}, ${Object.values(Object.values(sortedMonthDataLabels)[i][j])[0].split('-')[1]} - ${currentDate} ${Object.values(monthDataLabels)[i][lastMonthValues[i+1]]}, ${currentYear}`,
              data:  [
                    Object.values(monthDressesSalesDataAmount[i+1]).reduce((prev, current) => prev + current, 0.0),
                    Object.values(monthJumpsuitSalesDataAmount[i+1]).reduce((prev, current) => prev + current, 0.0),
                    Object.values(monthTrousersSalesDataAmount[i+1]).reduce((prev, current) => prev + current, 0.0)
                ],
                backgroundColor: [
                'rgba(255, 165, 0, 0.5)',
                'rgba(81, 178, 202, 0.5)',
                'rgba(74, 72, 199, 0.5)',
                'rgba(230, 230, 250, 0.5)'
                ],
                borderColor: [
                'rgb(255, 165, 0)',
                'rgb(81, 178, 202)',
                'rgb(74, 72, 199)',
                'rgb(230, 230, 250)'
                ],
                borderWidth: 1  
            }
        ]
      };

      monthData[i+1] = {
        labels: Object.values(monthDataLabels)[i],
        datasets: [
              {
              label: `Sales: ${new Date(currentMonth === 0 ? currentYear-1 : currentYear, currentMonth === 0 ? 12-(i+1-1) : currentMonth-i+1, 0).getDate() - Math.abs(currentDate - 29)} ${Object.values(monthDataLabels)[i][0]}, ${Object.values(Object.values(sortedMonthDataLabels)[i][j])[0].split('-')[1]} - ${currentDate} ${Object.values(monthDataLabels)[i][lastMonthValues[i+1]]}, ${currentYear}`,
              data: Object.values(sortedMonthDataLabels)[i].map(val => {
                    for(let key in monthSalesDataAmount[i+1]){
                        if(key === Object.values(val)[0]){
                            return monthSalesDataAmount[i+1][key];
                        }
                    }
                    return 0;
                }).reverse(),
                fill: true,
                backgroundColor: 'rgba(80, 200, 120, 0.5)',
                tension: 0.4
            }
        ]
      };
      monthDeliveryOptionsData[i+1] =  {
        labels: [
            'Mainland',
            'Island',
            'Outside Lagos'
        ],
        datasets: [
            {
              label: `Shipping: ${new Date(currentMonth === 0 ? currentYear-1 : currentYear, currentMonth === 0 ? 12-(i+1-1) : currentMonth-i+1, 0).getDate() - Math.abs(currentDate - 29)} ${Object.values(monthDataLabels)[i][0]}, ${Object.values(Object.values(sortedMonthDataLabels)[i][j])[0].split('-')[1]} - ${currentDate} ${Object.values(monthDataLabels)[i][lastMonthValues[i+1]]}, ${currentYear}`,
              data:  [
                    Object.values(monthNoOfMainland[i+1]).reduce((prev, current) => prev + current, 0.0),
                    Object.values(monthNoOfIsland[i+1]).reduce((prev, current) => prev + current, 0.0),
                    Object.values(monthNoOfOutside[i+1]).reduce((prev, current) => prev + current, 0.0)
                ],
                backgroundColor: [
                'rgba(255, 165, 0, 0.5)',
                'rgba(81, 178, 202, 0.5)',
                'rgba(74, 72, 199, 0.5)',
                ],
                borderColor: [
                'rgb(255, 165, 0)',
                'rgb(81, 178, 202)',
                'rgb(74, 72, 199)',
                ],
                borderWidth: 1  
            }
        ]
      };
      monthPaymentTypeData[i+1] = {
        labels: [
          'streetzwyze',
          'interswitch'
        ],
        datasets: [{
            label: 'Payment Type Selected',
            data: [
              Object.values(monthNoOfStreetzwyze[i+1]).reduce((prev, current) => prev + current, 0.0),
              Object.values(monthNoOfInterswitch[i+1]).reduce((prev, current) => prev + current, 0.0),
            ],
            backgroundColor: [
              'rgba(255, 165, 0, 0.5)',
              'rgba(81, 178, 202, 0.5)'
            ],
            hoverOffset: 4
        }]
      }
    }        
    
    
  }


  for(let i = 0; i < 12; i++){
    if (!annualNoOfAddToCart[i + 1]) {
      annualNoOfAddToCart[i + 1] = {};
    }
    if (!annualNoOfCheckout[i + 1]) {
      annualNoOfCheckout[i + 1] = {};
    }
    if (!annualNoOfClosed[i + 1]) {
      annualNoOfClosed[i + 1] = {};
    }
    if (!annualNoOfStreetzwyze[i + 1]) {
      annualNoOfStreetzwyze[i + 1] = {};
    }
    if (!annualNoOfInterswitch[i + 1]) {
      annualNoOfInterswitch[i + 1] = {};
    }
    if (!annualNoOfMainland[i + 1]) {
      annualNoOfMainland[i + 1] = {};
    }
    if (!annualNoOfIsland[i + 1]) {
      annualNoOfIsland[i + 1] = {};
    }
    if (!annualNoOfOutside[i + 1]) {
      annualNoOfOutside[i + 1] = {};
    }

    if(!annualSalesDataAmount[i+1]){
      annualSalesDataAmount[i+1] = {};
    }
    if(!annualDressesSalesDataAmount[i+1]){
      annualDressesSalesDataAmount[i+1] = {};
    }
    if(!annualJumpsuitSalesDataAmount[i+1]){
      annualJumpsuitSalesDataAmount[i+1] = {};
    }
    if(!annualTrousersSalesDataAmount[i+1]){
      annualTrousersSalesDataAmount[i+1] = {};
    }
    if(!annualSalesData[i+1]){
      annualSalesData[i+1] = {};
    }
    
      for(let j = 0; j < annualDataLabels[i+1].length; j++){
        annualSalesData[i + 1][annualDataLabels[i+1][j]] = [];
        annualNoOfAddToCart[i + 1][annualDataLabels[i+1][j]] = 0;
        annualNoOfCheckout[i + 1][annualDataLabels[i+1][j]] = 0;
        annualNoOfClosed[i + 1][annualDataLabels[i+1][j]] = 0;
        
        for(let order of orders){
          let extractedDate = new Date(order.date);
          if (annualDataLabels[i+1][j] === extractedDate.getFullYear()) {
            annualSalesData[i+1][annualDataLabels[i+1][j]].push({
              sale: order.sales,
              items: order.items
            });
            //calculating count of different order status
            annualNoOfAddToCart[i+1][annualDataLabels[i+1][j]] += order.status === 'add to cart' ? 1 : 0;
            annualNoOfCheckout[i+1][annualDataLabels[i+1][j]] += order.status === 'checkout' ? 1 : 0;
            annualNoOfClosed[i+1][annualDataLabels[i+1][j]] += order.status === 'closed' ? 1 : 0;

            
            //calculating count of different payment type and shipping methods
            annualNoOfStreetzwyze[i+1][annualDataLabels[i+1][j]] += order.paymentType === 'streetzwyze' ? 1 : 0;
            annualNoOfInterswitch[i+1][annualDataLabels[i+1][j]] += order.paymentType === 'interswitch' ? 1 : 0;
            annualNoOfIsland[i+1][annualDataLabels[i+1][j]] += order.shippingMethod === 'island' ? 1 : 0;
            annualNoOfMainland[i+1][annualDataLabels[i+1][j]] += order.shippingMethod === 'mainland' ? 1 : 0;
            annualNoOfOutside[i+1][annualDataLabels[i+1][j]] += order.shippingMethod === 'outside' ? 1 : 0;
            
            ///calculating annual revenue, together with the separate revenues from dresses, jumpsuits, and trousers
            annualSalesDataAmount[i+1][annualDataLabels[i+1][j]] = annualSalesData[i+1][annualDataLabels[i+1][j]].map(saleData => saleData.sale).reduce((prev, current) => prev + current, 0.0);
            annualDressesSalesDataAmount[i+1][annualDataLabels[i+1][j]] = annualSalesData[i+1][annualDataLabels[i+1][j]].map(saleData => {
              let sales = saleData.items.filter((item: any)=> item.productType  === 'Dresses').map((item: any) => item.total).reduce((prev: number, current: number) => prev + current, 0.0);
              return sales;
            }).filter((sales) => sales > 0).reduce((prev, current) => prev + current, 0.0);
            annualJumpsuitSalesDataAmount[i+1][annualDataLabels[i+1][j]] = annualSalesData[i+1][annualDataLabels[i+1][j]].map(saleData => {
              let sales = saleData.items.filter((item: any)=> item.productType  === 'Jumpsuit').map((item: any) => item.total).reduce((prev: number, current: number) => prev + current, 0.0);
              return sales;
            }).filter((sales) => sales > 0).reduce((prev, current) => prev + current, 0.0);
            annualTrousersSalesDataAmount[i+1][annualDataLabels[i+1][j]] = annualSalesData[i+1][annualDataLabels[i+1][j]].map(saleData => {
              let sales = saleData.items.filter((item: any)=> item.productType  === 'Trousers').map((item: any) => item.total).reduce((prev: number, current: number) => prev + current, 0.0);
              return sales;
            }).filter((sales) => sales > 0).reduce((prev, current) => prev + current, 0.0);
          }
        }
      
      
      
      annualVisitorsData[i+1] =  {
        labels: [
            'Total Visits',
            'Add to Cart',
            'Checkout',
            'Closed',
        ],
        datasets: [
            {
              label: `Visitors: ${currentYear-(i+1)} - ${currentYear}`,
              data:  [
                Object.values(annualNoOfAddToCart[i+1]).reduce((prev, current) => prev + current, 0.0) + 
                Object.values(annualNoOfCheckout[i+1]).reduce((prev, current) => prev + current, 0.0) +
                Object.values(annualNoOfClosed[i+1]).reduce((prev, current) => prev + current, 0.0),
                Object.values(annualNoOfAddToCart[i+1]).reduce((prev, current) => prev + current, 0.0),
                Object.values(annualNoOfCheckout[i+1]).reduce((prev, current) => prev + current, 0.0),
                Object.values(annualNoOfClosed[i+1]).reduce((prev, current) => prev + current, 0.0)
                ],
                backgroundColor: [
                'rgba(255, 165, 0, 0.5)',
                'rgba(81, 178, 202, 0.5)',
                'rgba(74, 72, 199, 0.5)',
                'rgba(230, 230, 250, 0.5)'
                ],
                borderColor: [
                'rgb(255, 165, 0)',
                'rgb(81, 178, 202)',
                'rgb(74, 72, 199)',
                'rgb(230, 230, 250)'
                ],
                borderWidth: 1  
            }
        ]
      };
      annualProductTypeData[i+1] =  {
        labels: [
            'Dresses',
            'Jumpsuit',
            'Trousers'
        ],
        datasets: [
            {
              label: `Sales: ${currentYear-(i+1)} - ${currentYear}`,
              data:  [
                    Object.values(annualDressesSalesDataAmount[i+1]).reduce((prev, current) => prev + current, 0.0),
                    Object.values(annualJumpsuitSalesDataAmount[i+1]).reduce((prev, current) => prev + current, 0.0),
                    Object.values(annualTrousersSalesDataAmount[i+1]).reduce((prev, current) => prev + current, 0.0)
                ],
                backgroundColor: [
                'rgba(255, 165, 0, 0.5)',
                'rgba(81, 178, 202, 0.5)',
                'rgba(74, 72, 199, 0.5)',
                'rgba(230, 230, 250, 0.5)'
                ],
                borderColor: [
                'rgb(255, 165, 0)',
                'rgb(81, 178, 202)',
                'rgb(74, 72, 199)',
                'rgb(230, 230, 250)'
                ],
                borderWidth: 1  
            }
        ]
      };
      annualData[i+1] = {
        labels: Object.values(annualDataLabels)[i].map(year => '' + year),
        datasets: [
            {
                label: `Sales: ${currentYear-(i+1)} - ${currentYear}`,
                data: Object.values(annualDataLabels)[i].map(val => {
                    for(let key in annualSalesDataAmount[i+1]){
                        if(key === val.toString()){
                            return annualSalesDataAmount[i+1][key];
                        }
                    }
                    return 0;

                }),                                        
                fill: true,
                backgroundColor: 'rgba(80, 200, 120, 0.5)',
                tension: 0.4
            }
        ]
      };
      annualDeliveryOptionsData[i+1] =  {
        labels: [
            'Mainland',
            'Island',
            'Outside Lagos'
        ],
        datasets: [
            {
              label: `Shipping: ${currentYear-(i+1)} - ${currentYear}`,
              data:  [
                    Object.values(annualNoOfMainland[i+1]).reduce((prev, current) => prev + current, 0.0),
                    Object.values(annualNoOfIsland[i+1]).reduce((prev, current) => prev + current, 0.0),
                    Object.values(annualNoOfOutside[i+1]).reduce((prev, current) => prev + current, 0.0)
                ],
                backgroundColor: [
                'rgba(255, 165, 0, 0.5)',
                'rgba(81, 178, 202, 0.5)',
                'rgba(74, 72, 199, 0.5)',
                ],
                borderColor: [
                'rgb(255, 165, 0)',
                'rgb(81, 178, 202)',
                'rgb(74, 72, 199)',
                ],
                borderWidth: 1  
            }
        ]
      };
      annualPaymentTypeData[i+1] = {
        labels: [
          'streetzwyze',
          'interswitch'
        ],
        datasets: [{
            label: 'Payment Type Selected',
            data: [
              Object.values(annualNoOfStreetzwyze[i+1]).reduce((prev, current) => prev + current, 0.0),
              Object.values(annualNoOfInterswitch[i+1]).reduce((prev, current) => prev + current, 0.0),
            ],
            backgroundColor: [
              'rgba(255, 165, 0, 0.5)',
              'rgba(81, 178, 202, 0.5)'
            ],
            hoverOffset: 4
        }]
      }
    }

  }


  return [dailyData, dailyProductTypeData, dailyVisitorsData, dailyDeliveryOptionsData, dailyPaymentTypeData, monthData, monthProductTypeData, monthVisitorsData, monthDeliveryOptionsData, monthPaymentTypeData, annualData, annualProductTypeData, annualVisitorsData, annualDeliveryOptionsData, annualPaymentTypeData];
    
}


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
