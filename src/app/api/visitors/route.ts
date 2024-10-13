import { getBrowser, getDeviceType } from '@/helpers/getHelpers';
import { getVisitData } from '@/helpers/getVisitData';
import User from '@/models/user';
import Visitor from '@/models/visitor';
import { NextResponse, type NextRequest } from 'next/server';


export async function GET(req: NextRequest) {
    try {
        let visitors = await Visitor.findAll();


        return NextResponse.json({
            message: 'visitors retrieved',
            visitors
            
        }, {
            status: 200
        });
        

    } catch (error: any) {
        return NextResponse.json(
            {
                error: error.message,
            },
            { status: 500 }
        );
    }
}


