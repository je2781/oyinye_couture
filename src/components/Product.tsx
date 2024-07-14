'use client';

import { useEffect } from "react";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import ProductQuickView from "./ProductQuickView";

const ProductComponent = ({ product }: any) => {
    const[isModalOpen, setIsModalOpen] = React.useState(false);
    //sorting out the sizes of the first dress
    product.colors[0].sizes.sort((a: any, b: any) => a.number - b.number);

    const showModalHandler = (e: React.MouseEvent) => {
      const item = e.currentTarget;
      item.classList.remove('expand');
      setIsModalOpen(true);
    }
  
    const hideModalHandler = () => {
      setIsModalOpen(false);
    }

    useEffect(() => {
      if (isModalOpen) {
        document.body.style.overflow = "hidden";
        
      } else {
        document.body.style.overflow = "auto";
      }
  
      return () => {
        document.body.style.overflow = "auto";
      };
    }, [isModalOpen]);

    
  return (
    <div className="relative">
      <article
        className="shadow-md flex flex-col gap-y-3 items-center cursor-pointer pb-6 relative"
        data-hover={product.colors[0].imageBackBase64}
        onMouseLeave={(e) => {
          if(!isModalOpen){
            const item = e.currentTarget;
            const imgElement = item.querySelector('img') as HTMLImageElement;
            const zoomHint = item.parentNode!.querySelector('#zoom-hint') as HTMLDivElement;
            imgElement.src = product.colors[0].imageFrontBase64[0];

            zoomHint.classList.remove('expand');

          }

        }}
        
        onMouseOver={(event) => {
          if (!isModalOpen) {
            const item = event.currentTarget;
            const hoverImage = item.getAttribute('data-hover');
            const imgElement = item.querySelector('img') as HTMLImageElement;
            const zoomHint = item.parentNode!.querySelector('#zoom-hint') as HTMLDivElement;
            imgElement.src = hoverImage!;

            zoomHint.classList.add('expand');
          }

        }}
      >
          {isModalOpen && <ProductQuickView onHideModal={hideModalHandler} product={product}/>}
          <Image
              src={product.colors[0].imageFrontBase64[0]}
              alt="featured-Image"
              width={300}
              height={450}
          />
          <h3 className="text-gray-500 font-sans text-lg">{product.title}</h3>
          <h3 className="text-sm">
              &#8358;{product.colors[0].sizes[0].price.toLocaleString("en-US")}
          </h3>
          {product.colors[0].sizes[0].stock === 0 && <section 
            className="absolute font-sans bg-black px-4 py-1 rounded-3xl cursor-pointer text-white bottom-[27%] left-[4%] text-sm"
          >
            Sold out
          </section>}
      </article>
      <section 
          onClick={showModalHandler} className="opacity-0 rounded-md absolute left-[20%] flex h-6 px-2 py-4 w-[100px] flex-row items-center gap-x-1 top-[50%] font-serif  cursor-pointer text-blue-400" 
          id='zoom-hint'
          onMouseOut={(e) => {
            if(!isModalOpen){
  
              const item = e.currentTarget;
              item.classList.remove('expand');
            }
  
  
          }}
          onMouseOver={(event) => {
            if(!isModalOpen){

              const item = event.currentTarget;
              item.classList.add('expand');
      
            }
    
          }}
        >
          <i className="fa-solid fa-eye text-xs"></i>
          <h4 className="text-[.8rem]">Quick View</h4>
      </section>
    </div>

  );
};

export default ProductComponent;
