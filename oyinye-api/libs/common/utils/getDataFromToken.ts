import * as jwt from "jsonwebtoken";
import {Request} from 'express';



export const getDataFromToken = async (req: Request) => {
    try {
        const token = req.cookies['access_token'];

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