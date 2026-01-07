import { NextRequest, NextResponse } from 'next/server';
import { createBrand, getAllBrands, updateBrand, deleteBrand } from '@/Service/AdminService';

// GET - Lấy tất cả thương hiệu
export async function GET(request: NextRequest) {
  try {
    const brands = await getAllBrands();
    return NextResponse.json({ success: true, data: brands });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Tạo thương hiệu mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const brand = await createBrand(body);
    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


