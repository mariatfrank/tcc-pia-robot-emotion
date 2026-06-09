import { useEffect } from "react";
import { Outlet } from "react-router-dom";

type OrientationLockMode = "any" | "natural" | "landscape" | "portrait";

function tryLandscapeLock() {
  const o = screen.orientation as ScreenOrientation & {
    lock?: (mode: OrientationLockMode) => Promise<void>;
  };
  if (typeof o?.lock === "function") {
    void o.lock("landscape").catch(() => {
      });
  }
}

export function TabletLayout() {
  useEffect(() => {
    document.documentElement.classList.add("tablet-mode");
    tryLandscapeLock();
    window.addEventListener("orientationchange", tryLandscapeLock);
    return () => {
      document.documentElement.classList.remove("tablet-mode");
      window.removeEventListener("orientationchange", tryLandscapeLock);
    };
  }, []);

  return (
    <div className="tablet-shell">
      <p className="tablet-rotate-hint" role="status">
        Para melhor experiência, use o tablet na horizontal (paisagem).
      </p>
      <Outlet />
    </div>
  );
}

