declare module "embla-carousel-react" {
  import { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from "embla-carousel";
  import { RefObject } from "react";

  const useEmblaCarousel: (
    options?: EmblaOptionsType,
    plugins?: EmblaPluginType[]
  ) => [RefObject<HTMLDivElement>, EmblaCarouselType | undefined];

  export default useEmblaCarousel;
}

declare module "embla-carousel-autoplay" {
  import { EmblaPluginType } from "embla-carousel";

  interface AutoplayOptions {
    delay?: number;
    jump?: boolean;
    playOnInit?: boolean;
    stopOnInteraction?: boolean;
    stopOnMouseEnter?: boolean;
    stopOnLastSnap?: boolean;
  }

  function Autoplay(options?: AutoplayOptions): EmblaPluginType;

  export default Autoplay;
}

declare module "embla-carousel" {
  export type EmblaCarouselType = {
    canScrollNext: () => boolean;
    canScrollPrev: () => boolean;
    on: (event: string, callback: () => void) => void;
    scrollNext: () => void;
    scrollPrev: () => void;
    scrollTo: (index: number) => void;
    selectedScrollSnap: () => number;
  };

  export type EmblaOptionsType = {
    align?: "start" | "center" | "end";
    loop?: boolean;
    speed?: number;
  };

  export type EmblaPluginType = unknown;
}
