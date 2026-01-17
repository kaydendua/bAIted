import CarouselDemo from "@/components/ui/playerCodeDisplay";
import TopBar from "@/components/ui/topbar";

export default function WebIDEPage() {
  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <TopBar></TopBar>
        <div className="">DISCUSS!</div>
        <CarouselDemo></CarouselDemo>
      </div>
    </>
  )
}