import { useState, useEffect, useCallback } from "react";

function getNormalizedRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (hash === "play") return "/play";

  const path = window.location.pathname;
  if (path.endsWith("/play") || path === "/play") return "/play";

  return "/";
}

export function useRouter() {
  const [route, setRoute] = useState(getNormalizedRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(getNormalizedRoute());
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  const navigate = useCallback((targetPath) => {
    try {
      window.history.pushState({}, "", targetPath);
    } catch {
      // Fallback for environments with strict origins
      window.location.hash = targetPath.replace(/^\//, "");
    }
    setRoute(targetPath);
    window.scrollTo(0, 0);
  }, []);

  return {
    route,
    navigate,
    isPlay: route === "/play",
  };
}
