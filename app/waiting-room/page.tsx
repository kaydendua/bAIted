import { Button } from "@/components/ui/button"
import TopBar from "@/components/ui/topbar"
import PlayerList from "@/components/ui/playerList"
import LobbySettingsPanel from "@/components/ui/lobbySettings"

export default function waitingRoom() {
  return (
    <>
      <main className="flex justify-center items-center flex-col">
        <TopBar></TopBar>
        <section className="flex max-w-max">
          <PlayerList></PlayerList>
          <LobbySettingsPanel></LobbySettingsPanel>
        </section>
      </main>
    </>
  );
}