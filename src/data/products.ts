export interface Product {
  id: number;
  name: string;
  price: string;
  priceValue: number;
  image: string;
  images?: string[];
  category: string;
  brand: string;
  vat?: string;
  ship?: string;
  description?: string;
  specifications?: { label: string; value: string }[];
}

const categories = ["Điện tử", "Thời trang", "Gia dụng", "Thể thao", "Sách"];
const brands = ["Brand A", "Brand B", "Brand C", "Brand D", "Brand E"];

export const products: Product[] = Array.from({ length: 32 }).map((_, i) => {
  const baseImageId = (i % 10) + 1;
  const images = Array.from({ length: 4 }).map((_, imgIndex) => 
    `https://picsum.photos/id/${baseImageId + imgIndex * 10}/400/300`
  );
  
  const priceValue = Math.random() * 2000000 + 500000; // 500k - 2.5M
  const priceFormatted = `${(priceValue / 1000).toFixed(0)}.000₫`;
  
  return {
    id: i + 1,
    name: `Sản phẩm ${i + 1}`,
    price: priceFormatted,
    priceValue: priceValue,
    image: images[0],
    images: images,
    category: categories[i % categories.length],
    brand: brands[i % brands.length],
    vat: i % 3 === 0 ? "VAT" : undefined,
    ship: i % 2 === 1 ? "SHIP" : undefined,
    description: `Đây là mô tả chi tiết cho ${`Sản phẩm ${i + 1}`}. Sản phẩm này được thiết kế với công nghệ hiện đại, đảm bảo chất lượng cao và hiệu suất tối ưu.`,
    specifications: [
      { label: "Thương hiệu", value: brands[i % brands.length] },
      { label: "Mã sản phẩm", value: `SP${String(i + 1).padStart(3, '0')}` },
      { label: "Trọng lượng", value: `${(Math.random() * 2 + 0.5).toFixed(2)} kg` },
      { label: "Kích thước", value: `${Math.floor(Math.random() * 20 + 10)} x ${Math.floor(Math.random() * 20 + 10)} x ${Math.floor(Math.random() * 10 + 5)} cm` },
    ],
  };
});

export { categories, brands };

export function getProductById(id: number): Product | undefined {
  return products.find(p => p.id === id);
}

