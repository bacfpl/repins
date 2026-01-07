import { getCollection } from '@/DataBase/mongodb.connection';
import { COLLECTIONS, ProductImage } from '@/DataBase/mongodb.schema';
import { ObjectId } from 'mongodb';
import { 
  uploadProductImage, 
  uploadMultipleProductImages,
  uploadSecondaryProductImage,
  deleteImage, 
  getImageUrl 
} from './CloudinaryService';

// =============================================
// UPLOAD IMAGES
// =============================================

/**
 * Upload ảnh chính cho sản phẩm
 * @param file - File ảnh
 * @param productId - ID sản phẩm
 * @param altText - Văn bản thay thế
 * @returns Promise<ProductImage>
 */
export async function uploadPrimaryProductImage(
  file: Buffer | string,
  productId: string,
  altText?: string
): Promise<ProductImage> {
  try {
    // Đầu tiên, set tất cả ảnh hiện tại thành không chính
    const imagesCollection = await getCollection<ProductImage>(COLLECTIONS.PRODUCT_IMAGES);
    await imagesCollection.updateMany(
      { productId },
      { $set: { isPrimary: false } }
    );

    // Upload ảnh mới
    const uploadResult = await uploadProductImage(file, productId);

    // Lấy displayOrder cao nhất
    const lastImage = await imagesCollection.findOne(
      { productId },
      { sort: { displayOrder: -1 } }
    );
    const displayOrder = (lastImage?.displayOrder ?? -1) + 1;

    // Lưu vào database
    const newImage: Omit<ProductImage, '_id'> = {
      productId,
      cloudinaryPublicId: uploadResult.public_id,
      imageUrl: uploadResult.secure_url,
      altText: altText || '',
      displayOrder,
      isPrimary: true,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes,
      format: uploadResult.format,
      uploadedAt: new Date(),
      createdAt: new Date(),
    };

    const result = await imagesCollection.insertOne(newImage as any);
    const image = await imagesCollection.findOne({ _id: result.insertedId });

    if (!image) {
      throw new Error('Không thể lưu ảnh chính vào database');
    }

    console.log('✅ Đã upload ảnh chính thành công:', uploadResult.public_id);
    return image;
  } catch (error) {
    console.error('❌ Lỗi khi upload ảnh chính:', error);
    throw error;
  }
}

/**
 * Upload ảnh phụ cho sản phẩm
 * @param file - File ảnh
 * @param productId - ID sản phẩm
 * @param altText - Văn bản thay thế
 * @returns Promise<ProductImage>
 */
export async function uploadAdditionalProductImage(
  file: Buffer | string,
  productId: string,
  altText?: string
): Promise<ProductImage> {
  try {
    const imagesCollection = await getCollection<ProductImage>(COLLECTIONS.PRODUCT_IMAGES);

    // Upload ảnh
    const uploadResult = await uploadSecondaryProductImage(file, productId);

    // Lấy displayOrder cao nhất
    const lastImage = await imagesCollection.findOne(
      { productId },
      { sort: { displayOrder: -1 } }
    );
    const displayOrder = (lastImage?.displayOrder ?? -1) + 1;

    // Lưu vào database
    const newImage: Omit<ProductImage, '_id'> = {
      productId,
      cloudinaryPublicId: uploadResult.public_id,
      imageUrl: uploadResult.secure_url,
      altText: altText || '',
      displayOrder,
      isPrimary: false,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes,
      format: uploadResult.format,
      uploadedAt: new Date(),
      createdAt: new Date(),
    };

    const result = await imagesCollection.insertOne(newImage as any);
    const image = await imagesCollection.findOne({ _id: result.insertedId });

    if (!image) {
      throw new Error('Không thể lưu ảnh phụ vào database');
    }

    console.log('✅ Đã upload ảnh phụ thành công:', uploadResult.public_id);
    return image;
  } catch (error) {
    console.error('❌ Lỗi khi upload ảnh phụ:', error);
    throw error;
  }
}

/**
 * Upload nhiều ảnh cùng lúc
 * @param files - Mảng các file ảnh
 * @param productId - ID sản phẩm
 * @param primaryImageIndex - Index của ảnh chính (mặc định 0)
 * @returns Promise<ProductImage[]>
 */
export async function uploadMultipleImages(
  files: (Buffer | string)[],
  productId: string,
  primaryImageIndex: number = 0
): Promise<ProductImage[]> {
  try {
    const imagesCollection = await getCollection<ProductImage>(COLLECTIONS.PRODUCT_IMAGES);

    // Nếu có ảnh chính trong lô upload này, set các ảnh hiện tại thành không chính
    if (primaryImageIndex >= 0 && primaryImageIndex < files.length) {
      await imagesCollection.updateMany(
        { productId },
        { $set: { isPrimary: false } }
      );
    }

    // Upload tất cả ảnh
    const uploadResults = await uploadMultipleProductImages(files, productId, primaryImageIndex);

    // Lấy displayOrder cao nhất
    const lastImage = await imagesCollection.findOne(
      { productId },
      { sort: { displayOrder: -1 } }
    );
    let displayOrder = (lastImage?.displayOrder ?? -1) + 1;

    // Lưu tất cả ảnh vào database
    const imageDocuments: Omit<ProductImage, '_id'>[] = uploadResults.map((result) => ({
      productId,
      cloudinaryPublicId: result.public_id,
      imageUrl: result.secure_url,
      altText: '',
      displayOrder: displayOrder++,
      isPrimary: result.isPrimary ?? false,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
      uploadedAt: new Date(),
      createdAt: new Date(),
    }));

    const insertResult = await imagesCollection.insertMany(imageDocuments as any);
    
    // Chuyển insertedIds thành array
    const insertedIds = Array.isArray(insertResult.insertedIds) 
      ? insertResult.insertedIds 
      : Object.values(insertResult.insertedIds);
    
    const images = await imagesCollection.find({ _id: { $in: insertedIds } }).toArray();

    console.log(`✅ Đã upload ${files.length} ảnh thành công`);
    return images;
  } catch (error) {
    console.error('❌ Lỗi khi upload nhiều ảnh:', error);
    throw error;
  }
}

// =============================================
// GET IMAGES
// =============================================

/**
 * Lấy tất cả ảnh của sản phẩm
 * @param productId - ID sản phẩm
 * @returns Promise<ProductImage[]>
 */
export async function getProductImages(productId: string): Promise<ProductImage[]> {
  try {
    const imagesCollection = await getCollection<ProductImage>(COLLECTIONS.PRODUCT_IMAGES);
    const images = await imagesCollection
      .find({ productId })
      .sort({ displayOrder: 1 })
      .toArray();
    return images;
  } catch (error) {
    console.error('❌ Lỗi khi lấy ảnh sản phẩm:', error);
    throw error;
  }
}

/**
 * Lấy ảnh chính của sản phẩm
 * @param productId - ID sản phẩm
 * @returns Promise<ProductImage | null>
 */
export async function getPrimaryProductImage(productId: string): Promise<ProductImage | null> {
  try {
    const imagesCollection = await getCollection<ProductImage>(COLLECTIONS.PRODUCT_IMAGES);
    const image = await imagesCollection.findOne({
      productId,
      isPrimary: true,
    });
    return image || null;
  } catch (error) {
    console.error('❌ Lỗi khi lấy ảnh chính:', error);
    throw error;
  }
}

/**
 * Lấy ảnh phụ của sản phẩm
 * @param productId - ID sản phẩm
 * @returns Promise<ProductImage[]>
 */
export async function getSecondaryProductImages(productId: string): Promise<ProductImage[]> {
  try {
    const imagesCollection = await getCollection<ProductImage>(COLLECTIONS.PRODUCT_IMAGES);
    const images = await imagesCollection
      .find({ productId, isPrimary: false })
      .sort({ displayOrder: 1 })
      .toArray();
    return images;
  } catch (error) {
    console.error('❌ Lỗi khi lấy ảnh phụ:', error);
    throw error;
  }
}

/**
 * Lấy URL ảnh với kích thước tùy chỉnh
 * @param imageId - ID của ảnh trong database
 * @param width - Chiều rộng
 * @param height - Chiều cao
 * @returns Promise<string>
 */
export async function getProductImageUrl(
  imageId: string,
  width?: number,
  height?: number
): Promise<string> {
  try {
    const imagesCollection = await getCollection<ProductImage>(COLLECTIONS.PRODUCT_IMAGES);
    const objectId = typeof imageId === 'string' ? new ObjectId(imageId) : imageId;
    const image = await imagesCollection.findOne({ _id: objectId });

    if (!image) {
      throw new Error('Không tìm thấy ảnh');
    }

    return getImageUrl(image.cloudinaryPublicId, {
      width,
      height,
      crop: 'fill',
      quality: 90,
      format: 'auto',
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy URL ảnh:', error);
    throw error;
  }
}

// =============================================
// UPDATE IMAGES
// =============================================

/**
 * Cập nhật thứ tự hiển thị ảnh
 * @param imageId - ID của ảnh
 * @param displayOrder - Thứ tự mới
 * @returns Promise<ProductImage>
 */
export async function updateImageDisplayOrder(
  imageId: string,
  displayOrder: number
): Promise<ProductImage> {
  try {
    const imagesCollection = await getCollection<ProductImage>(COLLECTIONS.PRODUCT_IMAGES);
    const objectId = typeof imageId === 'string' ? new ObjectId(imageId) : imageId;

    const result = await imagesCollection.findOneAndUpdate(
      { _id: objectId },
      { $set: { displayOrder } },
      { returnDocument: 'after' as const }
    );

    if (!result) {
      throw new Error('Không tìm thấy ảnh');
    }

    return result;
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật thứ tự ảnh:', error);
    throw error;
  }
}

/**
 * Đặt một ảnh là ảnh chính
 * @param imageId - ID của ảnh
 * @returns Promise<ProductImage>
 */
export async function setPrimaryImage(imageId: string): Promise<ProductImage> {
  try {
    const imagesCollection = await getCollection<ProductImage>(COLLECTIONS.PRODUCT_IMAGES);
    const objectId = typeof imageId === 'string' ? new ObjectId(imageId) : imageId;

    // Lấy productId của ảnh này
    const image = await imagesCollection.findOne({ _id: objectId });
    if (!image) {
      throw new Error('Không tìm thấy ảnh');
    }

    // Set tất cả ảnh của sản phẩm này thành không chính
    await imagesCollection.updateMany(
      { productId: image.productId },
      { $set: { isPrimary: false } }
    );

    // Set ảnh này thành chính
    const result = await imagesCollection.findOneAndUpdate(
      { _id: objectId },
      { $set: { isPrimary: true } },
      { returnDocument: 'after' as const }
    );

    if (!result) {
      throw new Error('Không thể cập nhật ảnh chính');
    }

    console.log('✅ Đã đặt ảnh chính thành công');
    return result;
  } catch (error) {
    console.error('❌ Lỗi khi đặt ảnh chính:', error);
    throw error;
  }
}

/**
 * Cập nhật altText của ảnh
 * @param imageId - ID của ảnh
 * @param altText - Văn bản thay thế mới
 * @returns Promise<ProductImage>
 */
export async function updateImageAltText(
  imageId: string,
  altText: string
): Promise<ProductImage> {
  try {
    const imagesCollection = await getCollection<ProductImage>(COLLECTIONS.PRODUCT_IMAGES);
    const objectId = typeof imageId === 'string' ? new ObjectId(imageId) : imageId;

    const result = await imagesCollection.findOneAndUpdate(
      { _id: objectId },
      { $set: { altText } },
      { returnDocument: 'after' as const }
    );

    if (!result) {
      throw new Error('Không tìm thấy ảnh');
    }

    return result;
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật altText:', error);
    throw error;
  }
}

// =============================================
// DELETE IMAGES
// =============================================

/**
 * Xóa một ảnh
 * @param imageId - ID của ảnh
 * @returns Promise<boolean>
 */
export async function deleteProductImage(imageId: string): Promise<boolean> {
  try {
    const imagesCollection = await getCollection<ProductImage>(COLLECTIONS.PRODUCT_IMAGES);
    const objectId = typeof imageId === 'string' ? new ObjectId(imageId) : imageId;

    const image = await imagesCollection.findOne({ _id: objectId });
    if (!image) {
      throw new Error('Không tìm thấy ảnh');
    }

    // Xóa từ Cloudinary
    await deleteImage(image.cloudinaryPublicId);

    // Xóa từ database
    const result = await imagesCollection.deleteOne({ _id: objectId });

    if (result.deletedCount > 0) {
      // Nếu ảnh bị xóa là ảnh chính, đặt ảnh đầu tiên làm ảnh chính
      if (image.isPrimary) {
        const firstImage = await imagesCollection.findOne(
          { productId: image.productId },
          { sort: { displayOrder: 1 } }
        );
        if (firstImage) {
          await imagesCollection.updateOne(
            { _id: firstImage._id },
            { $set: { isPrimary: true } }
          );
        }
      }

      console.log('✅ Đã xóa ảnh thành công');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Lỗi khi xóa ảnh:', error);
    throw error;
  }
}

/**
 * Xóa tất cả ảnh của sản phẩm
 * @param productId - ID sản phẩm
 * @returns Promise<number> - Số ảnh bị xóa
 */
export async function deleteAllProductImages(productId: string): Promise<number> {
  try {
    const imagesCollection = await getCollection<ProductImage>(COLLECTIONS.PRODUCT_IMAGES);

    // Lấy tất cả ảnh
    const images = await imagesCollection.find({ productId }).toArray();

    // Xóa từ Cloudinary
    for (const image of images) {
      await deleteImage(image.cloudinaryPublicId);
    }

    // Xóa từ database
    const result = await imagesCollection.deleteMany({ productId });

    console.log(`✅ Đã xóa ${result.deletedCount} ảnh thành công`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Lỗi khi xóa tất cả ảnh:', error);
    throw error;
  }
}

export default {
  uploadPrimaryProductImage,
  uploadAdditionalProductImage,
  uploadMultipleImages,
  getProductImages,
  getPrimaryProductImage,
  getSecondaryProductImages,
  getProductImageUrl,
  updateImageDisplayOrder,
  setPrimaryImage,
  updateImageAltText,
  deleteProductImage,
  deleteAllProductImages,
};
