import { v2 } from '@google-cloud/translate';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { text, locale } = await req.json();

        if (!text || !locale) {
            return NextResponse.json({ error: "Text and locale are required." }, { status: 400 });
        }

        const translate = new v2.Translate();
        let translation;

        try {
            [translation] = await translate.translate(text, locale);
        } catch (translationError: any) {
            return NextResponse.json({ error: translationError.message }, { status: 500 });
        }

        return NextResponse.json({ translation }, { status: 200 });
       
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
