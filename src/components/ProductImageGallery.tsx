'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { addAutoOptimization, getBlurPlaceholder } from '@/Service/CloudinaryService';
import styles from './ProductImageGallery.module.css';

interface ProductImage {
  _id: string;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

interface ProductImageGalleryProps {
  productId: string;
  images: ProductImage[];
  onImageClick?: (image: ProductImage) => void;
  isAdmin?: boolean;
  onSetPrimary?: (imageId: string) => void;
  onDeleteImage?: (imageId: string) => void;
}

export default function ProductImageGallery({
  productId,
  images,
  onImageClick,
  isAdmin = false,
  onSetPrimary,
  onDeleteImage,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Tìm ảnh chính
  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const primaryIndex = images.findIndex((img) => img._id === primaryImage._id);

  if (!primaryImage) {
    return <div className={styles.noImages}>Không có ảnh</div>;
  }

  const handleSetPrimary = async (imageId: string) => {
    if (!isAdmin || !onSetPrimary) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/products/images/${imageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPrimary: true }),
      });

      if (!response.ok) {
        throw new Error('Lỗi đặt ảnh chính');
      }

      onSetPrimary(imageId);
      setSelectedIndex(images.findIndex((img) => img._id === imageId));
    } catch (error) {
      console.error('❌ Lỗi:', error);
      alert('Lỗi đặt ảnh chính');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!isAdmin || !onDeleteImage) return;

    if (!confirm('Bạn chắc chắn muốn xóa ảnh này?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/products/images/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Lỗi xóa ảnh');
      }

      onDeleteImage(imageId);

      // Cập nhật selectedIndex nếu cần
      if (selectedIndex >= images.length - 1 && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      }
    } catch (error) {
      console.error('❌ Lỗi:', error);
      alert('Lỗi xóa ảnh');
    } finally {
      setIsLoading(false);
    }
  };

  const currentImage = images[selectedIndex];

  return (
    <div className={styles.gallery}>
      {/* Main Image */}
      <div className={styles.mainImageContainer}>
        <div className={styles.mainImage}>
          <Image
            src={addAutoOptimization(currentImage.imageUrl, {
              width: 600,
              height: 600,
              quality: 85,
            })}
            alt={currentImage.altText || 'Sản phẩm'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            priority={selectedIndex === primaryIndex}
            loading={selectedIndex === primaryIndex ? 'eager' : 'lazy'}
            placeholder="blur"
            blurDataURL={getBlurPlaceholder(currentImage.imageUrl)}
          />
          {currentImage.isPrimary && (
            <div className={styles.primaryBadge}>Ảnh Chính</div>
          )}
        </div>

        {isAdmin && (
          <div className={styles.mainControls}>
            {!currentImage.isPrimary && (
              <button
                onClick={() => handleSetPrimary(currentImage._id)}
                disabled={isLoading}
                className={styles.controlButton}
                title="Đặt làm ảnh chính"
              >
                ⭐ Ảnh Chính
              </button>
            )}
            <button
              onClick={() => handleDeleteImage(currentImage._id)}
              disabled={isLoading}
              className={`${styles.controlButton} ${styles.delete}`}
              title="Xóa ảnh"
            >
              🗑️ Xóa
            </button>
          </div>
        )}
      </div>

      {/* Thumbnail List */}
      {images.length > 1 && (
        <div className={styles.thumbnailContainer}>
          <div className={styles.thumbnails}>
            {images.map((image, index) => (
              <div
                key={image._id}
                className={`${styles.thumbnail} ${
                  index === selectedIndex ? styles.active : ''
                }`}
                onClick={() => setSelectedIndex(index)}
              >
                <Image
                  src={addAutoOptimization(image.imageUrl, {
                    width: 100,
                    height: 100,
                    quality: 75,
                  })}
                  alt={image.altText || `Ảnh ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 60px, 80px"
                  style={{ objectFit: 'cover' }}
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={getBlurPlaceholder(image.imageUrl)}
                />
                {image.isPrimary && (
                  <div className={styles.thumbnailBadge}>⭐</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Info */}
      <div className={styles.imageInfo}>
        <p>
          Ảnh {selectedIndex + 1}/{images.length}
          {currentImage.altText && ` - ${currentImage.altText}`}
        </p>
      </div>
    </div>
  );
}
