import VRToursHero from "../../components/VRTours/VRToursHero";
import VRToursFilter from "../../components/VRTours/VRToursFilter";
import VRToursGrid from "../../components/VRTours/VRToursGrid";
import VRFeaturesSection from "../../components/VRTours/VRFeaturesSection";
import { useState } from "react";
import VRTourPopup from "../../components/VRTours/VRTourPopup";

const VRToursPage = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      
       <VRToursHero onStartTour={handleOpenPopup} />
      <VRToursFilter />
      <VRToursGrid />
      <VRFeaturesSection />
        {isPopupOpen && <VRTourPopup onClose={handleClosePopup} />}

        <iframe
  src="https://www.theasys.io/viewer/KEMqGSMOpDkL2ixdx8zWrAqTSPNAHz"
  allowFullScreen
  frameBorder="0"
  scrolling="no"
  allow="vr; gyroscope; accelerometer"
  style={{
    width: "100%",
    height: "100vh",   // full màn hình
    display: "block",
  }}
/>
    </div>
  );
};

export default VRToursPage;