import LobbyForm from "@/components/LobbyForm";

export default function Home() {
  return (
    <div className="w-full">
      <header className="flex flex-col items-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">bAIted</h1>
        <p className="text-lg text-balance opacity-80 sm:text-xl">
          A spin-off on Among Us. A fun game where players code answers to questions and attempt determine who is the Vibe coder.
        </p>
      </header>
      <div className="w-full h-full flex items-center justify-center">
        <LobbyForm />
      </div>
    </div>

  );
}
