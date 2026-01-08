'use client';

import styles from "./products.module.css";
import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: string;
  priceValue: number;
  categoryId: string;
  brandId: string;
  category?: string;
  brand?: string;
  image?: string;
  description?: string;
  stock: number;
}

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

function ProductsPageContent() {
  const pageSize = 8;
  const searchParams = useSearchParams();
  
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  
  // Dữ liệu từ API
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync selectedCategory with URL params
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || '';
    setSelectedCategory(categoryFromUrl);
  }, [searchParams]);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products từ public API
        const productsRes = await fetch('/api/products');
        const productsData = await productsRes.json();
        const productsList = productsData.data || [];
        
        // Fetch categories từ public API
        const categoriesRes = await fetch('/api/categories');
        const categoriesData = await categoriesRes.json();
        const categoriesList = categoriesData.data || [];
        
        // Fetch brands từ public API
        const brandsRes = await fetch('/api/brands');
        const brandsData = await brandsRes.json();
        const brandsList = brandsData.data || [];
        
        setProducts(productsList);
        setCategories(categoriesList);
        setBrands(brandsList);
        
        console.log('📦 Đã load từ public API:', {
          products: productsList.length,
          categories: categoriesList.length,
          brands: brandsList.length,
          firstProduct: productsList[0],
        });
      } catch (error) {
        console.error('Lỗi khi fetch dữ liệu:', error);
        setProducts([]);
        setCategories([]);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    console.log('🔍 Filter debug:', {
      totalProducts: products.length,
      selectedCategory,
      selectedBrand,
      priceRange,
      firstProductCategory: products[0]?.categoryId,
      firstProductBrand: products[0]?.brandId,
      firstProductData: products[0],
    });
    
    return products.filter((product) => {
      // Nếu chưa có category/brand name, tìm từ ID
      const categoryName = product.category || categories.find(c => c._id === product.categoryId)?.name || '';
      const brandName = product.brand || brands.find(b => b._id === product.brandId)?.name || '';
      
      if (selectedCategory && categoryName !== selectedCategory) return false;
      if (selectedBrand && brandName !== selectedBrand) return false;
      if (priceRange) {
        const [min, max] = priceRange.split("-").map((p) => parseInt(p));
        if (product.priceValue < min || (max && product.priceValue > max)) return false;
      }
      return true;
    });
  }, [selectedCategory, selectedBrand, priceRange, products, categories, brands]);

  const maxPage = Math.ceil(filteredProducts.length / pageSize);
  const pagedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const priceRanges = [
    { label: "Tất cả", value: "" },
    { label: "Dưới 1 triệu", value: "0-1000000" },
    { label: "1 - 1.5 triệu", value: "1000000-1500000" },
    { label: "1.5 - 2 triệu", value: "1500000-2000000" },
    { label: "Trên 2 triệu", value: "2000000-999999999" },
  ];

  const handleFilterChange = () => {
    setPage(1);
  };

  const resetFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setPriceRange("");
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        
        <div className={styles.headerSection}>
          <h1 className={styles.title}>Danh Sách Sản Phẩm</h1>
          <button
            className={styles.filterToggle}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            {isFilterOpen ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </button>
        </div>

        <div className={`${styles.filterSection} ${isFilterOpen ? styles.filterSectionOpen : ""}`}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Loại sản phẩm</label>
            <select
              className={styles.filterSelect}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">Tất cả</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Hãng</label>
            <select
              className={styles.filterSelect}
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">Tất cả</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Khoảng giá</label>
            <select
              className={styles.filterSelect}
              value={priceRange}
              onChange={(e) => {
                setPriceRange(e.target.value);
                handleFilterChange();
              }}
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {(selectedCategory || selectedBrand || priceRange) && (
            <button className={styles.resetButton} onClick={resetFilters}>
              Xóa bộ lọc
            </button>
          )}
        </div>

        <div className={styles.resultsInfo}>
          {loading ? 'Đang tải...' : `Tìm thấy ${filteredProducts.length} sản phẩm`}
        </div>

        {loading ? (
          <div className={styles.noResults}>Đang tải sản phẩm...</div>
        ) : pagedProducts.length === 0 ? (
          <div className={styles.noResults}>Không tìm thấy sản phẩm nào</div>
        ) : (
          <div className={styles.productsGrid}>
          {pagedProducts.map((product) => (
            <Link key={product._id} href={`/products/${product._id}`} className={styles.productCard}>
              <img src={product.image || '/default-product.jpg'} alt={product.name} className={styles.productImage} />
              <div className={styles.productInfo}>
                <h2 className={styles.productName}>{product.name}</h2>
                <div className={styles.priceAndTags}>
                  <p className={styles.productPrice}>{product.price}</p>
                </div>
              </div>
            </Link>
          ))}
          </div>
        )}

        {maxPage > 0 && (
          <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Trước
          </button>
          {Array.from({ length: maxPage }).map((_, i) => (
            <button
              key={i}
              className={`${styles.pageBtn} ${page === i + 1 ? styles.activePageBtn : ""}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            disabled={page === maxPage}
          >
            Sau
          </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
