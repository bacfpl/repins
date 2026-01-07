import { NextRequest, NextResponse } from 'next/server';
import { uploadMultipleImages } from '@/Service/ImageService';

/**
 * Upload ảnh cho sản phẩm với đường dẫn products/{productId}
 * LƯU Ý: Route này lưu vào cả Cloudinary và MongoDB
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = id;
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không có file được upload' },
        { status: 400 }
      );
    }

    // Chuyển Files thành Buffers
    const buffers = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        return Buffer.from(bytes);
      })
    );

    // Upload lên Cloudinary và lưu vào MongoDB
    const uploadedImages = await uploadMultipleImages(buffers, productId, 0);

    // Trả về dữ liệu đầy đủ
    const imageData = uploadedImages.map((img) => ({
      _id: img._id,
      url: img.imageUrl,
      public_id: img.cloudinaryPublicId,
      path: `products/${productId}`,
      width: img.width,
      height: img.height,
      isPrimary: img.isPrimary,
      displayOrder: img.displayOrder,
    }));

    return NextResponse.json({
      success: true,
      data: imageData,
      message: `Đã upload ${uploadedImages.length} ảnh vào products/${productId} và lưu vào database`,
    });
  } catch (error: any) {
    console.error('❌ Lỗi khi upload ảnh:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi upload ảnh' },
      { status: 500 }
    );
  }
}


