import React, { useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

interface Message {
  role: 'assistant' | 'user' | string;
  content: string;
}

interface TranscriptProps {
  messages: Message[];
  currentMessage: string;
  currentUserMessage: string;
}

const Transcript = ({ messages, currentMessage, currentUserMessage }: TranscriptProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentMessage, currentUserMessage]);

  const hasMessages = messages.length > 0 || currentMessage.length > 0 || currentUserMessage.length > 0;

  return (
    <div className="transcript-container shadow-sm border border-gray-100">
      {!hasMessages ? (
        <div className="transcript-empty">
          <Mic className="w-12 h-12 text-[#212a3b] mb-4" />
          <h3 className="transcript-empty-text">No conversation yet</h3>
          <p className="transcript-empty-hint">Click the mic button above to start talking</p>
        </div>
      ) : (
        <div className="transcript-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`transcript-message ${
                msg.role === 'user' ? 'transcript-message-user' : 'transcript-message-assistant'
              }`}
            >
              <div
                className={`transcript-bubble ${
                  msg.role === 'user' ? 'transcript-bubble-user' : 'transcript-bubble-assistant'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {currentUserMessage && (
            <div className="transcript-message transcript-message-user">
              <div className="transcript-bubble transcript-bubble-user">
                {currentUserMessage}
                <span className="transcript-cursor"></span>
              </div>
            </div>
          )}

          {currentMessage && (
            <div className="transcript-message transcript-message-assistant">
              <div className="transcript-bubble transcript-bubble-assistant">
                {currentMessage}
                <span className="transcript-cursor"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default Transcript;
