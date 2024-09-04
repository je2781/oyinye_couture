'use server'

import { connect } from '@/db/config';
import { getBrowser, getDeviceType } from '@/helpers/getHelpers';
import Visitor from '@/models/visitor';
import { cookies, headers } from 'next/headers';

connect();


export async function createVisitorAction() {
  const cookieStore = cookies();
  const visitId = cookieStore.get('visit')?.value;
  
  if (!visitId) {
    const headerStore = headers();
    const ip = headerStore.get('x-forwarded-for') || '0.0.0.0';
    const userAgent = headerStore.get('user-agent') || '';
    
    const device = getDeviceType(userAgent);

    const browser = getBrowser(userAgent);

    const newVisitor = new Visitor({
      ip,
      browser,
      device
    });

    await newVisitor.save();

    const remainingMilliseconds = 5184000000; // 2 months
    const now = new Date();
    const expiryDate = new Date(now.getTime() + remainingMilliseconds);

    cookieStore.set({
      name: 'visit',
      value: newVisitor._id.toString(),
      expires: expiryDate,
      httpOnly: true,
      path: '/',
    });
  }
}
