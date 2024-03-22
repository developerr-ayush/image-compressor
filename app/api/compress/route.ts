import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { join } from "path";
const credentials = {
  region: process.env.AWS_REGION || "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "YOUR_ACCESS_KEY_ID",
  secretAccessKey:
    process.env.AWS_SECRET_ACCESS_KEY || "YOUR_SECRET_ACCESS_KEY",
};

const s3Client = new S3Client(credentials);
export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get("image") as unknown as File;
  const folderName = data.get("folderName") as string;
  if (!file) {
    return NextResponse.json({
      success: false,
      message: "File not found",
      code: 404,
    });
  }

  const byte = await file.arrayBuffer();
  const buffer = Buffer.from(byte);
  let quality = 50;
  const path = "compressed_" + file.name;
  console.log(path, data);
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
    default:
      compressedImage = await sharp(buffer).toBuffer();
  }

  // converting buffer to image
  // const image = await sharp(buffer).toFile(join(__dirname, path));
  // console.log(image);
  // Initialize S3 instance with your AWS credentials

  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME || "ayva-hub", // Replace with your bucket name
      Key: "compress/" + path,
      Body: compressedImage,
    };
    const uploadResult = await s3Client.send(new PutObjectCommand(params));
    console.log(uploadResult);
    const updatedPathString = `https://${params.Bucket}.s3.${credentials.region}.amazonaws.com/${params.Key}`;
    console.log(uploadResult);
    return NextResponse.json({
      success: true,
      time: Date.now(),
      url: updatedPathString,
      data: {
        uploadResult: uploadResult,
        message: ["File uploaded successfully"],
        baseurl: "",
        files: [updatedPathString],
        isImage: [true],
        code: 220,
      },
    });
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to upload file to S3",
      code: 500,
    });
  }
}
