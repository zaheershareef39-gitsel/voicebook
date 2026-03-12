import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MicOff, Mic } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';

import { getBookBySlug } from '@/lib/actions/book.action';
import VapiControls from '@/components/VapiControls';

export default async function BookDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { userId } = await auth();
    if (!userId) {
        redirect('/');
    }

    const { slug } = await params;
    const bookResponse = await getBookBySlug(slug);

    if (!bookResponse.success || !bookResponse.data) {
        redirect('/');
    }

    const book = bookResponse.data;

    return (
        <div className="book-page-container relative">
            <Link href="/" className="back-btn-floating">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>



            <VapiControls book={book} />
        </div>
    );
}
