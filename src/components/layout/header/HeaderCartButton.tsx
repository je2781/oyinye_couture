"use client";

import { useEffect, useState } from "react";
import useCart from "@/store/useCart";

const HeaderCartButton = (props: any) => {
  const { items } = useCart();
  const [buttonIsHighlighted, setButtonIsHighlighted] = useState(false);
  const numberOfCartItems = items.length;

  useEffect(() => {
    const identifier = setTimeout(() => {
      setButtonIsHighlighted(false);
    }, 300);

    return () => {
      setButtonIsHighlighted(true);
      clearTimeout(identifier);
    };
  }, [numberOfCartItems]);

  return (
    <>
      <span className="relative" onClick={props.onClick}>
        <i
          className={`fa-solid cursor-pointer fa-bag-shopping ${
            props.isCheckout
              ? "text-checkout-200"
              : "text-gray-600 transition-all duration-300 ease-out transform hover:scale-125"
          } text-xl`}
        ></i>
        {numberOfCartItems > 0 && (!props.isCheckout || !props.isAuth) && (
          <span
            className={`${
              buttonIsHighlighted ? "animate__animated animate__bounce" : ``
            } transition-all duration-300 ease-out transform hover:scale-125 bg-black px-[6px] py-[2px] text-[0.6rem] rounded-[50%] text-white font-sans absolute left-[3.2px] top-[8.5px] font-bold`}
          >
            {numberOfCartItems}
          </span>
        )}
      </span>
    </>
  );
};

export default HeaderCartButton;
