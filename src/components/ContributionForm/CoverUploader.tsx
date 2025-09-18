// components/CoverUploader.tsx
import React, { useEffect, useState } from "react";
import Cropper from "react-easy-crop";

interface CoverUploaderProps {
  value?: string | null;
  onChange: (url: string, file?: File) => void;
}

// Kích thước cố định theo yêu cầu
const ASPECT = 16 / 9;

// Output lớn hơn để ảnh không bị mờ (ví dụ 1280x720)
const OUTPUT_WIDTH = 1280;
const OUTPUT_HEIGHT = 720;

const PREVIEW_WIDTH = 500;
const PREVIEW_HEIGHT = 281;

const CoverUploader: React.FC<CoverUploaderProps> = ({ value, onChange }) => {
  const [openCrop, setOpenCrop] = useState(false);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    if (value) setImageURL(value);
  }, [value]);

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawFile(file);
    setImageURL(URL.createObjectURL(file));
    setOpenCrop(true);
  };

  const onCropComplete = (_: any, areaPixels: any) => setCroppedAreaPixels(areaPixels);

  // Xuất ảnh cắt đúng 500x455
  const getCroppedBlob = async (): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageURL!;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = OUTPUT_WIDTH;
        canvas.height = OUTPUT_HEIGHT;
        const ctx = canvas.getContext("2d")!;

        const sx = croppedAreaPixels.x;
        const sy = croppedAreaPixels.y;
        const sw = croppedAreaPixels.width;
        const sh = croppedAreaPixels.height;

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.9);
      };
    });
  };

  const onConfirmCrop = async () => {
    if (!rawFile || !croppedAreaPixels || !imageURL) return;
    const blob = await getCroppedBlob();
    const file = new File([blob], rawFile.name.replace(/\.[^.]+$/, ".jpg"), {
      type: "image/jpeg",
    });

    const tempUrl = URL.createObjectURL(file);
    onChange(tempUrl, file);
    setOpenCrop(false);
  };

  return (
    <div className="w-full">
      
      {/* Khung giữa, kích thước cố định 500x455 */}
     <div className="w-full flex justify-center">
        <div
          className="relative rounded-2xl shadow overflow-hidden group"
          style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
        >
          {value ? (
            <>
              <img
                src={value}
                alt="cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* overlay chiếm full khung, hover vào BẤT KỲ đâu trong ảnh đều hiện nút */}
              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/40 flex items-center justify-center gap-2">
                <button
                  onClick={() => setOpenCrop(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white px-3 py-2 rounded-lg shadow"
                >
                  Crop lại
                </button>
                <label className="opacity-0 group-hover:opacity-100 transition-opacity bg-white px-3 py-2 rounded-lg shadow cursor-pointer">
                  Đổi ảnh
                  <input type="file" accept="image/*" className="hidden" onChange={onSelect} />
                </label>
              </div>
            </>
          ) : (
            <label className="absolute inset-0 border-2 border-dashed rounded-2xl cursor-pointer bg-gray-50 flex items-center justify-center">
              <span className="text-gray-600">Chọn ảnh bìa…</span>
              <input type="file" accept="image/*" className="hidden" onChange={onSelect} />
            </label>
          )}
        </div>
      </div>


      {openCrop && imageURL && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
            <div
              className="relative mx-auto"
              style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
            >
              <Cropper
                image={imageURL}
                crop={crop}
                zoom={zoom}
                aspect={ASPECT}
                cropSize={{width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT}}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                objectFit="cover"
              />
            </div>

            <div className="flex items-center justify-between p-4 border-t">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg" onClick={() => setOpenCrop(false)}>
                  Huỷ
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-yellow-700 to-red-700 hover:brightness-110"
                  onClick={onConfirmCrop}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverUploader;
