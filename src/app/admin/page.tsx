'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Product {
  _id: string;
  name: string;
  sku: string;
  priceValue: number;
  price: string;
  categoryId: string;
  brandId: string;
  description?: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface Brand {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'brands'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
    // Load categories and brands for product form
    if (activeTab === 'products') {
      loadCategoriesAndBrands();
    }
  }, [activeTab]);

  const loadCategoriesAndBrands = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/brands'),
      ]);
      const catData = await catRes.json();
      const brandData = await brandRes.json();
      if (catData.success) setCategories(catData.data);
      if (brandData.success) setBrands(brandData.data);
    } catch (error) {
      console.error('Lỗi khi tải categories/brands:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const res = await fetch('/api/admin/products');
        const data = await res.json();
        if (data.success) setProducts(data.data);
      } else if (activeTab === 'categories') {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } else if (activeTab === 'brands') {
        const res = await fetch('/api/admin/brands');
        const data = await res.json();
        if (data.success) setBrands(data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: 'products' | 'categories' | 'brands') => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;

    try {
      const res = await fetch(`/api/admin/${type}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadData();
        alert('Đã xóa thành công!');
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('Lỗi khi xóa');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Trang Quản Trị</h1>
        <p>Quản lý sản phẩm, danh mục và thương hiệu</p>
      </header>

      <div className={styles.tabs}>
        <button
          className={activeTab === 'products' ? styles.activeTab : ''}
          onClick={() => setActiveTab('products')}
        >
          Sản Phẩm
        </button>
        <button
          className={activeTab === 'categories' ? styles.activeTab : ''}
          onClick={() => setActiveTab('categories')}
        >
          Danh Mục
        </button>
        <button
          className={activeTab === 'brands' ? styles.activeTab : ''}
          onClick={() => setActiveTab('brands')}
        >
          Thương Hiệu
        </button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Đang tải...</div>
        ) : (
          <>
            {activeTab === 'products' && (
              <ProductsTab
                products={products}
                categories={categories}
                brands={brands}
                onReload={loadData}
                onDelete={handleDelete}
              />
            )}
            {activeTab === 'categories' && (
              <CategoriesTab
                categories={categories}
                onReload={loadData}
                onDelete={handleDelete}
              />
            )}
            {activeTab === 'brands' && (
              <BrandsTab
                brands={brands}
                onReload={loadData}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Products Tab Component
function ProductsTab({ products, categories, brands, onReload, onDelete }: any) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]); // Track images to delete
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null); // Files to upload on submit
  const [pendingPreviewUrls, setPendingPreviewUrls] = useState<string[]>([]); // Preview URLs cho pending files
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string | null>(null); // URL của ảnh chính
  const [formData, setFormData] = useState<any>({
    name: '',
    sku: '',
    priceValue: 0,
    price: '',
    categoryId: '',
    brandId: '',
    description: '',
    stock: 0,
    isActive: true,
    isFeatured: false,
    image: '',
    images: [],
  });

  const handleImageUpload = async (files: FileList, productId: string): Promise<string[]> => {
    if (!files || files.length === 0) return [];

    // Chỉ lưu files vào state, không upload ngay
    // Upload sẽ thực hiện khi ấn "Cập nhật"
    setPendingFiles(files);
    alert(`📁 Đã chọn ${files.length} ảnh. Sẽ upload khi ấn "Cập nhật"`);
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let productId = editing?._id;
      let finalImageUrls = uploadedImages.length > 0 ? uploadedImages : (formData.images || []);

      // Nếu đang tạo mới, cần tạo product trước để có _id
      if (!editing) {
        // Tạo product mới trước (chưa có ảnh)
        const createRes = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            image: '',
            images: [],
          }),
        });

        const createData = await createRes.json();
        if (!createData.success) {
          alert('Lỗi: ' + createData.error);
          return;
        }

        productId = createData.data._id;

        // Upload pending ảnh sau khi có productId
        if (pendingFiles && pendingFiles.length > 0) {
          setUploading(true);
          try {
            const formDataUpload = new FormData();
            Array.from(pendingFiles).forEach((file) => {
              formDataUpload.append('files', file);
            });

            const res = await fetch(`/api/admin/products/${productId}/upload`, {
              method: 'POST',
              body: formDataUpload,
            });

            const data = await res.json();
            if (data.success) {
              const imageUrls = data.data.map((item: any) => item.url);
              finalImageUrls = imageUrls;
            } else {
              alert('Lỗi upload: ' + data.error);
              return;
            }
          } catch (error) {
            alert('Lỗi khi upload ảnh');
            return;
          } finally {
            setUploading(false);
          }
        }

        // Cập nhật lại product với URL ảnh
        if (finalImageUrls.length > 0) {
          const updateRes = await fetch(`/api/admin/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: finalImageUrls[0],
              images: finalImageUrls,
            }),
          });
          await updateRes.json();
        }
      } else {
        // Cập nhật product
        // Upload pending ảnh nếu có
        if (pendingFiles && pendingFiles.length > 0) {
          setUploading(true);
          try {
            const formDataUpload = new FormData();
            Array.from(pendingFiles).forEach((file) => {
              formDataUpload.append('files', file);
            });

            const res = await fetch(`/api/admin/products/${editing._id}/upload`, {
              method: 'POST',
              body: formDataUpload,
            });

            const data = await res.json();
            if (data.success) {
              const imageUrls = data.data.map((item: any) => item.url);
              finalImageUrls = [...uploadedImages.filter(img => !imagesToDelete.includes(img)), ...imageUrls];
            } else {
              alert('Lỗi upload: ' + data.error);
              return;
            }
          } catch (error) {
            alert('Lỗi khi upload ảnh');
            return;
          } finally {
            setUploading(false);
          }
        } else {
          // Nếu không upload ảnh mới, vẫn filter ảnh cần xóa
          finalImageUrls = uploadedImages.filter(img => !imagesToDelete.includes(img));
        }

        const url = `/api/admin/products/${editing._id}`;
        const updateData = {
          ...formData,
          image: primaryImageUrl || finalImageUrls[0] || formData.image,
          images: finalImageUrls.length > 0 ? finalImageUrls : formData.images,
          imagesToDelete: imagesToDelete, // Send images to delete
        };

        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        const data = await res.json();
        if (!data.success) {
          alert('Lỗi: ' + data.error);
          return;
        }
      }

      alert(editing ? 'Cập nhật thành công!' : 'Tạo thành công!');
      setShowForm(false);
      setEditing(null);
      setUploadedImages([]);
      setPendingFiles(null);
      setPendingPreviewUrls([]);
      setImagesToDelete([]);
      setPrimaryImageUrl(null);
      setFormData({
        name: '',
        sku: '',
        priceValue: 0,
        price: '',
        categoryId: '',
        brandId: '',
        description: '',
        stock: 0,
        isActive: true,
        isFeatured: false,
        image: '',
        images: [],
      });
      onReload();
    } catch (error) {
      alert('Lỗi khi lưu');
    }
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      priceValue: product.priceValue,
      price: product.price,
      categoryId: product.categoryId,
      brandId: product.brandId,
      description: product.description || '',
      stock: product.stock,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      image: (product as any).image || '',
      images: (product as any).images || [],
    });
    setUploadedImages((product as any).images || [(product as any).image || '']);
    setPrimaryImageUrl((product as any).image || ((product as any).images && (product as any).images[0]) || null);
    setImagesToDelete([]); // Reset images to delete
    setShowForm(true);
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.toolbar}>
        <button className={styles.addButton} onClick={() => {
          setEditing(null);
          setUploadedImages([]);
          setImagesToDelete([]);
          setPendingFiles(null);
          setPendingPreviewUrls([]);
          setPrimaryImageUrl(null);
          setFormData({
            name: '',
            sku: '',
            priceValue: 0,
            price: '',
            categoryId: '',
            brandId: '',
            description: '',
            stock: 0,
            isActive: true,
            isFeatured: false,
            image: '',
            images: [],
          });
          setShowForm(true);
        }}>
          + Thêm Sản Phẩm
        </button>
      </div>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editing ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>SKU *</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Giá trị (VND) *</label>
                  <input
                    type="number"
                    required
                    value={isNaN(formData.priceValue) ? 0 : formData.priceValue}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      const numValue = isNaN(value) ? 0 : value;
                      setFormData({
                        ...formData,
                        priceValue: numValue,
                        price: `${(numValue / 1000).toFixed(0)}.000₫`,
                      });
                    }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Giá hiển thị</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Danh mục *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat: Category) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Thương hiệu *</label>
                  <select
                    required
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands.map((brand: Brand) => (
                      <option key={brand._id} value={brand._id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Upload ảnh sản phẩm</label>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setPendingFiles(e.target.files);
                      // Tạo preview URLs
                      const urls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
                      setPendingPreviewUrls(urls);
                      alert(`📁 Đã chọn ${e.target.files.length} ảnh. Sẽ upload khi ấn "Cập nhật"`);
                    }
                  }}
                />
                {!editing && (
                  <p className={styles.helpText}>
                    💡 Ảnh sẽ được upload vào <strong>products/&#123;productId&#125;</strong> sau khi tạo sản phẩm
                  </p>
                )}
                {editing && (
                  <p className={styles.helpText}>
                    📁 Đường dẫn: <strong>products/{editing._id}</strong>
                  </p>
                )}
                {uploading && <p className={styles.uploadingText}>⏳ Đang upload ảnh lên Cloudinary...</p>}
                {pendingPreviewUrls.length > 0 && (
                  <div className={styles.imagePreview}>
                    <p>📸 Ảnh chờ upload ({pendingPreviewUrls.length} ảnh):</p>
                    <div className={styles.imageGrid}>
                      {pendingPreviewUrls.map((url, index) => (
                        <div key={`pending-${index}`} className={styles.imageContainer}>
                          <img src={url} alt={`Pending ${index + 1}`} className={styles.previewImage} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {uploadedImages.length > 0 && (
                  <div className={styles.imagePreview}>
                    <p>✅ Ảnh đã upload ({uploadedImages.length} ảnh): <span className={styles.hint}>Nhấp vào ảnh để chọn làm ảnh chính ⭐</span></p>
                    <div className={styles.imageGrid}>
                      {uploadedImages.map((url, index) => (
                        <div key={index} className={styles.imageContainer}>
                          <img 
                            src={url} 
                            alt={`Preview ${index + 1}`} 
                            className={`${styles.previewImage} ${primaryImageUrl === url ? styles.primaryImage : ''}`}
                            onClick={() => setPrimaryImageUrl(url)}
                            style={{ cursor: 'pointer' }}
                          />
                          {primaryImageUrl === url && (
                            <div className={styles.primaryBadge}>⭐</div>
                          )}
                          <button
                            type="button"
                            className={styles.deleteImageBtn}
                            onClick={() => {
                              setImagesToDelete([...imagesToDelete, url]);
                              setUploadedImages(uploadedImages.filter(img => img !== url));
                              if (primaryImageUrl === url) {
                                setPrimaryImageUrl(null);
                              }
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {formData.image && !uploadedImages.includes(formData.image) && (
                  <div className={styles.imagePreview}>
                    <p>Ảnh hiện tại:</p>
                    <img src={formData.image} alt="Current" className={styles.previewImage} />
                  </div>
                )}
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Tồn kho</label>
                  <input
                    type="number"
                    value={isNaN(formData.stock) ? 0 : formData.stock}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                      const numValue = isNaN(value) ? 0 : value;
                      setFormData({ ...formData, stock: numValue });
                    }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    Đang hoạt động
                  </label>
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured ?? false}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    Sản phẩm nổi bật
                  </label>
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>
                  {editing ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setUploadedImages([]);
                  setImagesToDelete([]);
                  setPendingFiles(null);
                  setPendingPreviewUrls([]);
                  setPrimaryImageUrl(null);
                }} className={styles.cancelButton}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: Product) => (
              <tr key={product._id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <span className={product.isActive ? styles.active : styles.inactive}>
                    {product.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(product)} className={styles.editButton}>
                    Sửa
                  </button>
                  <button onClick={() => onDelete(product._id, 'products')} className={styles.deleteButton}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Categories Tab Component
function CategoriesTab({ categories, onReload, onDelete }: any) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing
        ? `/api/admin/categories/${editing._id}`
        : '/api/admin/categories';
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert(editing ? 'Cập nhật thành công!' : 'Tạo thành công!');
        setShowForm(false);
        setEditing(null);
        setFormData({ name: '', description: '', isActive: true });
        onReload();
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('Lỗi khi lưu');
    }
  };

  const handleEdit = (category: Category) => {
    setEditing(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
    });
    setShowForm(true);
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.toolbar}>
        <button className={styles.addButton} onClick={() => {
          setEditing(null);
          setFormData({ name: '', description: '', isActive: true });
          setShowForm(true);
        }}>
          + Thêm Danh Mục
        </button>
      </div>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editing ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Tên danh mục *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Đang hoạt động
                </label>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>
                  {editing ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }} className={styles.cancelButton}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category: Category) => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>{category.description || '-'}</td>
                <td>
                  <span className={category.isActive ? styles.active : styles.inactive}>
                    {category.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(category)} className={styles.editButton}>
                    Sửa
                  </button>
                  <button onClick={() => onDelete(category._id, 'categories')} className={styles.deleteButton}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Brands Tab Component
function BrandsTab({ brands, onReload, onDelete }: any) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing
        ? `/api/admin/brands/${editing._id}`
        : '/api/admin/brands';
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert(editing ? 'Cập nhật thành công!' : 'Tạo thành công!');
        setShowForm(false);
        setEditing(null);
        setFormData({ name: '', description: '', isActive: true });
        onReload();
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('Lỗi khi lưu');
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditing(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      isActive: brand.isActive,
    });
    setShowForm(true);
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.toolbar}>
        <button className={styles.addButton} onClick={() => {
          setEditing(null);
          setFormData({ name: '', description: '', isActive: true });
          setShowForm(true);
        }}>
          + Thêm Thương Hiệu
        </button>
      </div>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editing ? 'Sửa Thương Hiệu' : 'Thêm Thương Hiệu'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Tên thương hiệu *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Đang hoạt động
                </label>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>
                  {editing ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }} className={styles.cancelButton}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand: Brand) => (
              <tr key={brand._id}>
                <td>{brand.name}</td>
                <td>{brand.description || '-'}</td>
                <td>
                  <span className={brand.isActive ? styles.active : styles.inactive}>
                    {brand.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(brand)} className={styles.editButton}>
                    Sửa
                  </button>
                  <button onClick={() => onDelete(brand._id, 'brands')} className={styles.deleteButton}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

