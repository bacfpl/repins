import { v2 as cloudinary } from 'cloudinary';

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export interface ProductImageUploadResult extends UploadResult {
  isPrimary?: boolean;
  displayOrder?: number;
}

/**
 * Upload ảnh lên Cloudinary với đường dẫn products/{productId}
 * @param file - File ảnh (Buffer hoặc base64 string)
 * @param productId - ID sản phẩm từ MongoDB (_id)
 * @param options - Tùy chọn upload
 * @returns Promise<UploadResult>
 */
export async function uploadProductImage(
  file: Buffer | string,
  productId: string,
  options?: {
    folder?: string;
    transformation?: any;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
  }
): Promise<UploadResult> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary chưa được cấu hình. Vui lòng thêm CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET vào .env.local');
    }

    // Tạo đường dẫn: products/{productId}
    const folder = options?.folder || `products/${productId}`;

    // Upload options
    const uploadOptions: any = {
      folder: folder,
      resource_type: options?.resource_type || 'image',
      overwrite: true, // Ghi đè nếu đã tồn tại
      invalidate: true, // Xóa cache
    };

    // Thêm transformation nếu có
    if (options?.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    let uploadResult;

    if (Buffer.isBuffer(file)) {
      // Upload từ Buffer
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error: any, result: any) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file);
      });
    } else {
      // Upload từ base64 string hoặc URL
      uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
    }

    return {
      public_id: (uploadResult as any).public_id,
      secure_url: (uploadResult as any).secure_url,
      url: (uploadResult as any).url,
      format: (uploadResult as any).format,
      width: (uploadResult as any).width,
      height: (uploadResult as any).height,
      bytes: (uploadResult as any).bytes,
    };
  } catch (error) {
    console.error('❌ Lỗi khi upload ảnh lên Cloudinary:', error);
    throw error;
  }
}

/**
 * Upload nhiều ảnh cho sản phẩm với phân biệt ảnh chính/phụ
 * @param files - Mảng các file ảnh
 * @param productId - ID sản phẩm
 * @param primaryImageIndex - Index của ảnh chính (mặc định 0)
 * @returns Promise<ProductImageUploadResult[]>
 */
export async function uploadMultipleProductImages(
  files: (Buffer | string)[],
  productId: string,
  primaryImageIndex: number = 0
): Promise<ProductImageUploadResult[]> {
  try {
    const uploadPromises = files.map((file, index) => {
      return uploadProductImage(file, productId, {
        folder: `products/${productId}`,
      }).then(result => ({
        ...result,
        isPrimary: index === primaryImageIndex,
        displayOrder: index,
      }));
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('❌ Lỗi khi upload nhiều ảnh:', error);
    throw error;
  }
}

/**
 * Upload ảnh phụ cho sản phẩm (secondary image)
 * @param file - File ảnh
 * @param productId - ID sản phẩm
 * @returns Promise<ProductImageUploadResult>
 */
export async function uploadSecondaryProductImage(
  file: Buffer | string,
  productId: string
): Promise<ProductImageUploadResult> {
  try {
    const result = await uploadProductImage(file, productId, {
      folder: `products/${productId}`,
    });
    return {
      ...result,
      isPrimary: false,
    };
  } catch (error) {
    console.error('❌ Lỗi khi upload ảnh phụ:', error);
    throw error;
  }
}

/**
 * Xóa ảnh từ Cloudinary
 * @param publicId - Public ID của ảnh trên Cloudinary
 * @returns Promise<any>
 */
export async function deleteImage(publicId: string): Promise<any> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
    return result;
  } catch (error) {
    console.error('❌ Lỗi khi xóa ảnh từ Cloudinary:', error);
    throw error;
  }
}

/**
 * Xóa ảnh từ URL Cloudinary
 * @param imageUrl - URL đầy đủ của ảnh trên Cloudinary
 * @returns Promise<any>
 */
export async function deleteImageFromCloudinary(imageUrl: string): Promise<any> {
  try {
    // Extract public ID from URL
    // URL format: https://res.cloudinary.com/xxxxx/image/upload/v1234567890/products/productId/filename.ext
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1]; // filename.ext
    const productId = urlParts[urlParts.length - 2]; // productId
    const publicId = `products/${productId}/${filename.split('.')[0]}`; // products/productId/filename
    
    console.log(`🗑️ Xóa ảnh từ Cloudinary: ${publicId}`);
    const result = await deleteImage(publicId);
    console.log(`✅ Đã xóa ảnh: ${publicId}`, result);
    return result;
  } catch (error) {
    console.error('❌ Lỗi khi xóa ảnh từ URL:', error);
    throw error;
  }
}

/**
 * Xóa tất cả ảnh trong folder products/{productId}
 * @param productId - ID sản phẩm
 * @returns Promise<any>
 */
export async function deleteProductImages(productId: string): Promise<any> {
  try {
    const folder = `products/${productId}`;
    const result = await cloudinary.api.delete_resources_by_prefix(folder, {
      resource_type: 'image',
      invalidate: true,
    });
    return result;
  } catch (error) {
    console.error('❌ Lỗi khi xóa ảnh sản phẩm:', error);
    throw error;
  }
}

/**
 * Lấy URL ảnh từ Cloudinary với transformation
 * @param publicId - Public ID hoặc đường dẫn đầy đủ
 * @param transformation - Transformation options
 * @returns string - URL ảnh
 */
export function getImageUrl(
  publicId: string,
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
    format?: string;
  }
): string {
  if (!transformation) {
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [
        {
          format: 'auto',
          quality: 'auto',
        },
      ],
    });
  }

  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width: transformation.width,
        height: transformation.height,
        crop: transformation.crop || 'limit',
        quality: transformation.quality || 'auto',
        format: transformation.format || 'auto',
      },
    ],
  });
}

/**
 * Thêm tham số optimization vào URL ảnh Cloudinary
 * @param imageUrl - URL ảnh từ Cloudinary
 * @param options - Tùy chọn optimization (width, height, etc.)
 * @returns string - URL ảnh với tham số tối ưu hóa
 */
export function addAutoOptimization(
  imageUrl: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
): string {
  if (!imageUrl) return imageUrl;
  
  // Kiểm tra xem URL đã có /upload/ chưa
  if (imageUrl.includes('/upload/')) {
    // Nếu đã có transformation, trả về nguyên URL
    if (imageUrl.includes('f_auto') || imageUrl.includes('q_auto')) {
      return imageUrl;
    }
    
    // Xây dựng transformation string
    const transformations: string[] = [];
    
    // Auto format và quality
    transformations.push('f_auto');
    transformations.push(`q_${options?.quality || 'auto'}`);
    
    // Device pixel ratio auto
    transformations.push('dpr_auto');
    
    // Width và height nếu có
    if (options?.width) {
      transformations.push(`w_${options.width}`);
    }
    if (options?.height) {
      transformations.push(`h_${options.height}`);
    }
    
    // Crop setting cho consistency
    if (options?.width || options?.height) {
      transformations.push('c_fill');
    }
    
    // Thêm transformation ngay sau /upload/
    return imageUrl.replace(
      '/upload/',
      `/upload/${transformations.join(',')}/`
    );
  }
  
  return imageUrl;
}
/**
 * Tạo blur placeholder từ Cloudinary
 * @param imageUrl - URL ảnh từ Cloudinary
 * @returns string - Data URL của blur placeholder
 */
export function getBlurPlaceholder(imageUrl: string): string {
  if (!imageUrl || !imageUrl.includes('cloudinary')) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPjwvc3ZnPg==';
  }
  
  // Thêm blur transformation
  return addAutoOptimization(imageUrl, {
    width: 20,
    height: 20,
    quality: 50,
  });
}
export default cloudinary;


