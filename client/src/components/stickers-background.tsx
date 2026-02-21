interface StickersBackgroundProps {
  /** When true, stickers are semi-transparent (for sub-pages) */
  transparent?: boolean;
}

const stickerBase = "fixed pointer-events-none z-[5] object-contain";
const stickerLeft = "object-left-top";
const stickerRight = "object-right-top";

export function StickersBackground({ transparent = false }: StickersBackgroundProps) {
  const opacityClass = transparent ? "opacity-25" : "opacity-100";

  return (
    <>
      <img src="/orange-swirl-sticker.png" alt="" className={`left-80 top-12 w-16 h-16 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/confetti-sticker.png" alt="" className={`left-[88%] top-0 w-16 h-16 ${stickerBase} ${stickerLeft} rotate-6 ${opacityClass}`} aria-hidden />
      <img src="/confetti-2-sticker.png" alt="" className={`left-36 top-4 w-12 h-12 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/confetti-5-sticker.png" alt="" className={`left-52 top-0 w-12 h-12 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/face-sticker.png" alt="" className={`right-48 top-48 w-28 h-28 ${stickerBase} ${stickerRight} ${opacityClass}`} aria-hidden />
      <img src="/orange-squiggle-sticker.png" alt="" className={`right-72 top-56 w-10 h-10 ${stickerBase} ${stickerRight} ${opacityClass}`} aria-hidden />
      <img src="/island-sticker.png" alt="" className={`right-56 top-72 w-24 h-24 ${stickerBase} ${stickerRight} ${opacityClass}`} aria-hidden />
      <img src="/salmon-swirl-sticker.png" alt="" className={`right-44 top-72 w-12 h-12 ${stickerBase} ${stickerRight} ${opacityClass}`} aria-hidden />
      <img src="/microscope-sticker.png" alt="" className={`right-32 top-80 w-20 h-20 ${stickerBase} ${stickerRight} ${opacityClass}`} aria-hidden />
      <img src="/map-sticker-2.png" alt="" className={`right-16 top-[35%] w-24 h-24 ${stickerBase} ${stickerRight} ${opacityClass}`} aria-hidden />
      <img src="/brown-swirl-2-sticker.png" alt="" className={`right-2 top-[38%] w-12 h-12 ${stickerBase} ${stickerRight} rotate-90 ${opacityClass}`} aria-hidden />
      <img src="/dice-sticker.png" alt="" className={`right-4 top-[45%] w-24 h-24 ${stickerBase} ${stickerRight} ${opacityClass}`} aria-hidden />
      <img src="/orange-segment-sticker.png" alt="" className={`left-4 top-12 w-8 h-8 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/palm-sticker.png" alt="" className={`left-8 top-20 w-24 h-24 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/brown-swirl-sticker.png" alt="" className={`left-8 top-44 w-14 h-14 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/tomato-sticker.png" alt="" className={`right-72 top-8 w-28 h-28 ${stickerBase} ${stickerRight} ${opacityClass}`} aria-hidden />
      <img src="/potato-sticker.png" alt="" className={`right-80 top-40 w-16 h-16 ${stickerBase} ${stickerRight} ${opacityClass}`} aria-hidden />
      <img src="/confetti-3-sticker.png" alt="" className={`right-64 top-40 w-10 h-10 ${stickerBase} ${stickerRight} ${opacityClass}`} aria-hidden />
      <img src="/chess-rook-sticker.png" alt="" className={`right-12 top-[16%] w-24 h-24 ${stickerBase} ${stickerRight} ${opacityClass}`} aria-hidden />
      <img src="/terracotta-ribbon-sticker.png" alt="" className={`right-72 top-0 w-8 h-8 ${stickerBase} ${stickerRight} ${opacityClass}`} aria-hidden />
      <img src="/coin-sticker.png" alt="" className={`right-80 top-44 w-20 h-20 ${stickerBase} ${stickerRight} ${opacityClass}`} aria-hidden />
      <img src="/board-corner.png" alt="" className={`left-0 -top-48 w-64 h-64 ${stickerBase} ${stickerLeft} rotate-180 ${opacityClass}`} aria-hidden />
      <img src="/compass-sticker.png" alt="" className={`left-[80%] top-2 w-20 h-20 ${stickerBase} ${stickerLeft} rotate-6 ${opacityClass}`} aria-hidden />
      <img src="/terracotta-swirl-sticker.png" alt="" className={`left-[76%] top-24 w-12 h-12 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/exclamation-sticker.png" alt="" className={`left-64 top-0 w-20 h-20 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/confetti-4-sticker.png" alt="" className={`left-96 top-0 w-16 h-16 ${stickerBase} ${stickerLeft} rotate-180 ${opacityClass}`} aria-hidden />
      <img src="/sun-sticker.png" alt="" className={`left-32 top-0 w-48 h-48 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/orange-segment-sticker.png" alt="" className={`left-52 top-40 w-8 h-8 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/map-sticker.png" alt="" className={`left-72 top-24 w-20 h-20 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/chess-knight-sticker.png" alt="" className={`left-56 top-64 w-28 h-28 ${stickerBase} ${stickerLeft} rotate-12 ${opacityClass}`} aria-hidden />
      <img src="/skull-sticker.png" alt="" className={`left-56 top-44 w-20 h-20 ${stickerBase} ${stickerLeft} -rotate-12 ${opacityClass}`} aria-hidden />
      <img src="/orange-spiral-sticker.png" alt="" className={`left-80 top-44 w-16 h-16 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/knight-sticker.png" alt="" className={`left-28 top-36 w-28 h-28 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/tan-swirl-sticker.png" alt="" className={`left-28 top-68 w-14 h-14 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/treasure-sticker.png" alt="" className={`left-4 top-[38%] w-32 h-32 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/dice-single-sticker.png" alt="" className={`left-32 top-[52%] w-16 h-16 ${stickerBase} ${stickerLeft} ${opacityClass}`} aria-hidden />
      <img src="/boat-sticker.png" alt="" className={`right-28 top-[16%] w-28 h-28 ${stickerBase} ${stickerRight} -rotate-[24deg] ${opacityClass}`} aria-hidden />
      <img src="/brown-confetti-sticker.png" alt="" className={`right-32 top-[26%] w-8 h-8 ${stickerBase} ${stickerRight} ${opacityClass}`} aria-hidden />
    </>
  );
}
