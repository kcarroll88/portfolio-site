'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SUGGESTED_QUESTIONS } from '@/lib/keenan-context';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [greeting, setGreeting] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Typing effect for greeting
  useEffect(() => {
    const fullGreeting = "Hi — I'm Keenan's AI. Ask me anything about his work, projects, or background.";
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullGreeting.length) {
        setGreeting(fullGreeting.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 22);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!messages.length && !streamingText) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, streamingText]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    setShowSuggestions(false);

    const userMsg: Message = { role: 'user', content };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamingText(full);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: full }]);
      setStreamingText('');
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isTypingGreeting = greeting.length < 80;

  return (
    <div
      className="glass rounded-xl overflow-hidden flex flex-col glow-gold w-full lg:w-auto"
      style={{ height: '420px', maxWidth: '480px' }}
    >
      {/* Terminal header */}
      <div
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--glass-border)' }}
      >
        <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#28CA41' }} />
        <span
          className="ml-3 text-xs tracking-wider"
          style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--cream-dim)' }}
        >
          keenan.ai
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Greeting */}
        <div className="flex gap-3">
          <div
            className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
            style={{
              background: 'rgba(201, 150, 58, 0.2)',
              border: '1px solid var(--glass-border)',
              color: 'var(--gold)',
              fontFamily: 'var(--font-jetbrains-mono)',
            }}
          >
            K
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--cream-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            {greeting}
            {isTypingGreeting && (
              <span className="animate-blink" style={{ color: 'var(--gold)' }}>
                █
              </span>
            )}
          </p>
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {showSuggestions && !isTypingGreeting && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex flex-wrap gap-2 pl-9"
            >
              {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-2.5 py-1.5 rounded transition-all duration-200"
                  style={{
                    background: 'rgba(201, 150, 58, 0.08)',
                    border: '1px solid rgba(201, 150, 58, 0.2)',
                    color: 'var(--cream-muted)',
                    fontFamily: 'var(--font-jetbrains-mono)',
                    fontSize: '0.65rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(201, 150, 58, 0.15)';
                    e.currentTarget.style.color = 'var(--cream)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(201, 150, 58, 0.08)';
                    e.currentTarget.style.color = 'var(--cream-muted)';
                  }}
                >
                  {q}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message history */}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            {msg.role === 'user' ? (
              <>
                <div className="flex-1" />
                <p
                  className="text-sm leading-relaxed px-3 py-2 rounded-lg max-w-[85%]"
                  style={{
                    background: 'rgba(201, 150, 58, 0.1)',
                    border: '1px solid rgba(201, 150, 58, 0.2)',
                    color: 'var(--cream)',
                    fontFamily: 'var(--font-jetbrains-mono)',
                    fontSize: '0.75rem',
                  }}
                >
                  {msg.content}
                </p>
              </>
            ) : (
              <>
                <div
                  className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{
                    background: 'rgba(201, 150, 58, 0.2)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--gold)',
                    fontFamily: 'var(--font-jetbrains-mono)',
                  }}
                >
                  K
                </div>
                <div
                  className="text-sm leading-relaxed flex-1 prose-chat"
                  style={{ color: 'var(--cream-muted)', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '0.75rem' }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              </>
            )}
          </motion.div>
        ))}

        {/* Streaming response */}
        {streamingText && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div
              className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
              style={{
                background: 'rgba(201, 150, 58, 0.2)',
                border: '1px solid var(--glass-border)',
                color: 'var(--gold)',
                fontFamily: 'var(--font-jetbrains-mono)',
              }}
            >
              K
            </div>
            <div
              className="text-sm leading-relaxed flex-1 prose-chat"
              style={{ color: 'var(--cream-muted)', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '0.75rem' }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingText}</ReactMarkdown>
              <span className="animate-blink" style={{ color: 'var(--gold)' }}>█</span>
            </div>
          </motion.div>
        )}

        {/* Loading dots */}
        {isLoading && !streamingText && (
          <div className="flex gap-3">
            <div
              className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold"
              style={{
                background: 'rgba(201, 150, 58, 0.2)',
                border: '1px solid var(--glass-border)',
                color: 'var(--gold)',
                fontFamily: 'var(--font-jetbrains-mono)',
              }}
            >
              K
            </div>
            <div className="flex gap-1.5 items-center">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--gold)' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--glass-border)' }}
      >
        <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '0.75rem' }}>
          &gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask anything..."
          disabled={isLoading}
          className="flex-1 bg-transparent text-sm outline-none placeholder-opacity-40"
          style={{
            color: 'var(--cream)',
            fontFamily: 'var(--font-jetbrains-mono)',
            fontSize: '0.75rem',
            opacity: isLoading ? 0.5 : 1,
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="flex-shrink-0 transition-all duration-200"
          style={{
            color: input.trim() && !isLoading ? 'var(--gold)' : 'var(--cream-dim)',
          }}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
