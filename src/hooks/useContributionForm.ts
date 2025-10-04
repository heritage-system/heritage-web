// hooks/useContributionForm.ts
import { useState, useMemo, useRef, useEffect } from "react";
import toast from 'react-hot-toast';
import { isBlobUrl, deepClone } from "../utils/imageUtils";
import { uploadImage } from "../services/uploadService";
import { postContribution, getContributionDetail,getContributionDetailForUpdated, updateContribution } from "../services/contributionService";
import { ContributionCreateRequest,ContributionUpdateRequest } from "../types/contribution";
import { searchHeritageNames } from "../services/heritageService";
import { isContributorPremiumEligible } from "../services/contributorService";
import { htmlFromDeltaWithImgAlign } from "../utils/deltaUtils";
import { ContributionPremiumTypes } from "../types/enum";
import { HeritageName } from "../types/heritage";
async function uploadToCloudinary(file: File): Promise<string> {
  console.log("Uploading to Cloudinary:", file.name);

  try {
    // Thay thế bằng service thực tế của bạn
    const response = await uploadImage(file);

    if (response?.code === 200 && response.result) {
      return response.result;
    }

    toast.error("Lưu ảnh thất bại!", {
      duration: 5000,
      position: "top-right",
      style: { background: "#DC2626", color: "#fff" },
      iconTheme: { primary: "#fff", secondary: "#DC2626" },
    });

    return "";
  } catch (error) {
    console.error("Upload error:", error);
    toast.error("Lỗi khi upload ảnh!", {
      duration: 5000,
      position: "top-right",
      style: { background: "#DC2626", color: "#fff" },
    });
    return "";
  }
}

export const useContributionForm = (contributionId?: number) => {
  const [title, setTitle] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [html, setHtml] = useState("");
  const [delta, setDelta] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [blobMap, setBlobMap] = useState<Map<string, { file: File; hash: string }>>(new Map());
  const [selectedHeritages, setSelectedHeritages] = useState<HeritageName[]>([]);
  const [premiumType, setPremiumType] = useState<ContributionPremiumTypes>(ContributionPremiumTypes.FREE);
  const [submitted, setSubmitted] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [allHeritages, setAllHeritages] = useState<HeritageName[]>([]);
  const [initialContribution, setInitialContribution] = useState<any>(null);
  const [isPremiumEligible, setPremiumEligible] = useState(false);
  const [loading, setLoading] = useState(false);
  const hashToBlobUrlRef = useRef<Map<string, string>>(new Map());
  const isUpdateMode = !!contributionId;

  useEffect(() => {
    const fetchData = async () => {
      try {     
        setLoading(true);
        const resHeritage = await searchHeritageNames(); 
        setAllHeritages(resHeritage.result || []);
 
        const res = await isContributorPremiumEligible();
        setPremiumEligible(res.result || false);
     

        // 2. Nếu update mode thì load bài viết
        if (contributionId) {
          const res = await getContributionDetailForUpdated(contributionId);
          if (res.code === 200 && res.result) {
            const data = res.result;
            setTitle(data.title);
            setCover(data.mediaUrl || null);
            setSelectedHeritages(data.contributionHeritageTags || []);
            setPremiumType(
              data.isPremium
                ? ContributionPremiumTypes.SUBSCRIPTIONONLY
                : ContributionPremiumTypes.FREE
            );

            let parsedDelta: any = null;
            try {
              parsedDelta = typeof data.content === "string"
                ? JSON.parse(data.content)
                : data.content;
            } catch {}
            setDelta(parsedDelta);
            if (parsedDelta) {
              setHtml(htmlFromDeltaWithImgAlign(parsedDelta.ops));
            }          
            setInitialContribution(data);
          }
        }
      } catch (err) {
        console.error("❌ Lỗi load form:", err);
      }
      finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contributionId]);

  // useEffect(() => {
  //   if (!contributionId) return;

  //   const loadContribution = async () => {
  //     try {
  //       const res = await getContributionDetailForUpdated(contributionId);
  //       if (res.code === 200 && res.result) {
  //         const data = res.result;
  //         setTitle(data.title);
  //         setCover(data.mediaUrl || null);

  //         let parsedDelta: any = null;
  //         try {
  //           parsedDelta = typeof data.content === "string"
  //             ? JSON.parse(data.content)
  //             : data.content;
  //         } catch (err) {
  //           console.error("❌ Parse content error:", err, data.content);
  //         }

  //         setDelta(parsedDelta);
  //         if (parsedDelta) {
  //           setHtml(htmlFromDeltaWithImgAlign(parsedDelta.ops));
  //         }

  //         setSelectedHeritages(data.contributionHeritageTags || []);
  //         setPremiumType(
  //           data.isPremium
  //             ? ContributionPremiumTypes.SUBSCRIPTIONONLY
  //             : ContributionPremiumTypes.FREE
  //         );
  //       }
  //     } catch (err) {
  //       console.error("Lỗi load contribution:", err);
  //     }
  //   };

  //   loadContribution();
  // }, [contributionId]);

  const onUpdate = async () => {
    if (!canSubmit || !delta || !contributionId) return;
    setSaving(true);
    try {
      let finalCoverUrl = cover;
      if (cover && isBlobUrl(cover) && coverFile) {
        console.log("📷 Uploading cover image...");
        finalCoverUrl = await uploadToCloudinary(coverFile);
        URL.revokeObjectURL(cover);
        console.log("✅ Cover uploaded:", finalCoverUrl);
      }

      // 2. Clone delta để không ảnh hưởng state
      const newDelta = deepClone(delta);
      const ops = newDelta.ops ?? [];
      console.log("📝 Processing", ops.length, "operations");

      // 3. Cache để không upload cùng 1 blob nhiều lần
      const uploadedByHash = new Map<string, string>(); // hash -> cloudUrl
      let uploadCount = 0;

      // 4. Duyệt qua tất cả ops và upload images
      for (let i = 0; i < ops.length; i++) {
        const op = ops[i];

        // Trường hợp { image: { url } }
        if (op?.insert?.image && typeof op.insert.image === "object") {
          const imgUrl: string | undefined = op.insert.image.url;
          if (!imgUrl || !isBlobUrl(imgUrl)) continue;

          const info = blobMap.get(imgUrl);
          if (!info) {
            console.warn("⚠️ Không tìm thấy File cho blob URL:", imgUrl);
            continue;
          }
          const { file, hash } = info;

          // Nếu đã upload hash này → dùng lại
          if (uploadedByHash.has(hash)) {
            op.insert.image = { url: uploadedByHash.get(hash)! };
            continue;
          }

          // Upload mới
          const cloudUrl = await uploadToCloudinary(file);
          uploadedByHash.set(hash, cloudUrl);
          op.insert.image = { url: cloudUrl };
          uploadCount++;
          URL.revokeObjectURL(imgUrl);
        }

        // Trường hợp image là string src
        else if (typeof op?.insert?.image === "string") {
          const imgUrl: string = op.insert.image;
          if (!isBlobUrl(imgUrl)) continue;

          const info = blobMap.get(imgUrl);
          if (!info) {
            console.warn("Không tìm thấy File cho blob URL:", imgUrl);
            continue;
          }
          const { file, hash } = info;

          if (uploadedByHash.has(hash)) {
            op.insert.image = uploadedByHash.get(hash)!;
            continue;
          }

          const cloudUrl = await uploadToCloudinary(file);
          uploadedByHash.set(hash, cloudUrl);
          op.insert.image = cloudUrl;
          uploadCount++;
          URL.revokeObjectURL(imgUrl);
        }
      }  
    
      // 6. Đóng gói payload sạch
      const payload: ContributionUpdateRequest = {
        id: contributionId,
        title: title.trim(),
        content: JSON.stringify(newDelta),   
        mediaUrl: finalCoverUrl || "",
        tagHeritageIds: selectedHeritages.map(h => h.id),
        premiumType: premiumType === ContributionPremiumTypes.FREE ? 0 : 1 
      };
      const res = await updateContribution(payload);
      if (res.code === 200) {
        //toast.success("Cập nhật bài viết thành công!"); 
        setUpdated(true);
        resetForm();
      }
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = useMemo(() => {
    const textLength = html?.trim().length ?? 0; 
    return (
      title.trim().length > 0 && 
      delta && 
      cover && 
      textLength >= 5000
    );
  }, [title, delta, cover, html]);


  // Handler khi có ảnh tạm từ editor
  const handleTempImage = (blobUrl: string, file: File, hash: string) => {
    // Nếu hash đã có → đặt blobUrl về blob cũ (đề phòng child tạo blob mới)
    const existed = hashToBlobUrlRef.current.get(hash);
    const finalBlobUrl = existed ?? blobUrl;
    if (!existed) hashToBlobUrlRef.current.set(hash, finalBlobUrl);

    setBlobMap(prev => {
      const next = new Map(prev);
      next.set(finalBlobUrl, { file, hash });
      return next;
    });
  };

  // Handler khi có cover tạm
  const handleCoverChange = (url: string, file?: File) => {
    setCover(url);
    setCoverFile(file || null);
  };

  // Handler khi content thay đổi
  const handleContentChange = (h: string, d: any) => {
    setHtml(h);
    setDelta(d);
  };

  // Reset form
  const resetForm = () => {
 
    setTitle("");
    setCover(null);
    setSelectedHeritages([]);
    setPremiumType(ContributionPremiumTypes.FREE);
    setHtml("");
    setDelta(null);

};


  // Submit form
  const onSubmit = async () => {
    if (!canSubmit || !delta) return;
    setSaving(true);
    
    try {
      console.log("🚀 Bắt đầu upload process...");
      console.log("📊 Blob map hiện tại:", Array.from(blobMap.keys()));
      
      // 1. Upload cover nếu có và là blob URL
      let finalCoverUrl = cover;
      if (cover && isBlobUrl(cover) && coverFile) {
        console.log("📷 Uploading cover image...");
        finalCoverUrl = await uploadToCloudinary(coverFile);
        URL.revokeObjectURL(cover);
        console.log("✅ Cover uploaded:", finalCoverUrl);
      }

      // 2. Clone delta để không ảnh hưởng state
      const newDelta = deepClone(delta);
      const ops = newDelta.ops ?? [];
      console.log("📝 Processing", ops.length, "operations");

      // 3. Cache để không upload cùng 1 blob nhiều lần
      const uploadedByHash = new Map<string, string>(); // hash -> cloudUrl
      let uploadCount = 0;

      // 4. Duyệt qua tất cả ops và upload images
      for (let i = 0; i < ops.length; i++) {
        const op = ops[i];

        // Trường hợp { image: { url } }
        if (op?.insert?.image && typeof op.insert.image === "object") {
          const imgUrl: string | undefined = op.insert.image.url;
          if (!imgUrl || !isBlobUrl(imgUrl)) continue;

          const info = blobMap.get(imgUrl);
          if (!info) {
            console.warn("⚠️ Không tìm thấy File cho blob URL:", imgUrl);
            continue;
          }
          const { file, hash } = info;

          // Nếu đã upload hash này → dùng lại
          if (uploadedByHash.has(hash)) {
            op.insert.image = { url: uploadedByHash.get(hash)! };
            continue;
          }

          // Upload mới
          const cloudUrl = await uploadToCloudinary(file);
          uploadedByHash.set(hash, cloudUrl);
          op.insert.image = { url: cloudUrl };
          uploadCount++;
          URL.revokeObjectURL(imgUrl);
        }

        // Trường hợp image là string src
        else if (typeof op?.insert?.image === "string") {
          const imgUrl: string = op.insert.image;
          if (!isBlobUrl(imgUrl)) continue;

          const info = blobMap.get(imgUrl);
          if (!info) {
            console.warn("Không tìm thấy File cho blob URL:", imgUrl);
            continue;
          }
          const { file, hash } = info;

          if (uploadedByHash.has(hash)) {
            op.insert.image = uploadedByHash.get(hash)!;
            continue;
          }

          const cloudUrl = await uploadToCloudinary(file);
          uploadedByHash.set(hash, cloudUrl);
          op.insert.image = cloudUrl;
          uploadCount++;
          URL.revokeObjectURL(imgUrl);
        }
      }

      // 5. Tạo HTML cuối cùng từ delta đã upload
      const finalHtml = htmlFromDeltaWithImgAlign(newDelta.ops);

     
      // 6. Đóng gói payload sạch
      const payload: ContributionCreateRequest = {
        title: title.trim(),
        content: JSON.stringify(newDelta), // delta JSON string        
        mediaUrl: finalCoverUrl || "",
        tagHeritageIds: selectedHeritages.map(h => h.id),
        premiumType: premiumType === ContributionPremiumTypes.FREE ? 0 : 1 
      };

      // 7. Call API
      const apiRes = await postContribution(payload);

      if (apiRes?.code === 201 && apiRes.result) {
        toast.success("Gửi bài thành công! Bài viết của bạn sẽ được xem xét");
        //alert(`✅ Đã upload thành công!\n📊 Đã upload ${uploadCount} ảnh lên Cloudinary\n🆔 Mã bài: ${apiRes.result.id}`);

        // reset
        setSubmitted(true);
        resetForm();
      } else {
        toast.error(apiRes.message || "Đăng bài thất bại!");
        console.error("API error:", apiRes);
      }
    } catch (err) {
      console.error("Lỗi khi nộp:", err);
      toast.error("Có lỗi xảy ra khi đăng bài.");
    } finally {
      setSaving(false);
    }
  };

  return {  
  // State
  title,
  cover,
  html,
  delta,
  saving,
  blobMap,
  canSubmit,
  selectedHeritages,
  premiumType,
  submitted,
  isUpdateMode,
  updated,
  allHeritages, 
  initialContribution,
  isPremiumEligible,
  loading,
  // Handlers
  setSubmitted,
  setTitle,
  setSelectedHeritages,
  setPremiumType,
  handleTempImage,
  handleCoverChange,
  handleContentChange,
  resetForm,
  onSubmit,
  onUpdate, 
  };
};