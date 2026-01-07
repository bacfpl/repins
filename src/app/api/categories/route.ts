import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories } from '@/Service/AdminService';

// GET - Lấy tất cả danh mục (public API)
export async function GET(request: NextRequest) {
  try {
    const categories = await getAllCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('❌ Lỗi khi lấy danh mục:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
