// api/upload-logo.js

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Configure S3 client with environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure multer to use /tmp as the storage directory for uploaded files
const upload = multer({ dest: "/tmp" });

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

      // Define S3 upload parameters
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${Date.now()}_${file.originalname}`, // Generate a unique file name
        Body: fs.createReadStream(file.path),
        ContentType: file.mimetype,
      };

      try {
        // Upload the file to S3
        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Generate the file URL from S3
        const location = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
        res.status(200).json({ success: true, url: location });
      } catch (err) {
        console.error("Error uploading file:", err);
        res
          .status(500)
          .json({ success: false, message: "Failed to upload file" });
      } finally {
        // Delete the temporary file
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error("Error deleting temporary file:", err);
          } else {
            console.log(`Temporary file deleted: ${file.path}`);
          }
        });
      }
    });
  } else {
    // Respond with 405 if the method is not POST
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export const config = {
  api: {
    bodyParser: false, // Disable the default bodyParser for file uploads
  },
};
