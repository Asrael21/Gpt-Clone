import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Sparkles,
  LogOut,
  User,
  Plus,
  Trash2,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './ChatHeader.module.css';

export default function ChatHeader({
  onNewChat,
  onClearHistory,
  toggleSidebar,
  sidebarOpen,
}) {
  const { user, isAuthenticated, openLogin, openSignup, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.menuBtn}
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <Menu size={20} />
        </button>

        <div className={styles.modelSelector}>
          <div className={styles.modelIcon}>
            <Sparkles size={16} />
          </div>
          <span className={styles.modelName}>ChatGPT</span>
          <span className={styles.modelVersion}>3.5</span>
          <ChevronDown size={14} className={styles.chevron} />
        </div>
      </div>

      <div className={styles.right}>
        {isAuthenticated ? (
          <div className={styles.userMenuContainer} ref={dropdownRef}>
            <button
              className={styles.userTrigger}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="User account menu"
            >
              <div className={styles.avatar}>{getInitials(user.username)}</div>
              <span className={styles.username}>{user.username}</span>
              <ChevronDown size={14} className={styles.userChevron} />
            </button>

            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownAvatar}>
                    {getInitials(user.username)}
                  </div>
                  <div className={styles.dropdownUser}>
                    <div className={styles.dropdownName}>{user.username}</div>
                    <div className={styles.dropdownEmail}>{user.email}</div>
                  </div>
                </div>

                <div className={styles.dropdownDivider} />

                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setDropdownOpen(false);
                    onNewChat?.();
                  }}
                >
                  <Plus size={16} />
                  <span>New Chat</span>
                </button>

                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setDropdownOpen(false);
                    onClearHistory?.();
                  }}
                >
                  <Trash2 size={16} />
                  <span>Clear History</span>
                </button>

                <div className={styles.dropdownDivider} />

                <button
                  className={`${styles.dropdownItem} ${styles.logoutItem}`}
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.authButtons}>
            <button className={styles.loginBtn} onClick={openLogin}>
              Log in
            </button>
            <button className={styles.signupBtn} onClick={openSignup}>
              Sign up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
