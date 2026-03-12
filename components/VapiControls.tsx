'use client'
import useVapi from '@/hooks/useVapi'
import { IBook } from '@/types'
import { Mic, MicOff } from 'lucide-react'
import Transcript from './Transcript'
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';


const VapiControls = ({ book }: { book: IBook }) => {
    const { status, isActive, messages, currentMessage, currentUserMessage, duration,
        start, stop, limitError, clearError } = useVapi(book)
    
    const prevErrorRef = useRef<string | null>(null);

    // Show error toast only when a NEW error appears (not on every render)
    useEffect(() => {
        if (limitError && limitError !== prevErrorRef.current) {
            toast.error(limitError);
            prevErrorRef.current = limitError;
        } else if (!limitError) {
            prevErrorRef.current = null;
        }
    }, [limitError]);
    return (
        <>
            <div className="vapi-main-container">
                <div className="vapi-header-card w-full mb-6">
                    <div className="vapi-cover-wrapper">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={book.coverURL} alt={book.title} className="vapi-cover-image" />
                        <div className="vapi-mic-wrapper flex items-center justify-center">
                            {isActive && (status === 'speaking' || status === 'thinking') && (
                                <div className="absolute inset-0 bg-white/50 rounded-full animate-ping" />
                            )}
                            <button onClick={isActive ? stop : start} disabled={status == 'connecting'} aria-label={isActive ? "Stop Voice Assistant" : "Start voice assistant"} title={isActive ? "Stop Voice Assistant" : "Start voice assistant"} className="vapi-mic-btn shadow-md relative z-10">
                                {isActive ? (
                                    <Mic className="w-6 h-6 text-gray-700" />
                                ) : (
                                    <MicOff className="w-6 h-6 text-gray-700" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center">
                        <h1 className="book-title-lg">{book.title}</h1>
                        <p className="subtitle mb-4">by {book.author}</p>

                        <div className="flex flex-wrap gap-3">
                            <div className="vapi-status-indicator">
                                <span className="vapi-status-dot vapi-status-dot-ready"></span>
                                <span className="vapi-status-text">Ready</span>
                            </div>
                            <div className="vapi-status-indicator">
                                <span className="vapi-status-text">Voice: {book.persona || 'Default'}</span>
                            </div>
                            <div className="vapi-status-indicator">
                                <span className="vapi-status-text">0:00/15:00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="vapi-transcript-wrapper w-full">
                    <Transcript
                        messages={messages}
                        currentMessage={currentMessage}
                        currentUserMessage={currentUserMessage}
                    />
                </div>
            </div>
        </>
    )
}

export default VapiControls