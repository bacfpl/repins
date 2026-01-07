import { NextRequest, NextResponse } from 'next/server';
import { updateBrand, deleteBrand } from '@/Service/AdminService';

// PUT - Cập nhật thương hiệu
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const brand = await updateBrand(id, body);
    return NextResponse.json({ success: true, data: brand });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Xóa thương hiệu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteBrand(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thương hiệu' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: 'Đã xóa thương hiệu' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


