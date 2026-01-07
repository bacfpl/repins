'use client';

import { useParams } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  stock: number;
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSecondaryImage, setSelectedSecondaryImage] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();
        
        if (data.success) {
          setProduct(data.data);
        } else {
          setError(data.error || 'Không thể tải sản phẩm');
        }
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra');
        console.error('Lỗi khi fetch sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.notFound}>
            <h1>Đang tải...</h1>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.notFound}>
            <h1>❌ {error || 'Sản phẩm không tồn tại'}</h1>
            <Link href="/" className={styles.backButton}>Quay lại danh sách</Link>
          </div>
        </main>
      </div>
    );
  }

  const images = [product.image];
  if (product.images && product.images.length > 0) {
    // Thêm các ảnh phụ (trừ ảnh chính)
    product.images.forEach((img) => {
      if (img !== product.image) {
        images.push(img);
      }
    });
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Link href="/" className={styles.backLink}>← Quay lại</Link>
        
        <div className={styles.productDetail}>
          <div className={styles.imageSection}>
            <div className={styles.mainImageContainer}>
              <img src={selectedSecondaryImage || product.image} alt={product.name} className={styles.detailImage} />
            </div>
            
            {product.images && product.images.length > 0 && (
              <div className={styles.secondaryImagesSection}>
                <div className={styles.secondaryImagesGrid}>
                  {/* Ảnh chính */}
                  <div 
                    className={`${styles.secondaryImageContainer} ${!selectedSecondaryImage ? styles.secondaryImageActive : ''}`}
                    onClick={() => setSelectedSecondaryImage(null)}
                  >
                    <img src={product.image} alt={`${product.name} - Ảnh chính`} className={styles.secondaryImage} />
                  </div>
                  
                  {/* Ảnh phụ */}
                  {product.images.map((img, index) => (
                    img !== product.image && (
                      <div 
                        key={index} 
                        className={`${styles.secondaryImageContainer} ${selectedSecondaryImage === img ? styles.secondaryImageActive : ''}`}
                        onClick={() => setSelectedSecondaryImage(img)}
                      >
                        <img src={img} alt={`${product.name} - Ảnh phụ ${index + 1}`} className={styles.secondaryImage} />
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.infoSection}>
            <h1 className={styles.detailTitle}>{product.name}</h1>
            
            <div className={styles.priceSection}>
              <p className={styles.detailPrice}>{product.price}</p>
              <div className={styles.tags}>
                {product.vat && (
                  <span className={styles.vatTag}>{product.vat}</span>
                )}
                {product.ship && (
                  <span className={styles.shipTag}>{product.ship}</span>
                )}
              </div>
            </div>

            {product.description && (
              <div className={styles.descriptionSection}>
                <h2 className={styles.sectionTitle}>Mô tả</h2>
                <p className={styles.descriptionText}>{product.description}</p>
              </div>
            )}

            {product.specifications && product.specifications.length > 0 && (
              <div className={styles.specificationsSection}>
                <h2 className={styles.sectionTitle}>Thông số kỹ thuật</h2>
                <div className={styles.specsList}>
                  {product.specifications.map((spec, index) => (
                    <div key={index} className={styles.specItem}>
                      <span className={styles.specLabel}>{spec.label}:</span>
                      <span className={styles.specValue}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className={styles.buyButton}>Liên hệ</button>
          </div>
        </div>
      </main>
    </div>
  );
}

