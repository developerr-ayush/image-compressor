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
  const data = await req.formData();

  if (!data.get("image[0]")) {
    return NextResponse.json({
      success: false,
      message: "No file found",
      code: 400,
    });
  }
  let totalImages = parseInt(data.get("totalImages") as string);
  let compressedFiles = [];
  for (let i = 0; i < totalImages; i++) {
    const file = data.get(`image[${i}]`) as File;
    const byte = await file.arrayBuffer();
    const buffer = Buffer.from(byte);
    let quality = 50;
    const path = "compressed_" + file.name;
    const format = file.type.split("/")[1];
    let compressedImage;
    switch (format) {
      case "jpeg":
        compressedImage = await sharp(buffer)
          .jpeg({ quality: quality })
          .toFile("/");
        break;
      case "png":
        // No direct quality adjustment in PNG, rely on compression level
        compressedImage = await sharp(buffer)
          .png({ quality: quality })
          .toFile("/"); // Adjust compression (1-9) based on quality
        break;
      case "gif":
        compressedImage = await sharp(buffer).gif().toFile("/");
        break;
      case "webp":
        compressedImage = await sharp(buffer).webp().toFile("/");
        break;
      default:
        compressedImage = await sharp(buffer).toFile("/");
    }
    console.log("compressedImage", compressedImage);
    compressedFiles.push(compressedImage);
  }

  //  compress files to zip
  console.log("compressedFiles", compressedFiles);
  const zip = new JSZip();
  console.log(zip);
  return NextResponse.json({
    success: true,
    message: "Images compressed successfully",
    data: compressedFiles,
  });
}
