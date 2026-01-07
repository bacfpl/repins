import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/Service/AdminService';
import { deleteImageFromCloudinary } from '@/Service/CloudinaryService';

// GET - Lấy sản phẩm theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật sản phẩm
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Xóa ảnh cũ nếu có
    if (body.imagesToDelete && body.imagesToDelete.length > 0) {
      console.log('🗑️ Xóa ảnh:', body.imagesToDelete);
      for (const imageUrl of body.imagesToDelete) {
        try {
          await deleteImageFromCloudinary(imageUrl);
        } catch (error) {
          console.error('❌ Lỗi xóa ảnh:', error);
          // Tiếp tục xóa ảnh khác ngay cả nếu có lỗi
        }
      }
    }
    
    // Xóa imagesToDelete khỏi body trước khi update
    const { imagesToDelete, ...updateData } = body;
    
    const product = await updateProduct(id, updateData);
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Xóa sản phẩm
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteProduct(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: 'Đã xóa sản phẩm' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


