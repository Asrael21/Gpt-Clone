import { useState } from 'react';
import {
  MessageSquare,
  Search,
  Image as ImageIcon,
  LayoutGrid,
  Microscope,
  Code2,
  FolderKanban,
  PanelLeftClose,
  LogOut,
  LogIn,
  History,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

export default function Sidebar({
  isOpen,
  onClose,
  onNewChat,
  onClearHistory,
  recentQuestions = [],
  onSelectPrompt,
}) {
  const { user, isAuthenticated, openLogin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'IT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const filteredQuestions = searchQuery.trim()
    ? recentQuestions.filter((q) =>
        q.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recentQuestions;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropActive : ''}`}
        onClick={onClose}
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        {/* Top header with sidebar toggle and new chat shortcut */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <button
              className={styles.iconBtn}
              onClick={onClose}
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <PanelLeftClose size={20} />
            </button>
          </div>
          <button
            className={styles.iconBtn}
            onClick={onNewChat}
            title="New chat"
            aria-label="New chat"
          >
            <MessageSquare size={20} />
          </button>
        </div>

        {/* Primary navigation items */}
        <nav className={styles.nav}>
          <button className={styles.item} onClick={onNewChat}>
            <MessageSquare size={18} />
            <span>New chat</span>
          </button>

          <button
            className={styles.item}
            onClick={() => setIsSearching(!isSearching)}
          >
            <Search size={18} />
            <span>Search chats</span>
          </button>

          {isSearching && (
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  className={styles.searchClearBtn}
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          <a href="#" className={styles.item} onClick={(e) => e.preventDefault()}>
            <ImageIcon size={18} />
            <span>Images</span>
          </a>

          <a href="#" className={styles.item} onClick={(e) => e.preventDefault()}>
            <LayoutGrid size={18} />
            <span>Apps</span>
          </a>

          <a href="#" className={styles.item} onClick={(e) => e.preventDefault()}>
            <Microscope size={18} />
            <span>Deep research</span>
          </a>

          <a href="#" className={styles.item} onClick={(e) => e.preventDefault()}>
            <Code2 size={18} />
            <span>Codex</span>
          </a>

          <a href="#" className={styles.item} onClick={(e) => e.preventDefault()}>
            <FolderKanban size={18} />
            <span>Projects</span>
          </a>

          {/* Recent chats section */}
          {recentQuestions.length > 0 && (
            <div className={styles.historySection}>
              <div className={styles.historyTitle}>
                <History size={13} />
                <span>Recent Chats</span>
              </div>

              <div className={styles.historyList}>
                {filteredQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    className={styles.historyItem}
                    onClick={() => onSelectPrompt?.(q)}
                    title={q}
                  >
                    <MessageSquare size={14} className={styles.historyIcon} />
                    <span className={styles.historyText}>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Bottom footer with user profile or login trigger */}
        <div className={styles.footer}>
          {recentQuestions.length > 0 && (
            <button className={styles.clearBtn} onClick={onClearHistory}>
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          )}

          {isAuthenticated ? (
            <div className={styles.user}>
              <div className={styles.avatar}>{getInitials(user.username)}</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.username}</span>
                <span className={styles.userPlan}>Standard Account</span>
              </div>
              <button
                className={styles.logoutBtn}
                onClick={logout}
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className={styles.loginCard}>
              <div className={styles.loginCardText}>
                <strong>Save your history</strong>
                <p>Sign in to keep your chats across devices.</p>
              </div>
              <button className={styles.loginCardBtn} onClick={openLogin}>
                <LogIn size={14} />
                <span>Log In</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
