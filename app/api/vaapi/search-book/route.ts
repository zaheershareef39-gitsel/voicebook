import { NextRequest, NextResponse } from 'next/server';
import { searchBookSegments } from '@/lib/actions/book.action';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Received Vapi tool call:', JSON.stringify(body, null, 2));

        const { message } = body;
        if (!message || message.type !== 'tool-calls' || !message.toolCalls) {
            return NextResponse.json({ error: 'Invalid Vapi tool call message' }, { status: 400 });
        }

        const results = await Promise.all(
            message.toolCalls.map(async (toolCall: any) => {
                const { id, function: fn } = toolCall;

                if (fn.name === 'SearchBook') {
                    const { bookId, query } = fn.arguments;
                    console.log(`Processing SearchBook tool call: bookId=${bookId}, query=${query}`);

                    const result = await searchBookSegments(bookId, query);

                    return {
                        toolCallId: id,
                        result: result,
                    };
                }

                return {
                    toolCallId: id,
                    error: `Unknown tool call: ${fn.name}`,
                };
            })
        );

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error('Error handling Vapi tool call:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
