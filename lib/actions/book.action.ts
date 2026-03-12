'use server';
import { connectToDatabase } from '@/database/mongoose';
import { CreateBook, TextSegment } from '@/types';
import { escapeRegex, generateSlug, serializeData } from '../utils';
import Book from '@/database/models/book.model';
import BookSegment from '@/database/models/bookSegment.model';
import { getUserPlan } from '@/lib/subscription';
import { getPlanLimits } from '@/lib/subscription-constants';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

export const checkBookExists = async (title: string) => {
    try {
        await connectToDatabase();
        const slug = generateSlug(title);
        const existingBook = await Book.findOne({ slug }).lean();
        if (existingBook) {
            return {
                exists: true, book: serializeData(existingBook)
            };
        }
        return { exists: false };
    } catch (e) {
        console.error('Error checking book exist ', e);
        return {
            exists: false, error: e
        };
    }
};

export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();
        const slug = generateSlug(data.title);
        const existingBook = await Book.findOne({ slug }).lean();
        if (existingBook) {
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true,
            };
        }

        // enforce plan limits
        const plan = await getUserPlan();
        const limits = getPlanLimits(plan);
        if (limits.maxBooks !== null) {
            const owned = await Book.countDocuments({ clerkId: data.clerkId });
            if (owned >= limits.maxBooks) {
                return {
                    success: false,
                    error: `You may only upload ${limits.maxBooks} book${limits.maxBooks === 1 ? '' : 's'} on the ${plan} plan.`
                };
            }
        }

        const book = await Book.create({ ...data, slug, totalSegments: 0 });
        revalidatePath('/');
        return {
            success: true,
            data: serializeData(book)
        };
    } catch (e) {
        console.error('Error Creating Book', e);
        return {
            success: false,
            error: e
        };
    }
};

export const saveBookSegments = async (bookId: string, clerkId: string, segments: TextSegment[]) => {
    try {
        await connectToDatabase();
        console.log('Saving Book segments.....');
        const segmentsToInsert = segments.map(({ text, segmentIndex, pageNumber, wordCount }) => ({
            clerkId,
            bookId,
            content: text,
            segmentIndex,
            pageNumber,
            wordCount,
        }));
        await BookSegment.insertMany(segmentsToInsert);
        await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });
        console.log('Book Segment Saved Successfully.');
        return {
            success: true,
            data: { segmentsCreated: segments.length }
        };
    } catch (e) {
        console.error('Error saving Book Segments', e);
        await BookSegment.deleteMany({ bookId });
        await Book.findByIdAndDelete(bookId);
        console.log('Deleted Book segments and Book');
        return {
            success: false,
            error: e
        };
    }
};

export const getAllBooks = async () => {
    try {
        await connectToDatabase();
        const books = await Book.find().sort({ createdAt: -1 }).lean();
        return {
            success: true, data: serializeData(books)
        };
    } catch (e) {
        console.error('Error getting all books', e);
        return { success: false, error: e };
    }
};

export const getBookBySlug = async (slug: string) => {
    try {
        await connectToDatabase();
        const book = await Book.findOne({ slug }).lean();
        if (!book) return { success: false, error: "Book not found" };
        return { success: true, data: serializeData(book) };
    } catch (e) {
        console.error('Error getting book by slug', e);
        return { success: false, error: e };
    }
};

export const searchBookSegments = async (bookId: string, query: string, limit: number = 5) => {
    try {
        await connectToDatabase();

        console.log(`Searching for: "${query}" in book ${bookId}`);

        const bookObjectId = new mongoose.Types.ObjectId(bookId);

        // Try MongoDB text search first (requires text index)
        let segments: Record<string, unknown>[] = [];
        try {
            segments = await BookSegment.find({
                bookId: bookObjectId,
                $text: { $search: query },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ score: { $meta: 'textScore' } })
                .limit(limit)
                .lean();
        } catch {
            // Text index may not exist — fall through to regex fallback
            segments = [];
        }

        // Fallback: regex search matching ANY keyword
        if (segments.length === 0) {
            const keywords = query.split(/\s+/).filter((k) => k.length > 2);
            const pattern = keywords.map(escapeRegex).join('|');
            if (keywords.length === 0) {
                return {
                    success: true,
                    data: [],
                };
            }

            segments = await BookSegment.find({
                bookId: bookObjectId,
                content: { $regex: pattern, $options: 'i' },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ segmentIndex: 1 })
                .limit(limit)
                .lean();
        }

        console.log(`Search complete. Found ${segments.length} results`);

        return {
            success: true,
            data: serializeData(segments),
        };
    } catch (error) {
        console.error('Error searching segments:', error);
        return {
            success: false,
            error: (error as Error).message,
            data: [],
        };
    }
};