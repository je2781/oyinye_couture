import { connect } from '@/db/config';
import { getBrowser, getDeviceType } from '@/helpers/getHelpers';
import { getVisitData } from '@/helpers/getVisitData';
import User from '@/models/user';
import Visitor from '@/models/visitor';
import { NextResponse, type NextRequest } from 'next/server';

connect();

export async function GET(req: NextRequest) {
    try {
        let visitors = await Visitor.find();


        return NextResponse.json({
            message: 'visitors retrieved',
            visitors
            
        }, {
            status: 200
        });
        

    } catch (error: any) {
        console.error('Error retrieving visitors:', error);
        return NextResponse.json(
            {
                error: error.message,
            },
            { status: 500 }
        );
    }
}


