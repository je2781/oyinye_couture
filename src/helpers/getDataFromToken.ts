import * as jwt from "jsonwebtoken";
import { NextRequest } from "next/server";


export const getDataFromToken = async (req: NextRequest) => {
    try {
        const token = req.cookies.get('access_token')?.value;

        if(!token){
            throw new Error('Not Authenticated');
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

        if(!decodedToken){
            throw new Error('Not Authenticated');
        }

        return decodedToken.sub;
    } catch (error) {
        throw error;
    }
}