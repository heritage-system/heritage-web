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
    </div>
  );
};

export default VRToursPage;