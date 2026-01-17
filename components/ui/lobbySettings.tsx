import { Button } from "@/components/ui/button"

export default function LobbySettingsPanel() {
  return (
    <>
      <div className="box-border border-1 p-4 rounded-lg w-full max-w-5xl flex flex-col">
        Lobby Settings:
        <Button className="bg-green-500">Start</Button>
      </div>
    </>
  )
}