import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// configuration function
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
};

const uploadToCloudinary = async (fileBuffer, folder = "ConvoSpace") => {
  return new Promise((resolve, reject) => {
    configureCloudinary();

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
}

const deleteFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) return null;

    configureCloudinary();

    // Extract public_id from URL
    const parts = fileUrl.split("/");
    const fileName = parts.pop().split(".")[0]; // remove extension
    const folderPath = parts.slice(parts.indexOf("upload") + 1).join("/"); // path after "upload/"
    const publicId = `${folderPath}/${fileName}`;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image", // change to "auto" if you support video/audio/docs
    });

    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return null;
  }
};

export { uploadToCloudinary, deleteFromCloudinary };