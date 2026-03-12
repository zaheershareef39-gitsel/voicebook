import { ReactNode } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { LucideIcon } from 'lucide-react';
import z from 'zod';
import { UploadSchema } from '@/lib/zod';

// ============================================
// DATABASE MODELS (Plain Objects)
// ============================================

export interface IBook {
    _id: string;
    clerkId: string;
    title: string;
    slug: string;
    author: string;
    persona?: string;
    fileURL: string;
    fileBlobKey: string;
    coverURL: string;
    coverBlobKey?: string;
    fileSize: number;
    totalSegments: number;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface IBookSegment {
    _id: string;
    clerkId: string;
    bookId: string;
    content: string;
    segmentIndex: number;
    pageNumber?: number;
    wordCount: number;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface IVoiceSession {
    _id: string;
    clerkId: string;
    bookId: string;
    startedAt: string | Date;
    endedAt?: string | Date;
    durationSeconds: number;
    billingPeriodStart: string | Date;
    createdAt: string | Date;
    updatedAt: string | Date;
}

// ============================================
// FORM & INPUT TYPES
// ============================================

export type BookUploadFormValues = z.infer<typeof UploadSchema>;

export interface CreateBook {
    clerkId: string;
    title: string;
    author: string;
    persona?: string;
    fileURL: string;
    fileBlobKey: string;
    coverURL?: string;
    coverBlobKey?: string;
    fileSize: number;
}
// server action return shapes ------------------------------------------------
export interface CreateBookResult {
    success: boolean;
    data?: IBook;             // present when book is created or already exists
    alreadyExists?: boolean;  // caller can show notification if true
    error?: string;           // human-readable message on failure
    isBillingError?: boolean; // true when failure due to plan limits
}

export interface StartSessionResult {
    success: boolean;
    sessionId?: string;
    error?: string;
    maxDurationMinutes?: number | null;
    isBillingError?: boolean;
}
export interface TextSegment {
    text: string;
    segmentIndex: number;
    pageNumber?: number;
    wordCount: number;
}

export interface BookCardProps {
    title: string;
    author: string;
    coverURL: string;
    slug: string;
}

export interface Messages {
    role: string;
    content: string;
}

export interface ShadowBoxProps {
    children: ReactNode;
    className?: string;
}

export interface VoiceSelectorProps {
    disabled?: boolean;
    className?: string;
    value?: string;
    onChange: (voiceId: string) => void;
}

export interface InputFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    placeholder?: string;
    disabled?: boolean;
}

export interface FileUploadFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    acceptTypes: string[];
    disabled?: boolean;
    icon: LucideIcon;
    placeholder: string;
    hint: string;
}

export interface StartSessionResult {
    success: boolean;
    sessionId?: string;
    // maximum number of minutes the user is allowed to record based on their plan
    maxDurationMinutes?: number;
    error?: string;
}

// subscription related types
export type Plan = 'free' | 'standard' | 'pro';

export interface PlanLimits {
    maxBooks: number;
    /**
     * maximum sessions allowed per billing period (null == unlimited)
     */
    maxSessionsPerMonth: number | null;
    /**
     * cap on a single session's duration in minutes
     */
    maxSessionMinutes: number;
    /**
     * whether the plan permits viewing past session history
     */
    hasSessionHistory: boolean;
}