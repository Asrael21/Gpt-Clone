import { useState, useRef, useEffect } from 'react';
import { Plus, ArrowUp, Sparkles, Globe } from 'lucide-react';
import styles from './ChatInput.module.css';

export default function ChatInput({ handleSendMessage, isLoading }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    handleSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputRow}>
          <button
            type="button"
            className={styles.attachBtn}
            title="Attach file or context"
            aria-label="Attach file"
          >
            <Plus size={19} />
          </button>

          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder="Message ChatGPT..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
          />

          <button
            type="submit"
            className={`${styles.submitBtn} ${input.trim() ? styles.submitBtnActive : ''}`}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            {isLoading ? (
              <span className={styles.submitSpinner} />
            ) : (
              <ArrowUp size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.pillGroup}>
            <button type="button" className={styles.pill}>
              <Sparkles size={13} className={styles.pillIcon} />
              <span>Smart Reasoning</span>
            </button>
            <button type="button" className={styles.pill}>
              <Globe size={13} className={styles.pillIcon} />
              <span>Web Search</span>
            </button>
          </div>
          <span className={styles.disclaimer}>
            ChatGPT can make mistakes. Verify important info.
          </span>
        </div>
      </form>
    </div>
  );
}
