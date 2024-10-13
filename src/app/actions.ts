'use server'

import { getBrowser, getDeviceType } from '@/helpers/getHelpers';
import Visitor from '@/models/visitor';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';


export async function createViewedProductsAction(variantId: string) {
  const cookieStore = cookies();
  const viewedP = cookieStore.get('viewed_p')?.value;

  if(!viewedP){

    cookieStore.set({
      name: 'viewed_p',
      value: JSON.stringify([variantId]),
      expires: new Date(new Date().getTime() + 5184000000), // Expires in 2 month,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });
  }else{
    const viewedProductsArray = JSON.parse(viewedP);

     // Add the new product variant id to the beginning of the array
     if (!viewedProductsArray.includes(variantId)) {
      viewedProductsArray.unshift(variantId);
    }

    // Limit the number of stored product variant ids (e.g., to the 10 most recent)
    if (viewedProductsArray.length > 10) {
      viewedProductsArray.pop();
    }

    cookieStore.set({
      name: 'viewed_p',
      value: JSON.stringify(viewedProductsArray),
      expires: new Date(new Date().getTime() + 2629746000), // Expires in 1 month,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });
  }
  
}

export async function createVisitorAction() {
  const cookieStore = cookies();
  const visitId = cookieStore.get('visit')?.value;
  
  if (!visitId) {
    const headerStore = headers();
    const ip = headerStore.get('x-forwarded-for') || '0.0.0.0';
    const userAgent = headerStore.get('user-agent') || '';
    
    const device = getDeviceType(userAgent);

    const browser = getBrowser(userAgent);

    const newVisitor = await Visitor.create({
      id: (await crypto.randomBytes(6)).toString("hex"),
      ip,
      browser,
      device
    });

    const remainingMilliseconds = 5184000000; // 2 months
    const now = new Date();
    const expiryDate = new Date(now.getTime() + remainingMilliseconds);

    cookieStore.set({
      name: 'visit',
      value: newVisitor.id,
      expires: expiryDate,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }
}
