// api/upload-logo.js

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Configure S3 client with environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure multer to use /tmp as the storage directory for uploaded files
const upload = multer({
  dest: "/tmp",
  limits: { fileSize: 10 * 1024 * 1024 }, // Set file size limit to 10MB
});

module.exports = async (req, res) => {
  if (req.method === "POST") {
    // Use multer to handle file upload
    upload.single("file")(req, res, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Upload error" });
      }

      const file = req.file;

      // Check if a file was uploaded
      if (!file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      const outputPath = `/tmp/resized_${file.originalname}`;

      try {
        // Use sharp to resize/compress the image
        await sharp(file.path)
          .resize({ width: 800 }) // Resize to a width of 800px, maintain aspect ratio
          .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
          .toFile(outputPath); // Save the processed file

        // Define S3 upload parameters
        const uploadParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `${Date.now()}_resized_${file.originalname}`, // Unique file name
          Body: fs.createReadStream(outputPath),
          ContentType: "image/jpeg", // Set correct MIME type for the resized image
        };

        // Upload the resized/compressed image to S3
        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Generate the file URL from S3
        const location = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
        res.status(200).json({ success: true, url: location });
      } catch (err) {
        console.error("Error processing or uploading file:", err);
        res.status(500).json({
          success: false,
          message: "Failed to process or upload file",
        });
      } finally {
        // Cleanup: Delete the original and resized files
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting original file:", err);
        });
        fs.unlink(outputPath, (err) => {
          if (err) console.error("Error deleting resized file:", err);
        });
      }
    });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export const config = {
  api: {
    bodyParser: false, // Disable the default bodyParser for file uploads
  },
};
