import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/Service/AdminService';
import { withRetry } from '@/DataBase/mongodb.connection';

// GET - Lấy tất cả sản phẩm (public API)
export async function GET(request: NextRequest) {
  try {
    const products = await withRetry(() => getAllProducts());
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.error('❌ Lỗi khi lấy sản phẩm:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
