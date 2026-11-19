const ICONS = {
  coin: ["..XXXX..", ".XYYYYX.", "XYWYYYYX", "XYWYYYYX", "XYWYYYYX", "XYYYYYYX", ".XYYYYX.", "..XXXX.."],
  heart: [".XX.XX..", "XWXXXXX.", "XXXXXXX.", "XXXXXXX.", ".XXXXX..", "..XXX...", "...X....", "........"],
  star: ["...X....", "...X....", "XXXXXXX.", ".XXXXX..", "..XXX...", ".XX.XX..", ".X...X..", "........"],
  trophy: ["XXXXXXXX", "X.XXXX.X", "X.XXXX.X", ".XXXXXX.", "..XXXX..", "...XX...", "..XXXX..", ".XXXXXX."],
  gear: ["...XX...", ".XXXXXX.", ".XX..XX.", "XX....XX", "XX....XX", ".XX..XX.", ".XXXXXX.", "...XX..."],
  sword: ["......XX", ".....XXX", "....XXX.", "X..XXX..", ".XXXX...", "..XX....", ".X.XX...", "X...X..."],
  pad: ["........", ".XXXXXX.", "XX.XXXXX", "X...XX.X", "XX.XXXXX", "XXXXXXXX", "XX....XX", "........"],
  mail: ["........", "XXXXXXXX", "XX....XX", "X.X..X.X", "X..XX..X", "X......X", "XXXXXXXX", "........"],
  play: [".X......", ".XX.....", ".XXX....", ".XXXX...", ".XXX....", ".XX.....", ".X......", "........"],
  code: ["........", "..X..X..", ".X...X..", "X...X..X", ".X..X.X.", "..XX..X.", "........", "........"],
  link: ["........", ".XXX.XXX", "X...X..X", "X.XXXX.X", "X..X...X", "XXX.XXX.", "........", "........"],
} as const;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  className?: string;
  color?: string;
};

/** Crisp 8×8 pixel-art icon rendered as SVG rects. */
export default function PixelIcon({ name, size = 16, className, color = "currentColor" }: Props) {
  const rows = ICONS[name];
  const cells: { x: number; y: number; fill: string }[] = [];
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === "X") cells.push({ x, y, fill: name === "coin" ? "#b45309" : color });
      else if (ch === "Y") cells.push({ x, y, fill: "#facc15" });
      else if (ch === "W") cells.push({ x, y, fill: name === "coin" ? "#fef08a" : "#ffffff" });
    }),
  );
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {cells.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1} height={1} fill={c.fill} />
      ))}
    </svg>
  );
}
