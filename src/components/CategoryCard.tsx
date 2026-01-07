'use client';

import Link from 'next/link';
import styles from './CategoryCard.module.css';

// Map category names to local image paths from /public/assets/img
const categoryImages: { [key: string]: string } = {
  'Tai nghe': '/assets/img/aripod.jpg',
  'Sạc': '/assets/img/charger.jpg',
  'Cường lực': '/assets/img/glass.jpg',
};

// Map category names to gradient colors (fallback)
const categoryGradients: { [key: string]: string } = {
  'Tai nghe': 'linear-gradient(135deg, #047cf7 0%, #00ffe8 100%)',
  'Sạc': 'linear-gradient(135deg, #21ff7d 0%, #047cf7 100%)',
  'Cường lực': 'linear-gradient(135deg, #ff6b6b 0%, #ff9500 100%)',
};

// Map category names to icons/emojis (fallback)
const categoryIcons: { [key: string]: string } = {
  'Tai nghe': '🎧',
  'Sạc': '🔌',
  'Cường lực': '💪',
  'Xem Thêm': '🛍️',
};

interface CategoryCardProps {
  name: string;
  image?: string;
  href?: string;
  isViewMore?: boolean;
}

export default function CategoryCard({ 
  name, 
  image, 
  href = '/products',
  isViewMore = false 
}: CategoryCardProps) {
  const icon = categoryIcons[name] || '📦';
  const categoryImage = image || categoryImages[name];
  const gradient = categoryGradients[name] || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';

  const content = (
    <div className={`${styles.card} ${isViewMore ? styles.viewMoreCard : ''}`}>
      {!isViewMore && (
        <div className={styles.cardImageContainer} style={categoryImage ? {} : { background: gradient }}>
          {categoryImage ? (
            <img src={categoryImage} alt={name} className={styles.cardImageImg} />
          ) : (
            <div className={styles.cardIcon}>{icon}</div>
          )}
        </div>
      )}
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{name}</h3>
        {isViewMore && <span className={styles.viewMoreArrow}>→</span>}
      </div>
    </div>
  );

  if (isViewMore) {
    return <Link href={href} className={styles.cardLink}>{content}</Link>;
  }

  return (
    <Link href={`${href}?category=${encodeURIComponent(name)}`} className={styles.cardLink}>
      {content}
    </Link>
  );
}
