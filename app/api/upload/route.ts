import { MAX_FILE_SIZE } from "@/lib/constants";
import { auth, getAuth } from "@clerk/nextjs/server";
import { handleUpload, HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { maximum } from "zod/v4-mini";


export async function POST(request: Request): Promise<NextResponse> {

    try {
        const body = (await request.json()) as HandleUploadBody;
        const jsonResponse = await handleUpload({
            token: process.env.BLOB_READ_WRITE_TOKEN,
            body, request, onBeforeGenerateToken: async () => {
                const { userId } = await auth();

                if (!userId) {
                    throw new Error('Unauthorized : user not authenticted')
                }
                return {
                    allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
                    addRandomSuffix: true,
                    maximumSizeInBytes: MAX_FILE_SIZE,
                    tokenPayload: JSON.stringify({ userId })
                }

            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log('File uploaded to blob:', blob.url)
                const payload = tokenPayload ? JSON.parse(tokenPayload) : null
                const userID = payload?.userId;
            }
        });
        return NextResponse.json(jsonResponse)

    } catch (e) {
        const message = e instanceof Error ? e.message : "A unknow error occured";
        const status = message.includes('Unauthorized') ? 401 : 500;
        console.error('Upload Error', e);
        const clientMessage = status == 401 ? "Unauthorized" : "Upload Failed";
        return NextResponse.json({ error: clientMessage }, { status });
    }
}
