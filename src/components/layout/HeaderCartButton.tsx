'use client';

import classes from "./HeaderCartButton.module.css";
import {useEffect, useState } from "react";
import useCart from "@/store/useCart";

const HeaderCartButton = (props: any) => {
  const {items} = useCart();
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
      <span className={`relative ${buttonIsHighlighted ? classes.bump : ``}`} onClick={props.onClick}>
        <i className="fa-solid cursor-pointer fa-bag-shopping text-gray-600 hover:text-[1.3rem] text-xl"></i>
        {numberOfCartItems > 0 && <span className='bg-black px-[6px] py-[2px] text-[0.6rem] rounded-[50%] text-white font-sans absolute left-[3.2px] top-[8.5px] font-bold'>{numberOfCartItems}</span>}
      </span>
    </>
  );
};

export default HeaderCartButton;
