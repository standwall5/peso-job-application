// src/app/(user)/profile/hooks/useProfilePicture.ts
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PixelCrop, User } from "../types/profile.types";
import { getCroppedImg } from "../utils/image.utils";
import { ProfileApiService } from "../services/api.service";

export const useProfilePicture = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [dateNow, setDateNow] = useState<number>(Date.now());

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setSelectedFile(acceptedFiles[0]);
      setShowModal(true);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const onCropComplete = useCallback((_: unknown, area: PixelCrop) => {
    setCroppedAreaPixels(area);
  }, []);

  const handleCropAndUpload = async () => {
    if (!selectedFile || !croppedAreaPixels) return;

    setUploading(true);
    try {
      const imageUrl = URL.createObjectURL(selectedFile);
      const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
      URL.revokeObjectURL(imageUrl);

      const croppedFile = new File([croppedBlob], "profile.jpg", {
        type: "image/jpeg",
      });

      const result = await ProfileApiService.uploadProfilePic(croppedFile);

      if (result?.url) {
        const newTimestamp = Date.now();
        setDateNow(newTimestamp);
        setUser((prev) =>
          prev
            ? {
                ...prev,
                profile_pic_url: result.url + "?t=" + newTimestamp,
              }
            : null,
        );
      }
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
    } finally {
      setUploading(false);
      setShowModal(false);
      setSelectedFile(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  };

  return {
    showModal,
    setShowModal,
    selectedFile,
    crop,
    setCrop,
    zoom,
    setZoom,
    croppedAreaPixels,
    uploading,
    onCropComplete,
    handleCropAndUpload,
    getRootProps,
    getInputProps,
    isDragActive,
  };
};
