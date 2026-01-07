import { NextRequest, NextResponse } from 'next/server';
import { createProduct, getAllProducts, updateProduct, deleteProduct, getProductById } from '@/Service/AdminService';

// GET - Lấy tất cả sản phẩm
export async function GET(request: NextRequest) {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Tạo sản phẩm mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await createProduct(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


