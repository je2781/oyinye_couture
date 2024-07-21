export interface DressSizesJsxObj {
  [key: string]: JSX.Element[];
}

export type Size = {
  price: number;
  stock: number;
  variantId: string;
  number: number;
}

export type DressSize = {
  price: number;
  stock: number;
  variantId: string;
  color?: string;
}

export interface DressSizesObj {
  [key: string]: DressSize;
}