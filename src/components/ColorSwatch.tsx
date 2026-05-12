interface Props {
  codes: string[];
  size?: 'sm' | 'md';
}

export function ColorSwatch({ codes, size = 'sm' }: Props) {
  if (!codes.length) return null;
  const dim = size === 'sm' ? 'w-5 h-5' : 'w-7 h-7';
  return (
    <div className="flex gap-1 flex-wrap">
      {codes.map((hex, i) => (
        <span
          key={i}
          className={`${dim} rounded-full border border-black/10 shadow-sm inline-block`}
          style={{ backgroundColor: hex }}
          title={hex}
        />
      ))}
    </div>
  );
}
