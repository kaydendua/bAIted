import LobbyForm from "@/components/LobbyForm";
import { LobbyProvider } from "@/lib/LobbyContext";

export default function Home() {
  return (
    <LobbyProvider>
      <div className="w-full">
        <header className="flex flex-col items-center mb-12">
          <img src='/logo.png' alt="Logo" className="h-48 w-96 object-contain"/>
          <p className="text-lg text-balance text-red-50 sm:text-xl">
            bAIted is a spin-off on Among Us!
          </p>
          <p className="text-lg text-balance text-red-50 sm:text-xl">
            Players code answers to questions and attempt determine who is the <span className="text-red-500 font-semibold">Vibe Coder</span>.
          </p>
        </header>
        <div className="w-full h-full flex items-center justify-center">
          <LobbyForm />
        </div>
      </div>
    </LobbyProvider>
  );
}