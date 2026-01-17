import PlayerCodeCarousel from "@/components/ui/playerCodeDisplay";
import TopBar from "@/components/ui/topbar";

export default function WebIDEPage() {
  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <TopBar></TopBar>
        <div className="">DISCUSS!</div>
        <PlayerCodeCarousel></PlayerCodeCarousel>
      </div>
    </>
  )
}