
import { models } from '@/db/connection';
import { NextResponse, type NextRequest } from 'next/server';



export async function GET(req: NextRequest) {
    try {
        let visitors = await models.Visitor.findAll();


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


