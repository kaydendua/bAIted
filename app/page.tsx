"use client"

import LobbyForm from "@/components/LobbyForm";
import { LobbyProvider, useLobbyContext } from "@/lib/LobbyContext";

export default function Home() {
  const { lobby } = useLobbyContext();

  return (
    <div className="w-full">
      {lobby?.status !== 'in-progress' && (
        <header className="flex flex-col items-center">
        <img src='/logo.png' alt="Logo" className="h-48 w-96 object-contain"/>
        <p className="text-lg text-balance opacity-80 sm:text-xl">
          A spin-off on Among Us. A fun game where players code answers to questions and attempt determine who is the Vibe coder.
        </p>
      </header>
      )}
      <div className="w-full h-full flex items-center justify-center">
        <LobbyForm />
      </div>
    </div>
  );
}
