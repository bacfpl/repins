import { NextRequest, NextResponse } from 'next/server';
import { 
  setPrimaryImage, 
  updateImageDisplayOrder, 
  updateImageAltText,
  deleteProductImage 
} from '@/Service/ImageService';

/**
 * GET /api/admin/products/images/[imageId]
 * Lấy thông tin ảnh
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;
    // TODO: Implement get image details
    return NextResponse.json(
      { error: 'Chưa implement' },
      { status: 501 }
    );
  } catch (error) {
    console.error('❌ Lỗi API get ảnh:', error);
    return NextResponse.json(
      { error: 'Lỗi lấy thông tin ảnh' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/products/images/[imageId]
 * Cập nhật ảnh (altText, displayOrder, setPrimary)
 * 
 * Body:
 * - altText?: string
 * - displayOrder?: number
 * - isPrimary?: boolean
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;
    const body = await request.json();

    const { altText, displayOrder, isPrimary } = body;

    // Đặt ảnh chính
    if (isPrimary === true) {
      const image = await setPrimaryImage(imageId);
      return NextResponse.json(
        {
          success: true,
          message: 'Đã đặt ảnh chính thành công',
          data: image,
        },
        { status: 200 }
      );
    }

    // Cập nhật thứ tự
    if (displayOrder !== undefined && displayOrder !== null) {
      const image = await updateImageDisplayOrder(imageId, displayOrder);
      return NextResponse.json(
        {
          success: true,
          message: 'Đã cập nhật thứ tự ảnh',
          data: image,
        },
        { status: 200 }
      );
    }

    // Cập nhật altText
    if (altText !== undefined && altText !== null) {
      const image = await updateImageAltText(imageId, altText);
      return NextResponse.json(
        {
          success: true,
          message: 'Đã cập nhật altText',
          data: image,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Không có gì để cập nhật' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Lỗi API cập nhật ảnh:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi cập nhật ảnh' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/images/[imageId]
 * Xóa một ảnh
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;
    const deleted = await deleteProductImage(imageId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Không tìm thấy ảnh' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Đã xóa ảnh thành công',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Lỗi API xóa ảnh:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi xóa ảnh' },
      { status: 500 }
    );
  }
}
