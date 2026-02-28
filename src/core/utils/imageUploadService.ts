// src/core/utils/imageUploadService.ts

export const uploadImageToImgbb = async (file: File): Promise<string> => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  
  if (!apiKey) {
    throw new Error("Falta la API Key de Imgbb en el archivo .env");
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data.url; // Retorna la URL pública de la imagen
    } else {
      throw new Error(data.error?.message || "Error al subir a Imgbb");
    }
  } catch (error) {
    console.error("[Upload Service Error]:", error);
    throw error;
  }
};