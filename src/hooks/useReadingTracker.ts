import { useEffect, useRef } from "react";
import { sendContributionAccessLog } from "../services/contributionService";
import { getOrCreateClientUuid } from "../utils/tokenStorage";

export function useReadingTracker(contributionId: number , enabled: boolean) {
  const hasSent = useRef(false);

  // Time tracking
  const startTime = useRef(Date.now());
  const pausedSince = useRef<number | null>(null);
  const pausedTotal = useRef(0);

  // Scroll
  const lastScroll = useRef({ time: Date.now(), pos: 0 });
  const maxDepth = useRef(0);

  // Interactions
  const interactions = useRef(0);

const sendLog = () => {
  if (hasSent.current) return;

  const now = Date.now();

  if (pausedSince.current !== null) {
    pausedTotal.current += now - pausedSince.current;
    pausedSince.current = null;
  }

  const activeTime = now - startTime.current - pausedTotal.current;

  const deltaPos = Math.abs(window.scrollY - lastScroll.current.pos);
  const deltaTime = now - lastScroll.current.time;
  const finalVelocity = deltaTime > 0 ? deltaPos / deltaTime : 0;

  const logData = {
    time: activeTime,
    depth: maxDepth.current,
    velocity: finalVelocity,
    interactions: interactions.current,
  };

  // ❗ Không gửi nếu không đủ điều kiện hợp lệ
  if (!isValidReadingLog(logData)) return;

  hasSent.current = true;

  sendContributionAccessLog({
    contributionId,
    clientUuid: getOrCreateClientUuid(),
    timeSpentMs: activeTime,
    scrollDepth: maxDepth.current,
    scrollVelocity: finalVelocity,
    interactions: interactions.current,
  });
};


useEffect(() => {
  console.log(enabled)
  if (!enabled) return;

  hasSent.current = false;
  startTime.current = Date.now();
  pausedSince.current = null;
  pausedTotal.current = 0;
  maxDepth.current = 0;
  interactions.current = 0;
  lastScroll.current = { time: Date.now(), pos: 0 };

  const onVisibility = () => {
    if (document.hidden) {
      // BẮT ĐẦU pause
      if (pausedSince.current === null)
        pausedSince.current = Date.now();
    } else {
      // KẾT THÚC pause
      if (pausedSince.current !== null) {
        pausedTotal.current += Date.now() - pausedSince.current;
        pausedSince.current = null;
      }
    }
  };

  const onScroll = () => { 
    if (document.hidden) return;

    const now = Date.now();
    const y = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;

    const depth = Math.min((y + winHeight) / docHeight, 1);
    maxDepth.current = Math.max(maxDepth.current, depth);

    lastScroll.current = { time: now, pos: y };

    // ⭐ Gửi ngay nếu scroll sâu & điều kiện hợp lệ
    const activeTime = now - startTime.current - pausedTotal.current;

    if (
        depth > 0.7 &&
        activeTime > 40_000 &&           // đủ thời gian thực
        !hasSent.current
    ) {
        sendLog();
    }
    };


  const onInteract = () => {
    if (!document.hidden) interactions.current += 1;
  };

  window.addEventListener("scroll", onScroll);
  window.addEventListener("click", onInteract);
  window.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", sendLog); // ⭐ Tốt hơn beforeunload

  return () => {
    sendLog();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("click", onInteract);
    window.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", sendLog);
  };
}, [enabled]); 

}

function isValidReadingLog({ time, depth }: {
  time: number;
  depth: number;
}) {
  // < 10s = spam
  if (time < 30_000) return false;

  // Không kéo gì cả
  if (depth < 0.5) return false;

  return true;
}


