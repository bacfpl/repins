'use client';

import styles from './Banner.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ParticleStyle {
  left: string;
  top: string;
  width: string;
  height: string;
  animationDelay: string;
}

export default function Banner() {
  const [particles, setParticles] = useState<ParticleStyle[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const particleStyles = Array.from({ length: 25 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${Math.random() * 6 + 1}px`,
      height: `${Math.random() * 6 + 1}px`,
      animationDelay: `${i * 0.2}s`,
    }));
    setParticles(particleStyles);
  }, []);

  return (
    <div className={styles.bannerContainer}>
      {/* Animated background particles */}
      <div className={styles.particlesContainer}>
        {isClient && particles.map((style, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: style.left,
              top: style.top,
              width: style.width,
              height: style.height,
              animationDelay: style.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Glowing orbs */}
      <div className={styles.orbContainer}>
        <div className={styles.orb + ' ' + styles.orb1} />
        <div className={styles.orb + ' ' + styles.orb2} />
        <div className={styles.orb + ' ' + styles.orb3} />
      </div>

      {/* Grid background */}
      <div className={styles.gridBackground} />

      {/* Main content */}
      <div className={styles.bannerContent}>
        <div className={styles.topLine} />
        
        <div className={styles.bannerText}>
          <h1 className={styles.bannerTitle}>
            <span className={styles.titleWord}>Khám</span>
            <span className={styles.titleWord}>Phá</span>
            <span className={styles.titleWord}>Tương</span>
            <span className={styles.titleWord}>Lai</span>
          </h1>
          <p className={styles.bannerSubtitle}>Công nghệ hàng đầu · Chất lượng tuyệt vời · Trải nghiệm vô tận</p>
        </div>
        
        <div className={styles.bannerButtons}>
          <Link href="/products" className={styles.primaryButton}>
            <span className={styles.buttonText}>Mua Ngay</span>
            <span className={styles.buttonGlow} />
          </Link>
          <Link href="/products" className={styles.secondaryButton}>
            <span>Khám Phá Thêm</span>
            <span className={styles.arrow}>→</span>
          </Link>
        </div>

        <div className={styles.bottomLine} />
      </div>
      
      {/* Floating tech elements */}
      <div className={styles.techElement + ' ' + styles.tech1}>
        <div className={styles.techBg} />
      </div>
      <div className={styles.techElement + ' ' + styles.tech2}>
        <div className={styles.techBg} />
      </div>
      <div className={styles.techElement + ' ' + styles.tech3}>
        <div className={styles.techBg} />
      </div>
      <div className={styles.techElement + ' ' + styles.tech4}>
        <div className={styles.techBg} />
      </div>
      <div className={styles.techElement + ' ' + styles.tech5}>
        <div className={styles.techBg} />
      </div>
    </div>
  );
}
