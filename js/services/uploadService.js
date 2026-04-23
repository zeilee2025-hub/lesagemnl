// ==========================
// 📦 UPLOAD SERVICE (FINAL FIXED)
// ==========================

const CLOUD_NAME = "dvgzb9dld"; // ✅ FIXED
const UPLOAD_PRESET = "proof_unsigned";

export async function uploadProof(file, orderId) {
  try {
    if (!file) throw new Error("No file selected");
    if (!orderId) throw new Error("Missing order ID");

    console.log("🚀 Uploading to Cloudinary:", {
      cloud: CLOUD_NAME,
      preset: UPLOAD_PRESET,
      fileName: file.name,
      orderId
    });

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", `proofs/${orderId}`);

    const response = await fetch(url, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Cloudinary FULL error:", data);
      throw new Error(data.error?.message || "Upload failed");
    }

    console.log("✅ Uploaded proof URL:", data.secure_url);

    return data.secure_url;

  } catch (error) {
    console.error("❌ Upload error:", error);
    throw error;
  }
}