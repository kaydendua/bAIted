import PlayerCodeCarousel from "@/components/ui/playerCodeDisplay";
import TopBar from "@/components/ui/topbar";
import VoteSection from "@/components/ui/voteSection";

export default function WebIDEPage() {
  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <TopBar></TopBar>
        <div className="text-4xl">DISCUSS!</div>
        <br />
        <VoteSection></VoteSection>
        <br />
        <PlayerCodeCarousel></PlayerCodeCarousel>
      </div>
    </>
  )
}