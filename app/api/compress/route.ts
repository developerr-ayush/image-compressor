import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { join } from "path";
import JSZip from "jszip";
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
};

const client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: credentials,
});
export async function POST(req: NextRequest) {
  const zip = JSZip();
  const data = await req.formData();

  if (!data.get("image[0]")) {
    return NextResponse.json({
      success: false,
      message: "No file found",
      code: 400,
    });
  }
  let totalImages = parseInt(data.get("totalImages") as string);
  let compressedImages = [];

  for (let i = 0; i < totalImages; i++) {
    const file = data.get(`image[${i}]`) as File;
    const byte = await file.arrayBuffer();
    const buffer = Buffer.from(byte);
    let quality = 70;
    const path = "compressed_" + file.name;
    const format = file.type.split("/")[1];
    let compressedImage;
    switch (format) {
      case "jpeg":
        compressedImage = await sharp(buffer)
          .jpeg({ quality: quality })
          .toBuffer();
        break;
      case "png":
        // No direct quality adjustment in PNG, rely on compression level
        compressedImage = await sharp(buffer)
          .png({ quality: quality })
          .toBuffer(); // Adjust compression (1-9) based on quality
        break;
      case "gif":
        compressedImage = await sharp(buffer).gif().toBuffer();
        break;
      case "webp":
        compressedImage = await sharp(buffer).webp().toBuffer();
        break;
      default:
        compressedImage = await sharp(buffer).toBuffer();
    }
    const fileSize = compressedImage.length;
    zip.file(path, compressedImage);
    try {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME || "ayva-hub", // Replace with your bucket name
        Key: "compress/" + path,
        Body: compressedImage,
      };
      const uploadResult = await client.send(new PutObjectCommand(params));
      const updatedPathString = `https://${params.Bucket}.s3.ap-south-1.amazonaws.com/${params.Key}`;
      compressedImages.push({
        success: true,
        time: Date.now(),
        url: updatedPathString,
        initialData: {
          name: file.name,
          size: file.size,
        },
        compressedData: {
          name: path,
          size: fileSize,
        },
      });
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      compressedImages.push({
        success: false,
        message: "Failed to upload file to S3",
        code: 500,
      });
    }
  }
  // handling zip
  const zipped = await zip.generateAsync({ type: "nodebuffer" });
  const zipName = `compressed_images${Date.now()}.zip`;
  const zipPath = join(process.cwd(), zipName);

  const zipParams = {
    Bucket: process.env.AWS_BUCKET_NAME || "ayva-hub", // Replace with your bucket name
    Key: "compress/zip/" + zipName,
    Body: zipped,
  };
  const uploadZip = await client.send(new PutObjectCommand(zipParams));
  const updatedZipPath = `https://${zipParams.Bucket}.s3.ap-south-1.amazonaws.com/${zipParams.Key}`;
  return NextResponse.json({
    success: true,
    message: "Images compressed successfully",
    zip: updatedZipPath,
    data: compressedImages,
  });
}
