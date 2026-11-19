import PixelIcon from "./PixelIcon";

type Props = { kicker: string; title: string };

export default function SectionHeading({ kicker, title }: Props) {
  return (
    <div className="mb-14 text-center">
      <p className="mb-4 flex items-center justify-center gap-3 font-pixel text-[0.6rem] uppercase tracking-widest text-neon sm:text-xs">
        <PixelIcon name="play" size={10} className="text-magenta" />
        {kicker}
        <PixelIcon name="play" size={10} className="-scale-x-100 text-magenta" />
      </p>
      <h2 className="text-glow font-display text-4xl font-bold text-ink sm:text-6xl">{title}</h2>
    </div>
  );
}
