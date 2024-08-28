// api/upload-logo.js

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import nextConnect from "next-connect";
import fs from "fs";
import path from "path";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({ dest: "/uploads" }); // Temp storage for Vercel functions

const apiRoute = nextConnect({
  onError(error, req, res) {
    res
      .status(501)
      .json({ error: `Sorry something happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single("file"));

apiRoute.post(async (req, res) => {
  const file = req.file;
  if (!file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${Date.now()}_${file.originalname}`, // Unique file name
    Body: fs.createReadStream(file.path),
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    const data = await s3Client.send(command);
    const location = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    res.status(200).json({ success: true, url: location });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ success: false, message: "Failed to upload file" });
  } finally {
    // Clean up the temporary file
    fs.unlink(file.path, (err) => {
      if (err) console.error("Error deleting temporary file:", err);
    });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing to use multer
  },
};
