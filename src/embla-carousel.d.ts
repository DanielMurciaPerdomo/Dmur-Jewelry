declare module "embla-carousel-react" {
  import { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from "embla-carousel";
  import { RefObject } from "react";

  export default function useEmblaCarousel(
    options?: EmblaOptionsType,
    plugins?: EmblaPluginType[]
  ): [RefObject<HTMLDivElement>, EmblaCarouselType | undefined];
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
