import React from "react";
import { useRouter } from "./hooks/useRouter.js";
import { LandingPage } from "./landing/LandingPage.jsx";
import { GestureMaestro } from "./app/GestureMaestro.jsx";

export function App() {
  const { isPlay, navigate } = useRouter();

  return isPlay ? (
    <GestureMaestro onExitHome={() => navigate("/")} />
  ) : (
    <LandingPage onEnter={() => navigate("/play")} />
  );
}

export default App;
