import PlayerListItem from "@/components/ui/playerListItem"

export default function PlayerList() {
  return (
    <>
      <div className="box-border border-1 p-4 rounded-lg w-full max-w-5xl flex flex-col">
        <div>Players:</div>
        <PlayerListItem></PlayerListItem>
        <PlayerListItem></PlayerListItem>
        <PlayerListItem></PlayerListItem>
      </div>
    </>
  )
}