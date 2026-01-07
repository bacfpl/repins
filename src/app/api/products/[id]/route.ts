import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/Service/AdminService';

// GET - Lấy sản phẩm theo ID (public API)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Sản phẩm không tìm thấy' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error('❌ Lỗi khi lấy sản phẩm:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
