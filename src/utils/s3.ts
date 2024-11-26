import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: File, folder: string): Promise<string> {
  try {
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Return just the file path, not the full URL
    return fileName;
  } catch (error) {
    console.error("Error in uploadToS3:", error);
    throw new Error("Failed to upload file to S3");
  }
}

export async function getSignedS3Url(key: string): Promise<string> {
  // If the key is already a full URL, extract just the path
  try {
    const urlPath = key.includes('https://') 
      ? new URL(key).pathname.slice(1) // Remove leading slash
      : key;

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: urlPath,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error("Error getting signed URL:", error);
    return ''; // Return empty string instead of throwing to handle gracefully
  }
}