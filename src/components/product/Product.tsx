'use client';

import { useEffect } from "react";
import Image from "next/image";
import React from "react";
import ProductQuickView from "./ProductQuickView";
import { usePathname, useRouter } from '@/i18n/routing';
import useWindowWidth from "../helpers/getWindowWidth";
import useProduct from "@/store/useProduct";
import useGlobal from "@/store/useGlobal";

const ProductComponent = ({ product, isSearchProduct, imageH, imageW, isGridView, isOnDetailPage, isAdmin, handleEdit, handleDelete}: any) => {
    const[isModalOpen, setIsModalOpen] = React.useState(false);
    let width = useWindowWidth();
    const router = useRouter();
    const path = usePathname();
    const {lang} = useGlobal();

    //sorting out the sizes of the first dress
    if(!isSearchProduct &&  !isAdmin){
      product.colors[0].sizes = product.colors[0].sizes.filter((size: any) => size.stock > 0);
    }
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
      {isModalOpen  && <ProductQuickView onHideModal={hideModalHandler} product={product} isSearchProduct={isSearchProduct} isOnDetailPage={isOnDetailPage} locale={lang}/>}
      {
        isAdmin
        ?
        <>
          <article
            onMouseLeave={(e) => {
              if(!isModalOpen){
                const item = e.currentTarget;
                const imgElement = item.querySelector('#admin-img-container > img') as HTMLImageElement;
                imgElement.src = product.colors[0].image_front_base64[0];

                if(product.is_hidden){
                  const hiddenHint = document.querySelector('#is-hidden') as HTMLDivElement;
                  hiddenHint.classList.remove('expand');
                }

              }

            }}
            onMouseOver={(event) => {
              if (!isModalOpen) {
                const item = event.currentTarget;
                const hoverImage = item.getAttribute('data-hover');
                const imgElement = item.querySelector('#admin-img-container > img') as HTMLImageElement;
                imgElement.src = hoverImage!;

                if(product.is_hidden){
                  const hiddenHint = document.querySelector('#is-hidden') as HTMLDivElement;
                  hiddenHint.classList.add('expand');
                }
              }

            }}
            data-hover={product.colors[0].image_back_base64}

            className={`items-center flex flex-col gap-y-4 cursor-pointer pb-6 relative`}
          > 
          <div id='admin-img-container' className={`${width < 768 && !isSearchProduct ? 'w-[160px] h-[200px]' : width < 768 && width > 375 && isGridView && isSearchProduct ? 'w-[181px] h-[200px]' :  width <= 375 && isGridView && isSearchProduct ? 'w-[173px] h-[200px]' : width < 768 && !isGridView && isSearchProduct ? 'w-full h-[380px]' : width >= 768 && width < 1024 ? 'w-[270px]' : ``} group relative overflow-hidden`}>
            <Image
                src={product.colors[0].image_front_base64[0]}
                alt="dress-Image"
                width={imageW ?? 300}
                height={imageH ?? 450}
                className={`${width < 768 && !isSearchProduct ? 'w-[160px] h-[200px]' : width < 768 && width > 375 && isGridView && isSearchProduct ? 'w-[181px] h-[200px]' : width <= 375 && isGridView && isSearchProduct ? 'w-[173px] h-[200px]' : width < 768 && !isGridView && isSearchProduct ? 'w-full h-[380px]': width >= 768 && width < 1024 ? 'w-[270px]' : ``} object-cover transform transition-transform duration-500 group-hover:scale-125`}
                role="presentation"
            />
          </div>


          <section className={`items-center flex flex-row gap-x-5`}>
              <button onClick={handleEdit} className="text-accent hover:text-accent/60 bg-transparent border-none">Edit</button>
              <button onClick={handleDelete} className="text-white bg-accent px-2 py-1 rounded-md hover:text-accent hover:bg-white">Delete</button>
          </section>
          {product.colors[0].sizes[0].stock === 0 && <section 
            className={`${width > 768 && imageH && imageW ? 'bottom-[31%]' : width < 768 && !isGridView ? 'bottom-[20.5%]' : width < 768 && isGridView ? 'bottom-[33%]' : 'bottom-[26%]'} absolute font-sans bg-black px-4 py-1 rounded-3xl cursor-pointer text-white left-[4%] text-sm`}
          >
            Sold out
          </section>}
          </article>
          {product.is_hidden && <div 
          className={`${isSearchProduct && imageH && imageW ? 'left-[15%] top-[40%]' : 'left-[20%] top-[50%]'} z-10 opacity-0 rounded-md absolute flex h-6 px-2 py-4 w-[75px] flex-row items-center gap-x-1 font-serif  cursor-pointer text-red-400`} 
          id='is-hidden'
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
            <h4 className="text-[.8rem]">hidden</h4>
          </div>}
        </>
      : <>
      
          <article
            className={`${isSearchProduct ? 'items-start': 'items-center'} flex flex-col gap-y-4 cursor-pointer pb-6 relative`}
            data-hover={product.colors[0].image_back_base64}
            onMouseLeave={(e) => {
              if(!isModalOpen){
                const item = e.currentTarget;
                const imgElement = item.querySelector('#img-container > img') as HTMLImageElement;
                const zoomHint = item.parentNode!.querySelector('#zoom-hint') as HTMLDivElement;
                imgElement.src = product.colors[0].image_front_base64[0];

                zoomHint.classList.remove('expand');

              }

            }}
            onClick={() => {
              if(isOnDetailPage){
                const pathParts = path.split("/");
                const newPath = `/${pathParts[1]}/products/${product.title['en'].replace(' ', '-').toLowerCase()}/${product.colors[0].type['en'].replace(' ', '-')}/${product.colors[0].sizes[0].variant_id}`;

                const url = new URL(`${window.location.origin}${newPath}`);
                window.location.href = url.toString();
              }else{
                router.push(`/products/${product.title['en'].replace(' ', '-').toLowerCase()}/${product.colors[0].type['en'].replace(' ', '-')}/${product.colors[0].sizes[0].variant_id}`);
              }
              
              
            }}
            onMouseOver={(event) => {
              if (!isModalOpen) {
                const item = event.currentTarget;
                const hoverImage = item.getAttribute('data-hover');
                const imgElement = item.querySelector('#img-container > img') as HTMLImageElement;
                const zoomHint = item.parentNode!.querySelector('#zoom-hint') as HTMLDivElement;
                imgElement.src = hoverImage!;

                zoomHint.classList.add('expand');
              }

            }}
          > 
            <div id='img-container' className={`${width < 768 && !isSearchProduct ? 'w-[160px] h-[200px]' : width < 768 && width > 375 && isGridView && isSearchProduct ? 'w-[181px] h-[200px]' :  width <= 375 && isGridView && isSearchProduct ? 'w-[173px] h-[200px]' : width < 768 && !isGridView && isSearchProduct ? 'w-full h-[380px]' : width >= 768 && width < 1024 ? 'w-[270px]' : ``} group relative overflow-hidden`}>
              <Image
                  src={product.colors[0].image_front_base64[0]}
                  alt="dress-Image"
                  width={imageW ?? 300}
                  height={imageH ?? 450}
                  className={`${width < 768 && !isSearchProduct ? 'w-[160px] h-[200px]' : width < 768 && width > 375 && isGridView && isSearchProduct ? 'w-[181px] h-[200px]' : width <= 375 && isGridView && isSearchProduct ? 'w-[173px] h-[200px]' : width < 768 && !isGridView && isSearchProduct ? 'w-full h-[380px]': width >= 768 && width < 1024 ? 'w-[270px]' : ``} object-cover transform transition-transform duration-500 group-hover:scale-125`}
                  role="presentation"
              />
            </div>


            <section className={`${isSearchProduct  ? 'items-start': 'items-center'} flex flex-col gap-y-1`}>
              <h2 className="text-gray-500 font-sans text-sm">{product.title[lang]}</h2>
                <h2 className="text-[1rem]">
                    &#8358;{product.colors[0].sizes[0].price.toLocaleString("en-US")}
                </h2>
            </section>
            {product.colors[0].sizes[0].stock === 0 && <section 
              className={`${width > 768 && imageH && imageW ? 'bottom-[31%]' : width < 768 && !isGridView ? 'bottom-[20.5%]' : width < 768 && isGridView ? 'bottom-[33%]' : 'bottom-[26%]'} absolute font-sans bg-black px-4 py-1 rounded-3xl cursor-pointer text-white left-[4%] text-sm`}
            >
              Sold out
            </section>}
          </article>
          <div 
          onClick={(e) => {
              showModalHandler(e);
          }} 
          className={`${isSearchProduct && imageH && imageW ? 'left-[15%] top-[40%]' : 'left-[20%] top-[50%]'} z-10 opacity-0 rounded-md absolute flex h-6 px-2 py-4 w-[100px] flex-row items-center gap-x-1 font-serif  cursor-pointer text-blue-400`} 
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
          </div>
      </>
      }
    </div>

  );
};

export default ProductComponent;
