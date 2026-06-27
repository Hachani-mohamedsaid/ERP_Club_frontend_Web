import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

const STORAGE_PREFIX = "odin_player_photo_";

export function usePlayerPhoto() {
  const { user } = useAuth();
  const storageKey = STORAGE_PREFIX + (user?.email?.toLowerCase() ?? "default");

  const [photoUrl, setPhotoUrlState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(storageKey) ?? null;
    } catch {
      return null;
    }
  });

  const setPhoto = useCallback(
    (dataUrl: string | null) => {
      try {
        if (dataUrl) {
          localStorage.setItem(storageKey, dataUrl);
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch {
        // localStorage might be full
      }
      setPhotoUrlState(dataUrl);
    },
    [storageKey],
  );

  const handleFileChange = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPhoto(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [setPhoto],
  );

  return { photoUrl, setPhoto, handleFileChange };
}
