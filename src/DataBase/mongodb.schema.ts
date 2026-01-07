/**
 * MongoDB Schema Definitions
 * Định nghĩa cấu trúc collections và indexes
 */

import { ObjectId } from 'mongodb';
import { getCollection, createIndex } from './mongodb.connection';

// =============================================
// Collection Names
// =============================================
export const COLLECTIONS = {
  CATEGORIES: 'categories',
  BRANDS: 'brands',
  PRODUCTS: 'products',
  PRODUCT_IMAGES: 'productImages',
  PRODUCT_SPECIFICATIONS: 'productSpecifications',
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
  ORDER_ITEMS: 'orderItems',
  PRODUCT_REVIEWS: 'productReviews',
  PROMOTIONS: 'promotions',
} as const;

// =============================================
// Schema Interfaces
// =============================================

export interface Category {
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  _id?: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id?: string;
  name: string;
  sku: string;
  priceValue: number;
  price: string;
  categoryId: string;
  brandId: string;
  primaryImageId?: string; // ID của ảnh chính từ productImages collection
  image?: string; // Deprecated: dùng primaryImageId thay thế
  images?: string[]; // Deprecated: dùng productImages thay thế
  description?: string;
  shortDescription?: string;
  stock: number;
  weight?: number;
  dimensions?: string;
  vat?: string;
  ship?: string;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  specifications?: Array<{ label: string; value: string }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  _id?: ObjectId | string;
  productId: string;
  cloudinaryPublicId: string; // Public ID của Cloudinary
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean; // true = ảnh chính, false = ảnh phụ
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  uploadedAt: Date;
  createdAt: Date;
}

export interface ProductSpecification {
  _id?: ObjectId | string;
  productId: string;
  label: string;
  value: string;
  displayOrder: number;
  createdAt: Date;
}

export interface Customer {
  _id?: ObjectId | string;
  email: string;
  phone?: string;
  fullName?: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id?: ObjectId | string;
  orderNumber: string;
  customerId?: string;
  totalAmount: number;
  shippingFee: number;
  discount: number;
  finalAmount: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  paymentMethod?: string;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  shippingAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  _id?: ObjectId | string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

export interface ProductReview {
  _id?: ObjectId | string;
  productId: string;
  customerId?: string;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Promotion {
  _id?: ObjectId | string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  productIds?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================
// Initialize Indexes
// =============================================

export async function initializeIndexes(): Promise<void> {
  try {
    console.log('🔄 Đang tạo indexes cho MongoDB...');

    // Categories indexes
    await createIndex(COLLECTIONS.CATEGORIES, { name: 1 }, { unique: true });
    await createIndex(COLLECTIONS.CATEGORIES, { isActive: 1 });

    // Brands indexes
    await createIndex(COLLECTIONS.BRANDS, { name: 1 }, { unique: true });
    await createIndex(COLLECTIONS.BRANDS, { isActive: 1 });

    // Products indexes
    await createIndex(COLLECTIONS.PRODUCTS, { sku: 1 }, { unique: true });
    await createIndex(COLLECTIONS.PRODUCTS, { categoryId: 1 });
    await createIndex(COLLECTIONS.PRODUCTS, { brandId: 1 });
    await createIndex(COLLECTIONS.PRODUCTS, { priceValue: 1 });
    await createIndex(COLLECTIONS.PRODUCTS, { isActive: 1 });
    await createIndex(COLLECTIONS.PRODUCTS, { isFeatured: 1 });
    await createIndex(COLLECTIONS.PRODUCTS, { categoryId: 1, brandId: 1 });
    await createIndex(COLLECTIONS.PRODUCTS, { priceValue: 1, isActive: 1 });

    // ProductImages indexes
    await createIndex(COLLECTIONS.PRODUCT_IMAGES, { productId: 1 });
    await createIndex(COLLECTIONS.PRODUCT_IMAGES, { productId: 1, displayOrder: 1 });

    // ProductSpecifications indexes
    await createIndex(COLLECTIONS.PRODUCT_SPECIFICATIONS, { productId: 1 });

    // Customers indexes
    await createIndex(COLLECTIONS.CUSTOMERS, { email: 1 }, { unique: true });
    await createIndex(COLLECTIONS.CUSTOMERS, { isActive: 1 });

    // Orders indexes
    await createIndex(COLLECTIONS.ORDERS, { orderNumber: 1 }, { unique: true });
    await createIndex(COLLECTIONS.ORDERS, { customerId: 1 });
    await createIndex(COLLECTIONS.ORDERS, { status: 1 });
    await createIndex(COLLECTIONS.ORDERS, { createdAt: -1 });

    // OrderItems indexes
    await createIndex(COLLECTIONS.ORDER_ITEMS, { orderId: 1 });
    await createIndex(COLLECTIONS.ORDER_ITEMS, { productId: 1 });

    // ProductReviews indexes
    await createIndex(COLLECTIONS.PRODUCT_REVIEWS, { productId: 1 });
    await createIndex(COLLECTIONS.PRODUCT_REVIEWS, { customerId: 1 });
    await createIndex(COLLECTIONS.PRODUCT_REVIEWS, { productId: 1, isApproved: 1 });

    // Promotions indexes
    await createIndex(COLLECTIONS.PROMOTIONS, { startDate: 1, endDate: 1 });
    await createIndex(COLLECTIONS.PROMOTIONS, { isActive: 1 });

    console.log('✅ Đã tạo tất cả indexes thành công!');
  } catch (error) {
    console.error('❌ Lỗi khi tạo indexes:', error);
    throw error;
  }
}

