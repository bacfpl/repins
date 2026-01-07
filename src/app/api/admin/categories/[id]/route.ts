import { NextRequest, NextResponse } from 'next/server';
import { updateCategory, deleteCategory } from '@/Service/AdminService';

// PUT - Cập nhật danh mục
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const category = await updateCategory(id, body);
    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    console.error('❌ PUT /api/admin/categories/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi cập nhật danh mục' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa danh mục
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteCategory(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: 'Đã xóa danh mục' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


