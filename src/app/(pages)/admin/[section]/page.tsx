'use client';

import AdminHeader from "@/components/admin/AdminHeader";
import Body from "@/components/admin/Body";
import React from "react";


export default function Dashboard({
    params,
  }: {
    params: { section: string};
  }){

    const [isModalOpen, setIsModalOpen] = React.useState(false);


    let pathName = params.section;
    let sectionName = '';

    if (pathName.includes("-")) {
        let firstWord =
          pathName.split("-")[0].charAt(0).toUpperCase() +
          pathName.split("-")[0].slice(1);
        let secondWord =
          pathName.split("-")[1].charAt(0).toUpperCase() +
          pathName.split("-")[1].slice(1);
    
        sectionName = [firstWord, secondWord].join(" ");
      } else {
        sectionName = pathName.charAt(0).toUpperCase() + pathName.slice(1);
      }

      const headerProps = {
        sectionName,
        pathName,
        setIsModalOpen,
        isModalOpen
      };

      const bodyProps = {
        pathName,
        setIsModalOpen,
        isModalOpen
      }
    return (
        <>
            <AdminHeader {...headerProps}/>
            <Body {...bodyProps}/>
        </>
    );
}