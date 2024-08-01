export interface DressSizesJsxObj {
  [key: string]: JSX.Element[];
}


export type DressSize = {
  price: number;
  stock: number;
  variantId: string;
  number?: number;
  color?: string;
}

export type DressSizesObj = {
  [key: string]: DressSize;
}
