'use client';

import styles from './FloatingContact.module.css';
import Link from 'next/link';
import { useState } from 'react';

export default function FloatingContact() {
  const phoneNumber = '0359789536';
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.floatingContainer}>
      {isExpanded && (
        <>
          <Link 
            href={`https://zalo.me/${phoneNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.floatingButton} ${styles.zaloButton}`}
            title="Nhắn tin Zalo"
          >
            <span className={styles.icon}>💬</span>
          </Link>
          <Link 
            href={`tel:${phoneNumber}`}
            className={`${styles.floatingButton} ${styles.phoneButton}`}
            title={`Gọi ${phoneNumber}`}
          >
            <span className={styles.icon}>📞</span>
          </Link>
        </>
      )}
      <button
        className={`${styles.floatingButton} ${styles.mainButton}`}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Liên hệ"
      >
        <span className={styles.icon}>⚙️</span>
      </button>
      {isExpanded && <div className={styles.floatingBadge}>Chọn cách liên hệ</div>}
    </div>
  );
}
