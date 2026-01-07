'use client';

import styles from "./page.module.css";
import Banner from "@/components/Banner";
import CategoryCard from "@/components/CategoryCard";

export default function HomePage() {
  // Danh mục cố định
  const categories = [
    { _id: '1', name: 'Sạc' },
    { _id: '2', name: 'Tai nghe' },
    { _id: '3', name: 'Cường lực' },
  ];

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Banner />
        
        <div className={styles.headerSection}>
          <h1 className={styles.categoryTitle}>Danh Mục Sản Phẩm</h1>
          <p className={styles.categorySubtitle}>Khám phá các sản phẩm của chúng tôi</p>
        </div>

        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <CategoryCard 
              key={category._id}
              name={category.name}
              href="/products"
            />
          ))}
          <CategoryCard 
            name="Xem Thêm"
            href="/products"
            isViewMore={true}
          />
        </div>
      </main>
    </div>
  );
}

