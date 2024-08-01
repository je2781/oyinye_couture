import { DressSize } from "./dress-size-interface"

export type CartItemObj = {
    [key: string]: DressSize & {title: string, color: string, quantity: number, id: string}
  }