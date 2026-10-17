import { useState } from 'react';
import type { ChangeEvent, CSSProperties } from 'react';

interface Props {
  beforeSrc: string;
  afterSrc: string;
  alt: string;
  width: number;
  height: number;
  provisional: boolean;
}

const KNOB_SIZE = 44;

const frameStyle = (width: number, height: number, position: number): CSSProperties =>
  ({
    position: 'relative',
    aspectRatio: `${width} / ${height}`,
    maxWidth: 'min(100%, 720px)',
    marginInline: 'auto',
    overflow: 'hidden',
    touchAction: 'pan-y',
    ['--pos' as string]: `${position}%`,
  }) as CSSProperties;

const imageStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  userSelect: 'none',
  pointerEvents: 'none',
};

const labelStyle: CSSProperties = {
  position: 'absolute',
  top: 12,
  padding: '6px 10px',
  background: 'var(--door-label-bg)',
  color: 'var(--paper)',
  pointerEvents: 'none',
};

const dividerStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 'var(--pos)',
  width: 2,
  marginLeft: -1,
  background: 'var(--paper)',
  pointerEvents: 'none',
};

const knobStyle = (focused: boolean): CSSProperties => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: KNOB_SIZE,
  height: KNOB_SIZE,
  marginLeft: -KNOB_SIZE / 2,
  marginTop: -KNOB_SIZE / 2,
  borderRadius: '50%',
  background: 'var(--paper)',
  color: 'var(--ink)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
  fontSize: 20,
  lineHeight: 1,
  outline: focused ? '2px solid var(--accent-current)' : 'none',
  outlineOffset: 3,
});

const rangeStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
  cursor: 'ew-resize',
  margin: 0,
};

const noteStyle: CSSProperties = {
  margin: '12px auto 0',
  maxWidth: 'min(100%, 720px)',
  fontSize: 13,
  color: 'var(--fg-muted)',
  textAlign: 'center',
};

export default function BeforeAfterSlider({ beforeSrc, afterSrc, alt, width, height, provisional }: Props) {
  const [position, setPosition] = useState(50);
  const [focused, setFocused] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setPosition(Number(event.target.value));

  const beforeStyle: CSSProperties = {
    ...imageStyle,
    clipPath: 'inset(0 calc(100% - var(--pos)) 0 0)',
    ...(provisional ? { filter: 'saturate(0.35) contrast(0.82) brightness(1.06)' } : {}),
  };

  return (
    <figure style={{ margin: 0 }}>
      <div style={frameStyle(width, height, position)}>
        <img src={afterSrc} alt={alt} width={width} height={height} loading="lazy" draggable={false} style={imageStyle} />
        <img src={beforeSrc} alt="" width={width} height={height} loading="lazy" draggable={false} style={beforeStyle} />
        <span className="t-eyebrow" style={{ ...labelStyle, left: 12 }}>
          Antes
        </span>
        <span className="t-eyebrow" style={{ ...labelStyle, right: 12 }}>
          Después
        </span>
        <div style={dividerStyle} aria-hidden="true">
          <div style={knobStyle(focused)}>
            <span>‹</span>
            <span>›</span>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={position}
          onChange={handleChange}
          onFocus={(event) => setFocused(event.currentTarget.matches(':focus-visible'))}
          onBlur={() => setFocused(false)}
          aria-label="Comparar antes y después del retoque"
          aria-valuetext={`${position}% antes`}
          style={rangeStyle}
        />
      </div>
      {provisional && (
        <p style={noteStyle}>Ejemplo ilustrativo. Los pares reales de antes y después se cargan desde el CMS.</p>
      )}
    </figure>
  );
}
