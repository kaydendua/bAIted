import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import PlayerCodeInstance from "./playerCodeInstance"

export default function PlayerCodeCarousel() {
  return (
    <Carousel className="w-full max-w-3/4" opts={{
      loop: true,
      dragFree: true,
    }}>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="basis-1/3 max-h-3/4">
            <PlayerCodeInstance></PlayerCodeInstance>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
