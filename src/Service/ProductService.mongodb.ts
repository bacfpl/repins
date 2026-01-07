import { getCollection } from '@/DataBase/mongodb.connection';
import { COLLECTIONS, Product, Category, Brand } from '@/DataBase/mongodb.schema';
import { Product as ProductType } from '@/data/products';

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
  products: ProductType[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Chuyển đổi Product từ MongoDB sang ProductType
 */
function mapProductToType(product: Product, categoryName?: string, brandName?: string): ProductType {
  // Chuyển đổi _id (ObjectId hoặc string) sang number
  let id = 0;
  if (product._id) {
    if (typeof product._id === 'string') {
      // Nếu là string, thử parse hoặc dùng hash
      const parsed = parseInt(product._id);
      id = isNaN(parsed) ? Math.abs(product._id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)) % 1000000 : parsed;
    } else if (product._id instanceof ObjectId) {
      // Sử dụng timestamp của ObjectId hoặc hash để tạo số
      id = parseInt(product._id.toString().slice(-8), 16) || 0;
    } else {
      // Nếu là object có toString
      id = parseInt(String(product._id).slice(-8), 16) || 0;
    }
  }

  return {
    id,
    name: product.name,
    price: product.price,
    priceValue: product.priceValue,
    image: product.image || product.images?.[0] || '',
    images: product.images,
    category: categoryName || product.categoryId,
    brand: brandName || product.brandId,
    vat: product.vat,
    ship: product.ship,
    description: product.description,
    specifications: product.specifications,
  };
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
    const productsCollection = await getCollection<Product>(COLLECTIONS.PRODUCTS);
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    const brandsCollection = await getCollection<Brand>(COLLECTIONS.BRANDS);

    const skip = (page - 1) * pageSize;

    // Lấy tổng số sản phẩm
    const total = await productsCollection.countDocuments({ isActive: true });

    // Lấy sản phẩm với phân trang
    const products = await productsCollection
      .find({ isActive: true })
      .sort({ _id: 1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    // Lấy thông tin category và brand
    const categoryIds = [...new Set(products.map(p => p.categoryId))].map(id => 
      typeof id === 'string' ? id : new ObjectId(id)
    );
    const brandIds = [...new Set(products.map(p => p.brandId))].map(id => 
      typeof id === 'string' ? id : new ObjectId(id)
    );

    const categories = await categoriesCollection
      .find({ _id: { $in: categoryIds } })
      .toArray();
    const brands = await brandsCollection
      .find({ _id: { $in: brandIds } })
      .toArray();

    const categoryMap = new Map(categories.map(c => [c._id, c.name]));
    const brandMap = new Map(brands.map(b => [b._id, b.name]));

    const mappedProducts = products.map(product =>
      mapProductToType(
        product,
        categoryMap.get(product.categoryId),
        brandMap.get(product.brandId)
      )
    );

    const totalPages = Math.ceil(total / pageSize);

    return {
      products: mappedProducts,
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
    const productsCollection = await getCollection<Product>(COLLECTIONS.PRODUCTS);
    const brandsCollection = await getCollection<Brand>(COLLECTIONS.BRANDS);
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);

    // Tìm brand theo tên
    const brandDoc = await brandsCollection.findOne({ name: brand, isActive: true });
    if (!brandDoc) {
      return {
        products: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    const skip = (page - 1) * pageSize;

    // Lấy tổng số sản phẩm
    const total = await productsCollection.countDocuments({
      brandId: brandDoc._id,
      isActive: true,
    });

    // Lấy sản phẩm
    const products = await productsCollection
      .find({ brandId: brandDoc._id, isActive: true })
      .sort({ _id: 1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    // Lấy thông tin category
    const categoryIds = [...new Set(products.map(p => p.categoryId))];
    const categories = await categoriesCollection
      .find({ _id: { $in: categoryIds } })
      .toArray();
    const categoryMap = new Map(categories.map(c => [c._id, c.name]));

    const mappedProducts = products.map(product =>
      mapProductToType(product, categoryMap.get(product.categoryId), brand)
    );

    const totalPages = Math.ceil(total / pageSize);

    return {
      products: mappedProducts,
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
    const productsCollection = await getCollection<Product>(COLLECTIONS.PRODUCTS);
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    const brandsCollection = await getCollection<Brand>(COLLECTIONS.BRANDS);

    const skip = (page - 1) * pageSize;

    // Xây dựng query filter
    const filter: any = { isActive: true };
    if (minPrice !== undefined) {
      filter.priceValue = { ...filter.priceValue, $gte: minPrice };
    }
    if (maxPrice !== undefined) {
      filter.priceValue = { ...filter.priceValue, $lte: maxPrice };
    }

    // Xây dựng sort
    let sort: any = {};
    switch (sortBy) {
      case 'price_asc':
        sort = { priceValue: 1 };
        break;
      case 'price_desc':
        sort = { priceValue: -1 };
        break;
      case 'name_asc':
        sort = { name: 1 };
        break;
      case 'name_desc':
        sort = { name: -1 };
        break;
      default:
        sort = { priceValue: 1 };
    }

    // Lấy tổng số sản phẩm
    const total = await productsCollection.countDocuments(filter);

    // Lấy sản phẩm
    const products = await productsCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .toArray();

    // Lấy thông tin category và brand
    const categoryIds = [...new Set(products.map(p => p.categoryId))].map(id => 
      typeof id === 'string' ? id : new ObjectId(id)
    );
    const brandIds = [...new Set(products.map(p => p.brandId))].map(id => 
      typeof id === 'string' ? id : new ObjectId(id)
    );

    const categories = await categoriesCollection
      .find({ _id: { $in: categoryIds } })
      .toArray();
    const brands = await brandsCollection
      .find({ _id: { $in: brandIds } })
      .toArray();

    const categoryMap = new Map(categories.map(c => [c._id, c.name]));
    const brandMap = new Map(brands.map(b => [b._id, b.name]));

    const mappedProducts = products.map(product =>
      mapProductToType(
        product,
        categoryMap.get(product.categoryId),
        brandMap.get(product.brandId)
      )
    );

    const totalPages = Math.ceil(total / pageSize);

    return {
      products: mappedProducts,
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
    const productsCollection = await getCollection<Product>(COLLECTIONS.PRODUCTS);
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    const brandsCollection = await getCollection<Brand>(COLLECTIONS.BRANDS);

    // Tìm category theo tên
    const categoryDoc = await categoriesCollection.findOne({ name: category, isActive: true });
    if (!categoryDoc) {
      return {
        products: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    const skip = (page - 1) * pageSize;

    // Lấy tổng số sản phẩm
    const total = await productsCollection.countDocuments({
      categoryId: categoryDoc._id,
      isActive: true,
    });

    // Lấy sản phẩm
    const products = await productsCollection
      .find({ categoryId: categoryDoc._id, isActive: true })
      .sort({ _id: 1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    // Lấy thông tin brand
    const brandIds = [...new Set(products.map(p => p.brandId))];
    const brands = await brandsCollection
      .find({ _id: { $in: brandIds } })
      .toArray();
    const brandMap = new Map(brands.map(b => [b._id, b.name]));

    const mappedProducts = products.map(product =>
      mapProductToType(product, category, brandMap.get(product.brandId))
    );

    const totalPages = Math.ceil(total / pageSize);

    return {
      products: mappedProducts,
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

    const productsCollection = await getCollection<Product>(COLLECTIONS.PRODUCTS);
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    const brandsCollection = await getCollection<Brand>(COLLECTIONS.BRANDS);

    const skip = (page - 1) * pageSize;

    // Xây dựng query filter
    const queryFilter: any = { isActive: true };

    if (category) {
      const categoryDoc = await categoriesCollection.findOne({ name: category, isActive: true });
      if (categoryDoc) {
        queryFilter.categoryId = categoryDoc._id;
      } else {
        return {
          products: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
        };
      }
    }

    if (brand) {
      const brandDoc = await brandsCollection.findOne({ name: brand, isActive: true });
      if (brandDoc) {
        queryFilter.brandId = brandDoc._id;
      } else {
        return {
          products: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
        };
      }
    }

    if (minPrice !== undefined) {
      queryFilter.priceValue = { ...queryFilter.priceValue, $gte: minPrice };
    }
    if (maxPrice !== undefined) {
      queryFilter.priceValue = { ...queryFilter.priceValue, $lte: maxPrice };
    }

    // Xây dựng sort
    let sort: any = {};
    switch (sortBy) {
      case 'price_asc':
        sort = { priceValue: 1 };
        break;
      case 'price_desc':
        sort = { priceValue: -1 };
        break;
      case 'name_asc':
        sort = { name: 1 };
        break;
      case 'name_desc':
        sort = { name: -1 };
        break;
      default:
        sort = { priceValue: 1 };
    }

    // Lấy tổng số sản phẩm
    const total = await productsCollection.countDocuments(queryFilter);

    // Lấy sản phẩm
    const products = await productsCollection
      .find(queryFilter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .toArray();

    // Lấy thông tin category và brand
    const categoryIds = [...new Set(products.map(p => p.categoryId))].map(id => 
      typeof id === 'string' ? id : new ObjectId(id)
    );
    const brandIds = [...new Set(products.map(p => p.brandId))].map(id => 
      typeof id === 'string' ? id : new ObjectId(id)
    );

    const categories = await categoriesCollection
      .find({ _id: { $in: categoryIds } })
      .toArray();
    const brands = await brandsCollection
      .find({ _id: { $in: brandIds } })
      .toArray();

    const categoryMap = new Map(categories.map(c => [c._id, c.name]));
    const brandMap = new Map(brands.map(b => [b._id, b.name]));

    const mappedProducts = products.map(product =>
      mapProductToType(
        product,
        categoryMap.get(product.categoryId),
        brandMap.get(product.brandId)
      )
    );

    const totalPages = Math.ceil(total / pageSize);

    return {
      products: mappedProducts,
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
 * @returns Promise<ProductType | null>
 */
export async function getProductById(id: number): Promise<ProductType | null> {
  try {
    const productsCollection = await getCollection<Product>(COLLECTIONS.PRODUCTS);
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    const brandsCollection = await getCollection<Brand>(COLLECTIONS.BRANDS);

    // Tìm product - MongoDB có thể dùng _id là ObjectId hoặc string
    let product: Product | null = null;
    try {
      product = await productsCollection.findOne({
        _id: new ObjectId(id.toString()),
        isActive: true,
      });
    } catch {
      // Nếu không tìm thấy với ObjectId, thử tìm với string
      product = await productsCollection.findOne({
        _id: id.toString(),
        isActive: true,
      });
    }

    if (!product) {
      return null;
    }

    // Lấy thông tin category và brand
    const categoryId = typeof product.categoryId === 'string' 
      ? product.categoryId 
      : new ObjectId(product.categoryId);
    const brandId = typeof product.brandId === 'string'
      ? product.brandId
      : new ObjectId(product.brandId);

    const [category, brand] = await Promise.all([
      categoriesCollection.findOne({ _id: categoryId }),
      brandsCollection.findOne({ _id: brandId }),
    ]);

    return mapProductToType(product, category?.name, brand?.name);
  } catch (error) {
    console.error('❌ Lỗi khi lấy sản phẩm theo ID:', error);
    throw error;
  }
}

