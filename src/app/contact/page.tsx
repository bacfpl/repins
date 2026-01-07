'use client';

import { useState } from 'react';
import styles from './contact.module.css';
import { useState as useStateHook } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitMessage('✅ Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm.');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitMessage(''), 5000);
    } catch (error) {
      setSubmitMessage('❌ Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contactPage}>
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Liên Hệ Với Chúng Tôi</h1>
          <p className={styles.subtitle}>Chúng tôi luôn sẵn sàng giúp đỡ và trả lời các câu hỏi của bạn</p>
        </div>

        <div className={styles.container}>
          {/* Contact Info */}
          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <div className={styles.iconBox}>📞</div>
              <h3 className={styles.infoTitle}>Gọi Chúng Tôi</h3>
              <p className={styles.infoText}>0359789536</p>
              <a href="tel:0359789536" className={styles.infoLink}>
                Gọi ngay
              </a>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.iconBox}>💬</div>
              <h3 className={styles.infoTitle}>Chat Zalo</h3>
              <p className={styles.infoText}>Nhắn tin trực tiếp</p>
              <a href="https://zalo.me/0359789536" target="_blank" rel="noopener noreferrer" className={styles.infoLink}>
                Nhắn tin
              </a>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.iconBox}>📧</div>
              <h3 className={styles.infoTitle}>Email</h3>
              <p className={styles.infoText}>xuanbacliliana@gmail.com</p>
              <a href="mailto:xuanbacliliana@gmail.com" className={styles.infoLink}>
                Gửi email
              </a>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.iconBox}>📍</div>
              <h3 className={styles.infoTitle}>Địa Chỉ</h3>
              <p className={styles.infoText}>Triều Khúc,Thanh Xuân,Việt Nam</p>
              <p className={styles.infoText} style={{ fontSize: '12px', marginTop: '5px', opacity: 0.8 }}>
                Mở từ 8:00 - 22:00
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.formSection}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Tên của bạn
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Nhập tên của bạn"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Nhập email của bạn"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Nhập số điện thoại (không bắt buộc)"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>
                  Tin nhắn
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className={styles.textarea}
                  placeholder="Nhập nội dung tin nhắn của bạn..."
                  rows={5}
                />
              </div>

              {submitMessage && <div className={styles.message}>{submitMessage}</div>}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ''}`}
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi Tin Nhắn'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
