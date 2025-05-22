import { DressSize } from "./dress-size-interface"

export type CartItemObj = {
    [key: string]: DressSize & {color?: string, title?: string, quantity?: number, id?: string, hex_code?: string}
  }