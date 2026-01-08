import { NextRequest, NextResponse } from 'next/server';
import { getAllBrands } from '@/Service/AdminService';
import { withRetry } from '@/DataBase/mongodb.connection';

// GET - Lấy tất cả hãng (public API)
export async function GET(request: NextRequest) {
  try {
    // Wrap the operation with retry logic for topology errors
    const brands = await withRetry(() => getAllBrands());
    return NextResponse.json({ success: true, data: brands });
  } catch (error: any) {
    console.error('❌ Lỗi khi lấy hãng:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

