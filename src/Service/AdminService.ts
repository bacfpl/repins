import { getCollection } from '@/DataBase/mongodb.connection';
import { COLLECTIONS, Product, Category, Brand, ProductImage } from '@/DataBase/mongodb.schema';
import { ObjectId } from 'mongodb';
import { addAutoOptimization } from './CloudinaryService';

// =============================================
// PRODUCT CRUD
// =============================================

export async function createProduct(productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  try {
    const productsCollection = await getCollection<Product>(COLLECTIONS.PRODUCTS);
    
    const newProduct: Omit<Product, '_id'> = {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      isActive: productData.isActive ?? true,
      isFeatured: productData.isFeatured ?? false,
      stock: productData.stock ?? 0,
    };
    
    const result = await productsCollection.insertOne(newProduct as any);
    const product = await productsCollection.findOne({ _id: result.insertedId });
    
    if (!product) {
      throw new Error('Không thể tạo sản phẩm');
    }
    
    // Tạo folder trên Cloudinary: products/{productId}
    // Folder sẽ được tạo tự động khi upload ảnh đầu tiên
    
    return product;
  } catch (error) {
    console.error('❌ Lỗi khi tạo sản phẩm:', error);
    throw error;
  }
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  try {
    const productsCollection = await getCollection<Product>(COLLECTIONS.PRODUCTS);
    
    const updateData = {
      ...productData,
      updatedAt: new Date(),
    };
    delete (updateData as any)._id;
    delete (updateData as any).createdAt;
    
    // Cố gắng convert thành ObjectId nếu có thể, nếu không dùng string ID
    let query: any = {};
    try {
      query._id = new ObjectId(id);
    } catch (e) {
      // Nếu không phải ObjectId, dùng string ID
      query._id = id;
    }
    
    const result = await productsCollection.findOneAndUpdate(
      query,
      { $set: updateData },
      { returnDocument: 'after' as const }
    );
    
    if (!result) {
      throw new Error('Không tìm thấy sản phẩm');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật sản phẩm:', error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const productsCollection = await getCollection<Product>(COLLECTIONS.PRODUCTS);
    
    // Cố gắng convert thành ObjectId nếu có thể, nếu không dùng string ID
    let query: any = {};
    try {
      query._id = new ObjectId(id);
    } catch (e) {
      // Nếu không phải ObjectId, dùng string ID
      query._id = id;
    }
    
    const result = await productsCollection.deleteOne(query);
    return result.deletedCount > 0;
  } catch (error) {
    console.error('❌ Lỗi khi xóa sản phẩm:', error);
    throw error;
  }
}

// =============================================
// CATEGORY CRUD
// =============================================

export async function createCategory(categoryData: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
  try {
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    
    const newCategory: Omit<Category, '_id'> = {
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: categoryData.isActive ?? true,
    };
    
    const result = await categoriesCollection.insertOne(newCategory as any);
    const category = await categoriesCollection.findOne({ _id: result.insertedId });
    
    if (!category) {
      throw new Error('Không thể tạo danh mục');
    }
    
    return category;
  } catch (error) {
    console.error('❌ Lỗi khi tạo danh mục:', error);
    throw error;
  }
}

export async function updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
  try {
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    
    const updateData = {
      ...categoryData,
      updatedAt: new Date(),
    };
    delete (updateData as any)._id;
    delete (updateData as any).createdAt;
    
    console.log('📝 Updating category - ID:', id, 'Type:', typeof id);
    
    // Thử string ID trước (vì database dùng string)
    let query: any = {};
    let foundBy = '';
    
    // Thử string ID trước
    console.log('🔍 Trying string ID:', id);
    let existingCategory = await categoriesCollection.findOne({ _id: id } as any);
    
    if (existingCategory) {
      query._id = id;
      foundBy = 'String ID';
      console.log('✅ Found by String ID:', existingCategory);
    } else {
      // Nếu không tìm thấy string, thử ObjectId
      try {
        const objectId = new ObjectId(id);
        console.log('⚠️  String ID not found, trying ObjectId:', objectId);
        existingCategory = await categoriesCollection.findOne({ _id: objectId } as any);
        
        if (existingCategory) {
          query._id = objectId;
          foundBy = 'ObjectId';
          console.log('✅ Found by ObjectId:', existingCategory);
        }
      } catch (e) {
        console.log('⚠️  ObjectId conversion failed');
      }
    }
    
    if (!query._id) {
      throw new Error(`❌ Không tìm thấy danh mục với ID: ${id}`);
    }
    
    const result = await categoriesCollection.findOneAndUpdate(
      query,
      { $set: updateData },
      { returnDocument: 'after' as const }
    );
    
    if (!result) {
      throw new Error(`Cập nhật thất bại cho ID: ${id}`);
    }
    
    console.log(`✅ Updated successfully by ${foundBy}:`, result);
    return result;
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật danh mục:', error);
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    
    // Cố gắng convert thành ObjectId nếu có thể, nếu không dùng string ID
    let query: any = {};
    try {
      query._id = new ObjectId(id);
    } catch (e) {
      // Nếu không phải ObjectId, dùng string ID
      query._id = id;
    }
    
    const result = await categoriesCollection.deleteOne(query);
    return result.deletedCount > 0;
  } catch (error) {
    console.error('❌ Lỗi khi xóa danh mục:', error);
    throw error;
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    return await categoriesCollection.find({}).sort({ name: 1 }).toArray();
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách danh mục:', error);
    throw error;
  }
}

// =============================================
// BRAND CRUD
// =============================================

export async function createBrand(brandData: Omit<Brand, '_id' | 'createdAt' | 'updatedAt'>): Promise<Brand> {
  try {
    const brandsCollection = await getCollection<Brand>(COLLECTIONS.BRANDS);
    
    const newBrand: Omit<Brand, '_id'> = {
      ...brandData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: brandData.isActive ?? true,
    };
    
    const result = await brandsCollection.insertOne(newBrand as any);
    const brand = await brandsCollection.findOne({ _id: result.insertedId });
    
    if (!brand) {
      throw new Error('Không thể tạo thương hiệu');
    }
    
    return brand;
  } catch (error) {
    console.error('❌ Lỗi khi tạo thương hiệu:', error);
    throw error;
  }
}

export async function updateBrand(id: string, brandData: Partial<Brand>): Promise<Brand> {
  try {
    const brandsCollection = await getCollection<Brand>(COLLECTIONS.BRANDS);
    
    const updateData = {
      ...brandData,
      updatedAt: new Date(),
    };
    delete (updateData as any)._id;
    delete (updateData as any).createdAt;
    
    console.log('📝 Updating brand - ID:', id);
    
    // Thử string ID trước (vì database dùng string)
    let query: any = {};
    let foundBy = '';
    
    console.log('🔍 Trying string ID:', id);
    let existingBrand = await brandsCollection.findOne({ _id: id });
    
    if (existingBrand) {
      query._id = id;
      foundBy = 'String ID';
      console.log('✅ Found by String ID:', existingBrand);
    } else {
      // Nếu không tìm thấy string, thử ObjectId
      try {
        const objectId = new ObjectId(id);
        console.log('⚠️  String ID not found, trying ObjectId:', objectId);
        existingBrand = await brandsCollection.findOne({ _id: objectId } as any);
        
        if (existingBrand) {
          query._id = objectId;
          foundBy = 'ObjectId';
          console.log('✅ Found by ObjectId:', existingBrand);
        }
      } catch (e) {
        console.log('⚠️  ObjectId conversion failed');
      }
    }
    
    if (!query._id) {
      throw new Error(`❌ Không tìm thấy thương hiệu với ID: ${id}`);
    }
    
    const result = await brandsCollection.findOneAndUpdate(
      query,
      { $set: updateData },
      { returnDocument: 'after' as const }
    );
    
    if (!result) {
      throw new Error(`Cập nhật thất bại cho ID: ${id}`);
    }
    
    console.log(`✅ Updated successfully by ${foundBy}:`, result);
    return result;
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật thương hiệu:', error);
    throw error;
  }
}

export async function deleteBrand(id: string): Promise<boolean> {
  try {
    const brandsCollection = await getCollection<Brand>(COLLECTIONS.BRANDS);
    
    console.log('🗑️  Deleting brand - ID:', id);
    
    // Thử string ID trước (vì database dùng string)
    let query: any = {};
    let foundBy = '';
    
    // Thử string ID trước
    console.log('🔍 Trying string ID:', id);
    const existingBrand = await brandsCollection.findOne({ _id: id });
    
    if (existingBrand) {
      query._id = id;
      foundBy = 'String ID';
      console.log('✅ Found by String ID:', existingBrand);
    } else {
      // Nếu không tìm thấy string, thử ObjectId
      try {
        const objectId = new ObjectId(id);
        console.log('⚠️  String ID not found, trying ObjectId:', objectId);
        const foundByObjectId = await brandsCollection.findOne({ _id: objectId } as any);
        
        if (foundByObjectId) {
          query._id = objectId;
          foundBy = 'ObjectId';
          console.log('✅ Found by ObjectId:', foundByObjectId);
        }
      } catch (e) {
        console.log('⚠️  ObjectId conversion failed');
      }
    }
    
    if (!query._id) {
      throw new Error(`❌ Không tìm thấy thương hiệu với ID: ${id}`);
    }
    
    const result = await brandsCollection.deleteOne(query);
    console.log(`✅ Deleted successfully by ${foundBy}`);
    return result.deletedCount > 0;
  } catch (error) {
    console.error('❌ Lỗi khi xóa thương hiệu:', error);
    throw error;
  }
}

export async function getAllBrands(): Promise<Brand[]> {
  try {
    const brandsCollection = await getCollection<Brand>(COLLECTIONS.BRANDS);
    return await brandsCollection.find({}).sort({ name: 1 }).toArray();
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách thương hiệu:', error);
    throw error;
  }
}

// =============================================
// GET ALL PRODUCTS (for admin)
// =============================================

export async function getAllProducts(): Promise<Product[]> {
  try {
    const productsCollection = await getCollection<Product>(COLLECTIONS.PRODUCTS);
    return await productsCollection.find({}).sort({ createdAt: -1 }).toArray();
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách sản phẩm:', error);
    throw error;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const productsCollection = await getCollection<Product>(COLLECTIONS.PRODUCTS);
    
    // Cố gắng convert thành ObjectId nếu có thể, nếu không dùng string ID
    let query: any = {};
    try {
      query._id = new ObjectId(id);
    } catch (e) {
      // Nếu không phải ObjectId, dùng string ID
      query._id = id;
    }
    
    const product = await productsCollection.findOne(query);
    
    if (!product) {
      return null;
    }
    
    // Thêm optimization vào các URL ảnh nếu có
    if (product.image) {
      product.image = addAutoOptimization(product.image, {
        width: 800,
        height: 800,
        quality: 85,
      });
    }
    
    if (product.images && Array.isArray(product.images)) {
      product.images = product.images.map(img => addAutoOptimization(img, {
        width: 800,
        height: 800,
        quality: 85,
      }));
    }
    
    return product;
  } catch (error) {
    console.error('❌ Lỗi khi lấy sản phẩm:', error);
    throw error;
  }
}

// =============================================
// PRODUCT IMAGES MANAGEMENT
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
    
    // Thêm optimization vào mỗi URL ảnh
    return images.map(img => ({
      ...img,
      imageUrl: addAutoOptimization(img.imageUrl, {
        width: 800,
        height: 800,
        quality: 85,
      }),
    }));
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

    // Xóa từ database
    const result = await imagesCollection.deleteMany({ productId });

    console.log(`✅ Đã xóa ${result.deletedCount} ảnh thành công`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Lỗi khi xóa tất cả ảnh:', error);
    throw error;
  }
}

