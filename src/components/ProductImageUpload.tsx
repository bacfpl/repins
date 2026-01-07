'use client';

import { useState, useRef } from 'react';
import styles from './ProductImageUpload.module.css';

interface ProductImage {
  _id: string;
  isPrimary: boolean;
  imageUrl: string;
  altText: string;
  displayOrder: number;
}

interface ProductImageUploadProps {
  productId: string;
  onUploadComplete?: (images: ProductImage[]) => void;
  onError?: (error: string) => void;
}

export default function ProductImageUpload({
  productId,
  onUploadComplete,
  onError,
}: ProductImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Xử lý chọn file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    setFiles(selectedFiles);

    // Tạo preview
    const previews: string[] = [];
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        previews.push(event.target?.result as string);
        if (previews.length === selectedFiles.length) {
          setPreviewImages(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Xóa file khỏi danh sách
  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviewImages(newPreviews);

    if (primaryImageIndex === index && newFiles.length > 0) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    }
  };

  // Upload ảnh
  const handleUpload = async () => {
    if (files.length === 0) {
      onError?.('Vui lòng chọn ít nhất một ảnh');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });

      // Thêm thông tin ảnh chính
      files.forEach((_, index) => {
        formData.append('isPrimary', index === primaryImageIndex ? 'true' : 'false');
      });

      const response = await fetch(`/api/admin/products/${productId}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Lỗi upload ảnh');
      }

      const data = await response.json();
      
      // Reset form
      setFiles([]);
      setPreviewImages([]);
      setPrimaryImageIndex(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onUploadComplete?.(data.data);
      alert('Đã upload ảnh thành công!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi upload ảnh';
      onError?.(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3>Upload Ảnh Sản Phẩm</h3>

      {/* Input file */}
      <div className={styles.inputSection}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isLoading}
          className={styles.fileInput}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className={styles.selectButton}
        >
          Chọn Ảnh
        </button>
      </div>

      {/* Preview ảnh */}
      {previewImages.length > 0 && (
        <div className={styles.previewSection}>
          <h4>Xem Trước ({previewImages.length} ảnh)</h4>
          <div className={styles.previewGrid}>
            {previewImages.map((preview, index) => (
              <div key={index} className={styles.previewItem}>
                <div className={styles.imageWrapper}>
                  <img src={preview} alt={`Preview ${index}`} />
                  {index === primaryImageIndex && (
                    <div className={styles.primaryBadge}>Ảnh Chính</div>
                  )}
                </div>
                <div className={styles.controls}>
                  <button
                    onClick={() => setPrimaryImageIndex(index)}
                    className={`${styles.button} ${
                      index === primaryImageIndex ? styles.active : ''
                    }`}
                    disabled={isLoading}
                  >
                    Đặt Làm Ảnh Chính
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    className={`${styles.button} ${styles.delete}`}
                    disabled={isLoading}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nút upload */}
      <div className={styles.actionSection}>
        <button
          onClick={handleUpload}
          disabled={isLoading || files.length === 0}
          className={styles.uploadButton}
        >
          {isLoading ? 'Đang Upload...' : `Upload ${files.length} Ảnh`}
        </button>
      </div>
    </div>
  );
}
