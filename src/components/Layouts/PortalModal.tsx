import React from "react";
import { createPortal } from "react-dom";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface PortalModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  zIndex?: number;

  // Kích thước & bố cục
  size?: ModalSize;                // preset: sm/md/lg/xl/full
  maxWidth?: string;               // override ví dụ: "960px" hay "min(90vw,1200px)"
  maxHeight?: string;              // override ví dụ: "85vh"
  fullScreen?: boolean;            // full màn hình
  fullScreenOnMobile?: boolean;    // auto full trên mobile
  centered?: boolean;              // center (default true)

  // Tuỳ biến lớp
  contentClassName?: string;       // thêm class cho hộp nội dung
  noPadding?: boolean;             // bỏ padding nội dung

  // Tương tác
  closeOnOverlay?: boolean;        // default true
  closeOnEsc?: boolean;            // default true
  lockScroll?: boolean;            // default true

  // A11y & focus
  ariaLabel?: string;
  ariaLabelledby?: string;
  initialFocusRef?: React.RefObject<HTMLElement>; // focus vào ref khi mở
  restoreFocus?: boolean;          // trả focus về phần tử cũ khi đóng (default true)

  // Portal
  portalId?: string;               // id node portal (default "portal-modal-root")
}

const sizeMaxWidthMap: Record<Exclude<ModalSize, "full">, string> = {
  sm: "420px",
  md: "600px",
  lg: "800px",
  xl: "960px",
};

const PortalModal: React.FC<PortalModalProps> = ({
  open,
  onClose,
  children,
  zIndex = 9999,

  size = "md",
  maxWidth,
  maxHeight = "85vh",
  fullScreen = false,
  fullScreenOnMobile = false,
  centered = true,

  contentClassName = "",
  noPadding = false,

  closeOnOverlay = true,
  closeOnEsc = true,
  lockScroll = true,

  ariaLabel,
  ariaLabelledby,
  initialFocusRef,
  restoreFocus = true,

  portalId = "portal-modal-root",
}) => {
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const prevFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    let root = document.getElementById(portalId) as HTMLDivElement | null;
    if (!root) {
      root = document.createElement("div");
      root.id = portalId;
      document.body.appendChild(root);
    }
    mountRef.current = root;
  }, [portalId]);

  // Esc to close
  React.useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOnEsc, onClose]);

// Lock scroll
  React.useEffect(() => {
    if (!open || !lockScroll) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, lockScroll]);

  // Focus management
  React.useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;

    // Focus ưu tiên
    const toFocus = initialFocusRef?.current;
    if (toFocus) {
      setTimeout(() => toFocus.focus(), 0);
    }
    return () => {
      if (restoreFocus && prevFocusRef.current) {
        prevFocusRef.current.focus?.();
      }
    };
  }, [open, initialFocusRef, restoreFocus]);

  if (!open || !mountRef.current) return null;

  // Tính maxWidth theo size nếu chưa override
  const computedMaxWidth =
    fullScreen ? "100vw"
    : maxWidth ? maxWidth
    : size === "full" ? "100vw"
    : sizeMaxWidthMap[size as Exclude<ModalSize, "full">];

  // Mobile full-screen
  const mobileFull = fullScreenOnMobile ? "sm:max-w-[var(--mw)] sm:max-h-[var(--mh)] w-screen h-screen" : "";

  // Wrapper align
  const centerStyle = centered
    ? "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    : "fixed top-6 left-1/2 -translate-x-1/2"; // ví dụ top aligned

  return createPortal(
    <div
      className="fixed inset-0"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      {/* Overlay + fade-in */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-100 transition-opacity duration-150"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Content */}
      <div
        className={`${centerStyle} opacity-100 scale-100 transition-all duration-150`}
        onClick={(e) => e.stopPropagation()}
        style={
          {
            // dùng CSS vars để truyền vào class theo responsive
            // @ts-ignore
            "--mw": computedMaxWidth,
            "--mh": maxHeight,
          } as React.CSSProperties
        }
      >
        <div
          className={[
            mobileFull || "",
            fullScreen ? "w-screen h-screen" : "max-w-[var(--mw)] max-h-[var(--mh)]",
            noPadding ? "" : "p-0",
            "bg-transparent", // để tự define padding/rounded ở child hoặc ở contentClassName
            "overflow-auto",
            contentClassName,
          ].join(" ")}
        >
          {children}
        </div>
      </div>
    </div>,
    mountRef.current
  );
};

export default PortalModal;
