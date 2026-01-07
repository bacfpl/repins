import { NextRequest, NextResponse } from 'next/server';
import { uploadProductImage } from '@/Service/CloudinaryService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Không có file được upload' },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu productId' },
        { status: 400 }
      );
    }

    // Chuyển File thành Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload lên Cloudinary với đường dẫn products/{productId}
    const result = await uploadProductImage(buffer, productId, {
      folder: `products/${productId}`,
      transformation: {
        width: 1200,
        height: 1200,
        crop: 'limit',
        quality: 'auto',
        format: 'auto',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        path: `products/${productId}`,
      },
    });
  } catch (error: any) {
    console.error('Lỗi khi upload:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi upload ảnh' },
      { status: 500 }
    );
  }
}


