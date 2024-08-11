import { DressSize } from "./dress-size-interface";

export interface SizeData {
  color: string;
  number?: number;
  price?: string;
  stock?: number;
}
  export interface DressColorObj {
    [key: string]: {
      imageFront: string[],
      imageBack: string,
    };
  }