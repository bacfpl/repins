import { executeQuery } from '@/DataBase';
import { Product } from '@/data/products';

export interface ProductFilter {
  page?: number;
  pageSize?: number;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Lấy danh sách sản phẩm với phân trang
 * @param page - Số trang (bắt đầu từ 1)
 * @param pageSize - Số sản phẩm mỗi trang
 * @returns Promise<PaginatedProducts>
 */
export async function getProductsByPage(
  page: number = 1,
  pageSize: number = 12
): Promise<PaginatedProducts> {
  try {
    const offset = (page - 1) * pageSize;
    
    // Query để lấy tổng số sản phẩm
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Products
      WHERE isActive = 1
    `;
    
    // Query để lấy sản phẩm theo trang
    const productsQuery = `
      SELECT 
        id,
        name,
        price,
        priceValue,
        image,
        images,
        category,
        brand,
        vat,
        ship,
        description,
        specifications
      FROM Products
      WHERE isActive = 1
      ORDER BY id ASC
      OFFSET ${offset} ROWS
      FETCH NEXT ${pageSize} ROWS ONLY
    `;
    
    const [countResult, productsResult] = await Promise.all([
      executeQuery<{ total: number }>(countQuery),
      executeQuery<Product>(productsQuery)
    ]);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);
    
    // Parse JSON fields nếu cần
    const products = productsResult.map(product => ({
      ...product,
      images: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : undefined,
      specifications: product.specifications ? (typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications) : undefined,
    }));
    
    return {
      products,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error('❌ Lỗi khi lấy sản phẩm theo trang:', error);
    throw error;
  }
}

/**
 * Lấy danh sách sản phẩm theo thương hiệu
 * @param brand - Tên thương hiệu
 * @param page - Số trang (bắt đầu từ 1)
 * @param pageSize - Số sản phẩm mỗi trang
 * @returns Promise<PaginatedProducts>
 */
export async function getProductsByBrand(
  brand: string,
  page: number = 1,
  pageSize: number = 12
): Promise<PaginatedProducts> {
  try {
    const offset = (page - 1) * pageSize;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Products
      WHERE isActive = 1 AND brand = @brand
    `;
    
    const productsQuery = `
      SELECT 
        id,
        name,
        price,
        priceValue,
        image,
        images,
        category,
        brand,
        vat,
        ship,
        description,
        specifications
      FROM Products
      WHERE isActive = 1 AND brand = @brand
      ORDER BY id ASC
      OFFSET ${offset} ROWS
      FETCH NEXT ${pageSize} ROWS ONLY
    `;
    
    const [countResult, productsResult] = await Promise.all([
      executeQuery<{ total: number }>(countQuery, { brand }),
      executeQuery<Product>(productsQuery, { brand })
    ]);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);
    
    const products = productsResult.map(product => ({
      ...product,
      images: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : undefined,
      specifications: product.specifications ? (typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications) : undefined,
    }));
    
    return {
      products,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error('❌ Lỗi khi lấy sản phẩm theo thương hiệu:', error);
    throw error;
  }
}

/**
 * Lấy danh sách sản phẩm theo khoảng giá
 * @param minPrice - Giá tối thiểu
 * @param maxPrice - Giá tối đa
 * @param page - Số trang (bắt đầu từ 1)
 * @param pageSize - Số sản phẩm mỗi trang
 * @param sortBy - Sắp xếp theo (price_asc, price_desc, name_asc, name_desc)
 * @returns Promise<PaginatedProducts>
 */
export async function getProductsByPriceRange(
  minPrice?: number,
  maxPrice?: number,
  page: number = 1,
  pageSize: number = 12,
  sortBy: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' = 'price_asc'
): Promise<PaginatedProducts> {
  try {
    const offset = (page - 1) * pageSize;
    
    // Xây dựng điều kiện WHERE
    let whereClause = 'WHERE isActive = 1';
    const params: Record<string, any> = {};
    
    if (minPrice !== undefined) {
      whereClause += ' AND priceValue >= @minPrice';
      params.minPrice = minPrice;
    }
    
    if (maxPrice !== undefined) {
      whereClause += ' AND priceValue <= @maxPrice';
      params.maxPrice = maxPrice;
    }
    
    // Xây dựng ORDER BY
    let orderBy = 'ORDER BY ';
    switch (sortBy) {
      case 'price_asc':
        orderBy += 'priceValue ASC';
        break;
      case 'price_desc':
        orderBy += 'priceValue DESC';
        break;
      case 'name_asc':
        orderBy += 'name ASC';
        break;
      case 'name_desc':
        orderBy += 'name DESC';
        break;
      default:
        orderBy += 'priceValue ASC';
    }
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Products
      ${whereClause}
    `;
    
    const productsQuery = `
      SELECT 
        id,
        name,
        price,
        priceValue,
        image,
        images,
        category,
        brand,
        vat,
        ship,
        description,
        specifications
      FROM Products
      ${whereClause}
      ${orderBy}
      OFFSET ${offset} ROWS
      FETCH NEXT ${pageSize} ROWS ONLY
    `;
    
    const [countResult, productsResult] = await Promise.all([
      executeQuery<{ total: number }>(countQuery, params),
      executeQuery<Product>(productsQuery, params)
    ]);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);
    
    const products = productsResult.map(product => ({
      ...product,
      images: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : undefined,
      specifications: product.specifications ? (typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications) : undefined,
    }));
    
    return {
      products,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error('❌ Lỗi khi lấy sản phẩm theo khoảng giá:', error);
    throw error;
  }
}

/**
 * Lấy danh sách sản phẩm theo loại (category)
 * @param category - Tên loại sản phẩm
 * @param page - Số trang (bắt đầu từ 1)
 * @param pageSize - Số sản phẩm mỗi trang
 * @returns Promise<PaginatedProducts>
 */
export async function getProductsByCategory(
  category: string,
  page: number = 1,
  pageSize: number = 12
): Promise<PaginatedProducts> {
  try {
    const offset = (page - 1) * pageSize;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Products
      WHERE isActive = 1 AND category = @category
    `;
    
    const productsQuery = `
      SELECT 
        id,
        name,
        price,
        priceValue,
        image,
        images,
        category,
        brand,
        vat,
        ship,
        description,
        specifications
      FROM Products
      WHERE isActive = 1 AND category = @category
      ORDER BY id ASC
      OFFSET ${offset} ROWS
      FETCH NEXT ${pageSize} ROWS ONLY
    `;
    
    const [countResult, productsResult] = await Promise.all([
      executeQuery<{ total: number }>(countQuery, { category }),
      executeQuery<Product>(productsQuery, { category })
    ]);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);
    
    const products = productsResult.map(product => ({
      ...product,
      images: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : undefined,
      specifications: product.specifications ? (typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications) : undefined,
    }));
    
    return {
      products,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error('❌ Lỗi khi lấy sản phẩm theo loại:', error);
    throw error;
  }
}

/**
 * Lấy danh sách sản phẩm với bộ lọc tổng hợp
 * @param filter - Đối tượng chứa các bộ lọc
 * @returns Promise<PaginatedProducts>
 */
export async function getProductsWithFilter(
  filter: ProductFilter
): Promise<PaginatedProducts> {
  try {
    const {
      page = 1,
      pageSize = 12,
      brand,
      category,
      minPrice,
      maxPrice,
      sortBy = 'price_asc',
    } = filter;
    
    const offset = (page - 1) * pageSize;
    
    // Xây dựng điều kiện WHERE
    let whereClause = 'WHERE isActive = 1';
    const params: Record<string, any> = {};
    
    if (brand) {
      whereClause += ' AND brand = @brand';
      params.brand = brand;
    }
    
    if (category) {
      whereClause += ' AND category = @category';
      params.category = category;
    }
    
    if (minPrice !== undefined) {
      whereClause += ' AND priceValue >= @minPrice';
      params.minPrice = minPrice;
    }
    
    if (maxPrice !== undefined) {
      whereClause += ' AND priceValue <= @maxPrice';
      params.maxPrice = maxPrice;
    }
    
    // Xây dựng ORDER BY
    let orderBy = 'ORDER BY ';
    switch (sortBy) {
      case 'price_asc':
        orderBy += 'priceValue ASC';
        break;
      case 'price_desc':
        orderBy += 'priceValue DESC';
        break;
      case 'name_asc':
        orderBy += 'name ASC';
        break;
      case 'name_desc':
        orderBy += 'name DESC';
        break;
      default:
        orderBy += 'priceValue ASC';
    }
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Products
      ${whereClause}
    `;
    
    const productsQuery = `
      SELECT 
        id,
        name,
        price,
        priceValue,
        image,
        images,
        category,
        brand,
        vat,
        ship,
        description,
        specifications
      FROM Products
      ${whereClause}
      ${orderBy}
      OFFSET ${offset} ROWS
      FETCH NEXT ${pageSize} ROWS ONLY
    `;
    
    const [countResult, productsResult] = await Promise.all([
      executeQuery<{ total: number }>(countQuery, params),
      executeQuery<Product>(productsQuery, params)
    ]);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);
    
    const products = productsResult.map(product => ({
      ...product,
      images: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : undefined,
      specifications: product.specifications ? (typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications) : undefined,
    }));
    
    return {
      products,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error('❌ Lỗi khi lấy sản phẩm với bộ lọc:', error);
    throw error;
  }
}

/**
 * Lấy sản phẩm theo ID
 * @param id - ID sản phẩm
 * @returns Promise<Product | null>
 */
export async function getProductById(id: number): Promise<Product | null> {
  try {
    const query = `
      SELECT 
        id,
        name,
        price,
        priceValue,
        image,
        images,
        category,
        brand,
        vat,
        ship,
        description,
        specifications
      FROM Products
      WHERE id = @id AND isActive = 1
    `;
    
    const result = await executeQuery<Product>(query, { id });
    
    if (result.length === 0) {
      return null;
    }
    
    const product = result[0];
    return {
      ...product,
      images: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : undefined,
      specifications: product.specifications ? (typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications) : undefined,
    };
  } catch (error) {
    console.error('❌ Lỗi khi lấy sản phẩm theo ID:', error);
    throw error;
  }
}

