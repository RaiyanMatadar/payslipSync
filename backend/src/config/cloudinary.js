// backend/src/config/cloudinary.js
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a memory buffer to Cloudinary or falls back to data URL
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Destination folder on Cloudinary
 * @param {string} [mimetype="image/png"] - File mime type for fallback
 * @returns {Promise<string>} Public URL of uploaded asset
 */
const uploadBufferToCloudinary = (buffer, folder = "payroll_system", mimetype = "image/png") => {
  return new Promise((resolve, reject) => {
    if (!isConfigured) {
      console.warn("Cloudinary credentials not provided. Falling back to data URI.");
      const base64 = buffer.toString("base64");
      return resolve(`data:${mimetype};base64,${base64}`);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          // Fallback to data URI rather than failing hard
          const base64 = buffer.toString("base64");
          return resolve(`data:${mimetype};base64,${base64}`);
        }
        resolve(result.secure_url || result.url);
      }
    );

    // Stream the buffer into the uploader
    const { Readable } = require("stream");
    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured: isConfigured,
  uploadBufferToCloudinary,
};
