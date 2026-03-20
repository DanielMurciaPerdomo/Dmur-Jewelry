import { useState, useEffect, useRef, useCallback } from "react";
import type { ProductImage } from "../../types/joya.types";
import {
  uploadProductImage,
  setPrimaryImage,
  deleteProductImage,
} from "../../services/imagenesService";
import { Spinner } from "../ui/Spinner";

interface ImageUploaderProps {
  productId: string;
  existingImages: ProductImage[];
  onImagesChange: (images: ProductImage[] | ((prev: ProductImage[]) => ProductImage[])) => void;
}

interface UploadItem {
  id: string;
  previewUrl: string;
  fileName: string;
  status: "uploading" | "done";
}

export const ImageUploader = ({
  productId,
  existingImages,
  onImagesChange,
}: ImageUploaderProps) => {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const previewUrlsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUploads: UploadItem[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`El archivo ${file.name} supera el límite de 5MB.`);
        continue;
      }

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError(`El archivo ${file.name} tiene un formato no permitido.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const uploadId = `upload-${Date.now()}-${Math.random()}`;
      previewUrlsRef.current.set(uploadId, previewUrl);

      const newUpload: UploadItem = {
        id: uploadId,
        previewUrl,
        fileName: file.name,
        status: "uploading",
      };

      newUploads.push(newUpload);
      setUploads((prev) => [...prev, newUpload]);

      uploadSingleImage(uploadId, file);
    }

    e.target.value = "";
  };

  const uploadSingleImage = async (uploadId: string, file: File) => {
    try {
      const uploadedImage = await uploadProductImage(productId, file);

      const previewUrl = previewUrlsRef.current.get(uploadId);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrlsRef.current.delete(uploadId);
      }

      setUploads((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, status: "done" as const } : u))
      );

      onImagesChange((prev) => [...prev, uploadedImage]);

      setTimeout(() => {
        setUploads((prev) => prev.filter((u) => u.id !== uploadId));
      }, 1000);
    } catch (err) {
      const previewUrl = previewUrlsRef.current.get(uploadId);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrlsRef.current.delete(uploadId);
      }

      setUploads((prev) => prev.filter((u) => u.id !== uploadId));

      setError(err instanceof Error ? err.message : "Error al subir la imagen.");
    }
  };

  const handleRemoveUpload = (uploadId: string) => {
    const previewUrl = previewUrlsRef.current.get(uploadId);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrlsRef.current.delete(uploadId);
    }
    setUploads((prev) => prev.filter((u) => u.id !== uploadId));
  };

  const handleSetPrimary = useCallback(
    async (imageId: string) => {
      try {
        await setPrimaryImage(productId, imageId);

        onImagesChange((prev) =>
          prev.map((img) =>
            img.id === imageId ? { ...img, is_primary: true } : { ...img, is_primary: false }
          )
        );
      } catch (err) {
        setError("Error al establecer la imagen principal.");
      }
    },
    [onImagesChange, productId]
  );

  const handleDelete = useCallback(
    async (image: ProductImage) => {
      if (!window.confirm("¿Estás seguro de que quieres eliminar esta imagen?")) return;

      try {
        await deleteProductImage(image);
        onImagesChange((prev) => prev.filter((img) => img.id !== image.id));
      } catch (err) {
        setError("Error al eliminar la imagen.");
      }
    },
    [onImagesChange]
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-2">
          Imágenes del Producto
        </label>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="block w-full text-sm text-metallic-gold-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-metallic-gold-100 file:text-metallic-gold-700 hover:file:bg-metallic-gold-200 dark:file:bg-ocean-mist-800 dark:file:text-ocean-mist-200 dark:hover:file:bg-ocean-mist-700"
        />
        <p className="mt-1 text-xs text-metallic-gold-500 dark:text-ocean-mist-400">
          JPG, PNG, WebP. Máximo 5MB por imagen.
        </p>
      </div>

      {error && (
        <div className="text-red-500 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs hover:underline">
            Cerrar
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {existingImages.map((image) => (
          <div key={image.id} className="relative group">
            <img
              src={image.public_url || ""}
              alt="Imagen de producto"
              loading="lazy"
              className="w-full h-32 object-cover rounded-md"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center space-x-2">
              {!image.is_primary && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(image.id)}
                  className="text-white text-xs bg-metallic-gold-600 px-2 py-1 rounded hover:bg-metallic-gold-700"
                  title="Establecer como principal"
                >
                  Principal
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(image)}
                className="text-white text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                title="Eliminar"
              >
                Borrar
              </button>
            </div>
            {image.is_primary && (
              <div className="absolute top-1 left-1 bg-metallic-gold-600 text-white text-xs px-1 rounded">
                Principal
              </div>
            )}
          </div>
        ))}

        {uploads.map((upload) => (
          <div key={upload.id} className="relative">
            <img
              src={upload.previewUrl}
              alt={upload.fileName}
              className={`w-full h-32 object-cover rounded-md ${upload.status === "uploading" ? "opacity-50" : ""}`}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex flex-col items-center justify-center">
              {upload.status === "uploading" ? (
                <>
                  <Spinner />
                  <span className="mt-2 text-xs text-white">Subiendo...</span>
                  <button
                    onClick={() => handleRemoveUpload(upload.id)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 rounded hover:bg-red-700"
                    title="Cancelar"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <span className="text-green-400 text-xs">✓ Subida</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
