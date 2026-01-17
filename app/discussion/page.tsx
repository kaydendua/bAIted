import PlayerCodeCarousel from "@/components/ui/playerCodeDisplay";
import TopBar from "@/components/ui/topbar";
import { Button } from "@/components/ui/button"

export default function WebIDEPage() {
  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <TopBar></TopBar>
        <div className="">DISCUSS!</div>
        <Button className="w-2xl">Vote</Button>
        <PlayerCodeCarousel></PlayerCodeCarousel>
      </div>
    </>
  )
}