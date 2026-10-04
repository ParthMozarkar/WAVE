import React from "react";
import { useRouter } from "./hooks/useRouter.js";
import { LandingPage } from "./landing/LandingPage.jsx";
import { GestureMaestro } from "./app/GestureMaestro.jsx";
import { MultiplayerLanding } from "./components/multiplayer/MultiplayerLanding.jsx";
import { MultiplayerRoom } from "./components/multiplayer/MultiplayerRoom.jsx";

export function App() {
  const { route, isPlay, isMultiplayer, navigate } = useRouter();

  if (isPlay) {
    return <GestureMaestro onExitHome={() => navigate("/")} />;
  }

  if (isMultiplayer) {
    if (route.startsWith("/multiplayer/room/")) {
      const code = route.split("/multiplayer/room/")[1];
      return <MultiplayerRoom roomCode={code} onLeave={() => navigate("/multiplayer")} />;
    }
    return <MultiplayerLanding onNavigate={navigate} />;
  }

  return (
    <LandingPage onEnter={() => navigate("/play")} onEnterMultiplayer={() => navigate("/multiplayer")} />
  );
}

export default App;
