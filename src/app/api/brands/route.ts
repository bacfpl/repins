import { NextRequest, NextResponse } from 'next/server';
import { getAllBrands } from '@/Service/AdminService';

// GET - Lấy tất cả hãng (public API)
export async function GET(request: NextRequest) {
  try {
    const brands = await getAllBrands();
    return NextResponse.json({ success: true, data: brands });
  } catch (error: any) {
    console.error('❌ Lỗi khi lấy hãng:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
