
export interface SizeData {
  color: string;
  number?: number;
  price?: string;
  stock?: number;
}
  export interface DressColorObj {
    [key: string]: {
      imageFront: File[] | null,
      imageBack: File | null,
    };
  }