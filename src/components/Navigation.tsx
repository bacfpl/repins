'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', label: 'Trang chủ' },
    { href: '/products', label: 'Sản phẩm' },
    { href: '/contact', label: 'Liên hệ' },
  ];

  return (
    <nav className={`${styles.nav} ${isScrolled ? styles.navScrolled : styles.navTop}`}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>REPINS</span>
        </Link>

        <button
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className={styles.hamburger}>
            <span className={isMobileMenuOpen ? styles.hamburgerOpen : ''}></span>
            <span className={isMobileMenuOpen ? styles.hamburgerOpen : ''}></span>
            <span className={isMobileMenuOpen ? styles.hamburgerOpen : ''}></span>
          </div>
        </button>

        <ul className={`${styles.navList} ${isMobileMenuOpen ? styles.navListOpen : ''}`}>
          {navItems.map((item, index) => (
            <li key={`${item.href}-${index}`} className={styles.navItem}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

