'use client';

import Link from "next/link";
import Product from "../product/Product";
import {FormattedMessage } from 'react-intl';
import useGlobal from "@/store/useGlobal";


const ViewCollection = ({featuredProducts}: any) => {

  return (
    <div className="flex flex-col gap-y-8 bg-white max-w-7xl w-full lg:py-12 py-8 mx-auto px-6 container">
      <section className="flex flex-col gap-y-6 items-center justify-center leading-text">
        <header className="text-center flex flex-col gap-y-6">
          <h1 className="lg:text-4xl text-3xl font-sans font-normal">
            <FormattedMessage id='app.collection.header' defaultMessage="Oyinye's Collection" />
          </h1>
          <p className="text-gray-600 lg:text-lg text-[1rem] font-normal font-sans">
            <FormattedMessage id='app.collection.paragraph' defaultMessage="Let Oyinye's occassion wear inspire you" />
          </p>
        </header>
        <Link href={`/collections/all`} className="lg:px-8 px-6 py-3 bg-black hover:ring-2 ring-black text-white font-sans lg:text-[1rem] text-[.8rem]">
            <FormattedMessage id='app.collection.action.text' defaultMessage="Shop Now" />
        </Link>
      </section>
      <section className="flex flex-col lg:items-start items-center gap-y-5 font-sans">
        <header className="lg:text-4xl text-3xl font-normal leading-text">
            <FormattedMessage id='app.collection.featured' defaultMessage="FeaturedProducts" />
        </header>
        <div className="flex flex-row items-center justify-evenly flex-wrap lg:gap-x-2 gap-x-1 gap-y-4 leading-text">
          {featuredProducts.filter((product: any) => product.is_feature === true).slice(0, 4).map((product: any, i: number) => <Product key={i} product={product}/>)}
        </div>
        <div className="leading-text flex flex-row w-full justify-center -mt-2">
          <Link href={`/collections/all-dresses`} className="lg:px-8 px-6 py-3 bg-black hover:ring-2 ring-black text-white font-sans lg:text-[1rem] text-[.8rem]">
            <FormattedMessage id='app.collection.featured.action.text' defaultMessage="View All" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ViewCollection;
