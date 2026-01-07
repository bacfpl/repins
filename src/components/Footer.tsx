'use client';

import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Về chúng tôi</h3>
            <p className={styles.footerText}>
              Chuyên phân phối sản phẩm chất lượng cao với công nghệ hiện đại.
            </p>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Liên kết nhanh</h3>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/" className={styles.footerLink}>Trang chủ</Link>
              </li>
              <li>
                <Link href="/" className={styles.footerLink}>Sản phẩm</Link>
              </li>
              <li>
                <Link href="#" className={styles.footerLink}>Giới thiệu</Link>
              </li>
              <li>
                <Link href="#" className={styles.footerLink}>Liên hệ</Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Hỗ trợ</h3>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="#" className={styles.footerLink}>Câu hỏi thường gặp</Link>
              </li>
              <li>
                <Link href="#" className={styles.footerLink}>Chính sách bảo hành</Link>
              </li>
              <li>
                <Link href="#" className={styles.footerLink}>Hướng dẫn mua hàng</Link>
              </li>
              <li>
                <Link href="#" className={styles.footerLink}>Vận chuyển</Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Liên hệ</h3>
            <ul className={styles.footerContact}>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Email:</span>
                <a href="mailto:contact@shop.com" className={styles.footerLink}>contact@shop.com</a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Hotline:</span>
                <a href="tel:1900123456" className={styles.footerLink}>1900 123 456</a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Địa chỉ:</span>
                <span className={styles.contactValue}>123 Đường ABC, Quận XYZ, TP.HCM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerDivider}></div>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} SHOP. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}





