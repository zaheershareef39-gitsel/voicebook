'use client';

import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadCloud, ImageIcon, X, CheckCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'sonner';

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { UploadSchema } from '@/lib/zod';
import { voiceOptions, voiceCategories, DEFAULT_VOICE } from '@/lib/constants';
import type { BookUploadFormValues } from '@/types';
import { useAuth } from '@clerk/nextjs';
import { checkBookExists, createBook, saveBookSegments } from '@/lib/actions/book.action';
import { useRouter } from 'next/navigation';
import { parsedPDFFile } from '@/lib/utils';
import { upload } from '@vercel/blob/client';


// ─────────────────────────────────────────────
// Loading Overlay
// ─────────────────────────────────────────────
function LoadingOverlay() {
    return (
        <div className="loading-wrapper">
            <div className="loading-shadow-wrapper bg-white shadow-soft-lg">
                <div className="loading-shadow">
                    <Loader2 className="loading-animation w-12 h-12 text-[#663820]" />
                    <h2 className="loading-title">Processing Your Book</h2>
                    <div className="loading-progress">
                        <div className="loading-progress-item">
                            <span className="loading-progress-status" />
                            <span className="text-[var(--text-secondary)]">Uploading PDF…</span>
                        </div>
                        <div className="loading-progress-item">
                            <span className="loading-progress-status" />
                            <span className="text-[var(--text-secondary)]">Generating cover…</span>
                        </div>
                        <div className="loading-progress-item">
                            <span className="loading-progress-status" />
                            <span className="text-[var(--text-secondary)]">Preparing synthesis…</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// File Dropzone
// ─────────────────────────────────────────────
interface DropzoneProps {
    id?: string;
    accept: string;
    icon: React.ReactNode;
    text: string;
    hint: string;
    file: File | null;
    onChange: (file: File | null) => void;
    disabled?: boolean;
    error?: string;
}

function FileDropzone({ id, accept, icon, text, hint, file, onChange, disabled, error }: DropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragging(false);
            if (disabled) return;
            const dropped = e.dataTransfer.files[0];
            if (dropped) onChange(dropped);
        },
        [disabled, onChange]
    );

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
    };

    const handleDragLeave = () => setDragging(false);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) inputRef.current?.click();
        }
    };

    return (
        <div>
            <input
                ref={inputRef}
                id={id}
                type="file"
                accept={accept}
                className="hidden"
                disabled={disabled}
                onChange={(e) => {
                    const picked = e.target.files?.[0] ?? null;
                    onChange(picked);
                    e.target.value = '';
                }}
            />

            {file ? (
                /* ── File selected state ── */
                <div
                    className={clsx(
                        'upload-dropzone upload-dropzone-uploaded',
                        'border-2 border-dashed border-[#8B7355] rounded-lg'
                    )}
                    onClick={() => !disabled && inputRef.current?.click()}
                    onKeyDown={handleKeyDown}
                    role="button"
                    tabIndex={0}
                >
                    <div className="file-upload-shadow w-full">
                        <CheckCircle className="w-10 h-10 mb-2 text-[#663820]" />
                        <p className="upload-dropzone-text">{file.name}</p>
                        <p className="upload-dropzone-hint">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                        <button
                            type="button"
                            className="upload-dropzone-remove mt-3"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                            }}
                            aria-label="Remove file"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                /* ── Empty / drag state ── */
                <div
                    className={clsx(
                        'upload-dropzone border-2 border-dashed rounded-lg transition-all',
                        dragging
                            ? 'border-[#663820] bg-[#fff6e5]'
                            : 'border-[var(--border-medium)]',
                        error && 'border-red-400 bg-red-50',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={() => !disabled && inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onKeyDown={handleKeyDown}
                    role="button"
                    tabIndex={0}
                >
                    <div className="file-upload-shadow">
                        <span className="upload-dropzone-icon">{icon}</span>
                        <p className="upload-dropzone-text">{text}</p>
                        <p className="upload-dropzone-hint">{hint}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// Voice Radio Card
// ─────────────────────────────────────────────
interface VoiceCardProps {
    voiceKey: string;
    selected: boolean;
    onSelect: () => void;
    disabled?: boolean;
}

function VoiceCard({ voiceKey, selected, onSelect, disabled }: VoiceCardProps) {
    const voice = voiceOptions[voiceKey as keyof typeof voiceOptions];
    if (!voice) return null;

    return (
        <label
            className={clsx(
                'voice-selector-option cursor-pointer',
                selected ? 'voice-selector-option-selected' : 'voice-selector-option-default',
                disabled && 'voice-selector-option-disabled'
            )}
        >
            <input
                type="radio"
                name="voice"
                value={voiceKey}
                checked={selected}
                disabled={disabled}
                onChange={onSelect}
                className="mt-0.5 accent-[#663820] shrink-0"
            />
            <div className="flex flex-col min-w-0">
                <span className="font-semibold text-[var(--text-primary)] text-base leading-5">
                    {voice.name}
                </span>
                <span className="text-[var(--text-secondary)] text-xs mt-0.5 leading-4">
                    {voice.description}
                </span>
            </div>
        </label>
    );
}

// ─────────────────────────────────────────────
// Main Form
// ─────────────────────────────────────────────
const UploadForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { userId } = useAuth()
    const router = useRouter()

    const form = useForm<BookUploadFormValues>({
        resolver: zodResolver(UploadSchema),
        defaultValues: {
            pdfFile: undefined,
            coverImage: undefined,
            title: '',
            author: '',
            persona: '',
        },
    });

    const onSubmit = async (data: BookUploadFormValues) => {
        if (!userId) {
            return toast.error('Please Login to upload books');
        }
        setIsSubmitting(true);
        try {
            // Step 1: Check if a book with the same title already exists
            const existsCheck = await checkBookExists(data.title);
            if (existsCheck?.exists && existsCheck?.book) {
                toast.info('Book with same title already exists');
                form.reset();
                router.push(`/books/${existsCheck.book.slug}`);
                return;
            }
            const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase();
            const pdfFile = data.pdfFile;
            const parsePDF = await parsedPDFFile(pdfFile);
            if (parsePDF.content.length == 0) {
                toast.error("Failed to parse Pdf . Please try again with a different file.");
                return;
            }
            const uploadPdfBlob = await upload(fileTitle, pdfFile, {
                access: 'public',
                handleUploadUrl: '/api/upload',
                contentType: 'application/pdf'
            });
            let coverUrl: string;
            if (data.coverImage) {
                const coverFile = data.coverImage;
                const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, coverFile, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                    contentType: coverFile.type
                });
                coverUrl = uploadedCoverBlob.url;
            } else {
                const response = await fetch(parsePDF.cover)
                const blob = await response.blob();
                const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                    contentType: 'image/png'
                });
                coverUrl = uploadedCoverBlob.url;
            }
            const book = await createBook({
                clerkId: userId,
                title: data.title,
                author: data.author,
                persona: data.persona,
                fileURL: uploadPdfBlob.url,
                fileBlobKey: uploadPdfBlob.pathname,
                coverURL: coverUrl,
                fileSize: pdfFile.size,
            });
            if (!book.success) {
                // display any message returned by the server
                toast.error(book.error as string || 'Failed to create book.');
                if (book.isBillingError) {
                    // guide user to upgrade plan
                    router.push('/subscriptions');
                }
                return;
            }
            if (book.alreadyExists) {
                toast.info('Book with same title already exists');
                form.reset();
                router.push(`/books/${book.data?.slug}`);
                return;
            }

            const segments = await saveBookSegments(book.data._id, userId, parsePDF.content);
            if (!segments.success) {
                toast.error("Failed to save book segments");
                throw new Error("Failed to save Book segments");
            }
            form.reset();
            router.push('/');

            console.log('Form submitted:', data);
            // TODO: wire up server action / API call
            await new Promise((r) => setTimeout(r, 2000));
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload book. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div style={{ display: isSubmitting ? undefined : 'none' }}><LoadingOverlay /></div>

            <div className="new-book-wrapper">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                        noValidate
                    >
                        {/* ── 1. PDF Upload ── */}
                        <FormField
                            control={form.control}
                            name="pdfFile"
                            render={({ field, fieldState }) => (
                                <FormItem id={field.name}>
                                    <FormLabel className="form-label">Book PDF File</FormLabel>
                                    <FileDropzone
                                        accept="application/pdf"
                                        icon={<UploadCloud className="upload-dropzone-icon" />}
                                        text="Click to upload PDF"
                                        hint="PDF file (max 50MB)"
                                        file={(field.value as File) ?? null}
                                        onChange={(f) => field.onChange(f ?? undefined)}
                                        disabled={isSubmitting}
                                        error={fieldState.error?.message}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ── 2. Cover Image Upload ── */}
                        <FormField
                            control={form.control}
                            name="coverImage"
                            render={({ field, fieldState }) => (
                                <FormItem id={field.name}>
                                    <FormLabel className="form-label">Cover Image (Optional)</FormLabel>
                                    <FileDropzone
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        icon={<ImageIcon className="upload-dropzone-icon" />}
                                        text="Click to upload cover image"
                                        hint="Leave empty to auto-generate from PDF"
                                        file={(field.value as File | null) ?? null}
                                        onChange={(f) => field.onChange(f)}
                                        disabled={isSubmitting}
                                        error={fieldState.error?.message}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ── 3. Title ── */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field, fieldState }) => (
                                <FormItem id={field.name}>
                                    <FormLabel className="form-label">Title</FormLabel>
                                    <input
                                        {...field}
                                        type="text"
                                        className={clsx(
                                            'form-input w-full border border-[var(--border-subtle)] rounded-lg',
                                            'focus:outline-none focus:ring-2 focus:ring-[#663820] focus:border-[#663820]',
                                            fieldState.error && 'border-red-400'
                                        )}
                                        placeholder="ex: Rich Dad Poor Dad"
                                        disabled={isSubmitting}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ── 4. Author ── */}
                        <FormField
                            control={form.control}
                            name="author"
                            render={({ field, fieldState }) => (
                                <FormItem id={field.name}>
                                    <FormLabel className="form-label">Author Name</FormLabel>
                                    <input
                                        {...field}
                                        type="text"
                                        className={clsx(
                                            'form-input w-full border border-[var(--border-subtle)] rounded-lg',
                                            'focus:outline-none focus:ring-2 focus:ring-[#663820] focus:border-[#663820]',
                                            fieldState.error && 'border-red-400'
                                        )}
                                        placeholder="ex: Robert Kiyosaki"
                                        disabled={isSubmitting}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ── 5. Voice Selector ── */}
                        <FormField
                            control={form.control}
                            name="persona"
                            render={({ field, fieldState }) => (
                                <FormItem id={field.name}>
                                    <FormLabel className="form-label">Choose Assistant Voice</FormLabel>

                                    <div className="space-y-4">
                                        {/* Male Voices */}
                                        <div>
                                            <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                                                Male Voices
                                            </p>
                                            <div className="voice-selector-options flex-wrap">
                                                {voiceCategories.male.map((key) => (
                                                    <VoiceCard
                                                        key={key}
                                                        voiceKey={key}
                                                        selected={field.value === key}
                                                        onSelect={() => field.onChange(key)}
                                                        disabled={isSubmitting}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Female Voices */}
                                        <div>
                                            <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                                                Female Voices
                                            </p>
                                            <div className="voice-selector-options flex-wrap">
                                                {voiceCategories.female.map((key) => (
                                                    <VoiceCard
                                                        key={key}
                                                        voiceKey={key}
                                                        selected={field.value === key}
                                                        onSelect={() => field.onChange(key)}
                                                        disabled={isSubmitting}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {fieldState.error && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </FormItem>
                            )}
                        />

                        {/* ── 6. Submit ── */}
                        <button
                            type="submit"
                            className="form-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing…' : 'Begin Synthesis'}
                        </button>
                    </form>
                </Form>
            </div>
        </>
    );
};

export default UploadForm;