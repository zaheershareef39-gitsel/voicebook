import { z } from 'zod';
import {
    MAX_FILE_SIZE,
    MAX_IMAGE_SIZE,
    ACCEPTED_PDF_TYPES,
    ACCEPTED_IMAGE_TYPES,
} from '@/lib/constants';

export const UploadSchema = z.object({
    pdfFile: z
        .custom<File>((val) => val instanceof File, { message: 'PDF file is required' })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: 'PDF must be 50MB or smaller',
        })
        .refine((file) => ACCEPTED_PDF_TYPES.includes(file.type), {
            message: 'Only PDF files are accepted',
        }),

    coverImage: z
        .custom<File | null>((val) => val === null || val instanceof File, {
            message: 'Invalid file',
        })
        .nullable()
        .optional()
        .refine(
            (file) => !file || file.size <= MAX_IMAGE_SIZE,
            { message: 'Cover image must be 10MB or smaller' }
        )
        .refine(
            (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
            { message: 'Only JPEG, PNG, or WebP images are accepted' }
        ),

    title: z
        .string()
        .min(1, { message: 'Title is required' })
        .max(200, { message: 'Title must be 200 characters or fewer' }),

    author: z
        .string()
        .min(1, { message: 'Author name is required' })
        .max(200, { message: 'Author name must be 200 characters or fewer' }),

    persona: z.string().min(1, { message: 'Please select a voice' }),
});
