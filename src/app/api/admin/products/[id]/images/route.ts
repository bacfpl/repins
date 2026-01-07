import { NextRequest, NextResponse } from 'next/server';
import { uploadPrimaryProductImage, uploadAdditionalProductImage, uploadMultipleImages, getProductImages, getPrimaryProductImage } from '@/Service/ImageService';

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

/**
 * POST /api/admin/products/[id]/images
 * Upload ảnh cho sản phẩm
 * 
 * Body (multipart/form-data):
 * - files: File[] - Mảng các file ảnh
 * - primaryImageIndex: number (optional) - Index của ảnh chính (mặc định 0)
 * - isPrimary: boolean[] (optional) - Mảng xác định ảnh chính/phụ cho mỗi file
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = id;
    const formData = await request.formData();
    
    // Lấy tất cả files
    const files = formData.getAll('files') as File[];
    const isPrimaryArray = formData.getAll('isPrimary') as string[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Không có ảnh nào được upload' },
        { status: 400 }
      );
    }

    // Chuyển Files thành Buffers
    const fileBuffers: Buffer[] = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      fileBuffers.push(buffer);
    }

    let uploadedImages;

    // Nếu chỉ có 1 ảnh
    if (files.length === 1) {
      const isPrimary = isPrimaryArray[0] === 'true' || isPrimaryArray.length === 0;
      
      if (isPrimary) {
        uploadedImages = [await uploadPrimaryProductImage(fileBuffers[0], productId)];
      } else {
        uploadedImages = [await uploadAdditionalProductImage(fileBuffers[0], productId)];
      }
    } else {
      // Nếu có nhiều ảnh
      // Tìm index của ảnh chính
      let primaryImageIndex = 0;
      for (let i = 0; i < isPrimaryArray.length; i++) {
        if (isPrimaryArray[i] === 'true') {
          primaryImageIndex = i;
          break;
        }
      }

      uploadedImages = await uploadMultipleImages(fileBuffers, productId, primaryImageIndex);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Đã upload ${uploadedImages.length} ảnh thành công`,
        data: uploadedImages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Lỗi API upload ảnh:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi upload ảnh' },
      { status: 500 }
    );
  }
}
