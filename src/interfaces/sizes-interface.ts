export interface SizesJsxObj {
  [key: string]: JSX.Element[];
}

type Size = {
  price: number;
  id: string;
  stock: number
}

export interface SizesObj {
  [key: string]: Size;
}