import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface HeaderTourProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TourStep[];
}

const HeaderTour: React.FC<HeaderTourProps> = ({ isOpen, onClose, steps }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentTourStep = steps[currentStep];

  // Update vị trí của element được highlight
  useEffect(() => {
    if (!isOpen || !currentTourStep) return;

    const updatePosition = () => {
      const element = document.querySelector(currentTourStep.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      }
    };

    updatePosition();
    
    // Update khi resize hoặc scroll
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, currentStep, currentTourStep]);

  // Lock scroll khi tour đang mở
  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isOpen]);

  // Reset step khi đóng
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  // Tính toán vị trí tooltip dựa trên position
  const getTooltipPosition = () => {
    if (!targetRect) return {};

    const position = currentTourStep.position || 'bottom';
    const padding = 20;
    const tooltipMaxWidth = 384; // max-w-sm = 384px

    switch (position) {
      case 'bottom':
        return {
          top: targetRect.bottom + padding,
          left: Math.min(
            Math.max(tooltipMaxWidth / 2, targetRect.left + targetRect.width / 2),
            window.innerWidth - tooltipMaxWidth / 2
          ),
          transform: 'translateX(-50%)',
        };
      case 'top':
        return {
          bottom: window.innerHeight - targetRect.top + padding,
          left: Math.min(
            Math.max(tooltipMaxWidth / 2, targetRect.left + targetRect.width / 2),
            window.innerWidth - tooltipMaxWidth / 2
          ),
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          right: window.innerWidth - targetRect.left + padding,
          transform: 'translateY(-50%)',
        };
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + padding,
          transform: 'translateY(-50%)',
        };
      default:
        return {};
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000]">
      {/* Overlay với spotlight effect */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.x - 8}
                  y={targetRect.y - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </div>

      {/* Highlight border xung quanh element */}
      {targetRect && (
        <div
          className="absolute border-4 border-yellow-400 rounded-xl pointer-events-none animate-pulse"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 4px rgba(251, 191, 36, 0.2), 0 0 20px rgba(251, 191, 36, 0.4)',
            transition: 'all 0.3s ease-in-out',
          }}
        />
      )}

      {/* Tooltip box */}
      {targetRect && (
        <div
          className={`absolute bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 pointer-events-auto transition-opacity duration-200 ${
            isAnimating ? 'opacity-0' : 'opacity-100'
          }`}
          style={getTooltipPosition()}
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            aria-label="Đóng hướng dẫn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="pr-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-800 to-yellow-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {currentStep + 1}
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {currentTourStep.title}
              </h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {currentTourStep.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-yellow-600'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition font-medium"
            >
              Bỏ qua
            </button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Quay lại
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-6 py-2 bg-gradient-to-r from-yellow-800 to-yellow-600 text-white rounded-lg hover:shadow-lg transition font-medium"
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Tiếp theo
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  'Hoàn thành'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderTour;