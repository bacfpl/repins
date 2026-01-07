import { NextRequest, NextResponse } from 'next/server';
import { getProductImages, getPrimaryProductImage } from '@/Service/ImageService';

/**
 * GET /api/admin/products/[id]/images
 * Lấy tất cả ảnh của sản phẩm
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = id;

    // Lấy tất cả ảnh
    const allImages = await getProductImages(productId);

    // Lấy ảnh chính
    const primaryImage = await getPrimaryProductImage(productId);

    return NextResponse.json(
      {
        success: true,
        data: {
          total: allImages.length,
          primary: primaryImage,
          all: allImages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Lỗi API lấy ảnh:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi lấy ảnh' },
      { status: 500 }
    );
  }
}
