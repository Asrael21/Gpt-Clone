import { Bot, Sparkles, Brain, Code, Compass, PenTool } from 'lucide-react';
import ChatMessage from '../ChatMessage/ChatMessage';
import styles from './MessageList.module.css';

const SUGGESTIONS = [
  {
    icon: Brain,
    title: 'Explain concepts',
    prompt: 'Explain quantum computing in simple terms with everyday analogies.',
  },
  {
    icon: Code,
    title: 'Code & Debug',
    prompt: 'Show me how to build a RESTful API in Node.js with Express and MySQL.',
  },
  {
    icon: Compass,
    title: 'Plan & Explore',
    prompt: 'Plan an exciting 3-day travel itinerary for visiting Tokyo on a budget.',
  },
  {
    icon: PenTool,
    title: 'Draft & Write',
    prompt: 'Write a polite, professional follow-up email regarding a project update.',
  },
];

export default function MessageList({
  conversations,
  isLoading,
  messagesEndRef,
  onSelectPrompt,
}) {
  return (
    <div className={styles.messages}>
      {conversations.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyHeader}>
            <div className={styles.sparkleIcon}>
              <Sparkles size={28} />
            </div>
            <h1 className={styles.emptyTitle}>What can I help with today?</h1>
            <p className={styles.emptySubtitle}>
              Ask anything, explore new ideas, write code, or draft documents with AI.
            </p>
          </div>

          <div className={styles.suggestionsGrid}>
            {SUGGESTIONS.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={idx}
                  className={styles.suggestionCard}
                  onClick={() => onSelectPrompt?.(item.prompt)}
                >
                  <div className={styles.cardIconWrapper}>
                    <IconComponent size={18} />
                  </div>
                  <div className={styles.cardContent}>
                    <span className={styles.cardTitle}>{item.title}</span>
                    <span className={styles.cardPrompt}>{item.prompt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={styles.messagesList}>
          {conversations.map((msg) => (
            <ChatMessage
              key={msg.id || `${msg.role}-${msg.content.slice(0, 20)}`}
              role={msg.role}
              content={msg.content}
            />
          ))}
        </div>
      )}

      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingAvatar}>
            <Bot size={18} color="white" />
          </div>
          <div className={styles.loadingBubble}>
            <div className={styles.loadingDot} />
            <div className={styles.loadingDot} />
            <div className={styles.loadingDot} />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
