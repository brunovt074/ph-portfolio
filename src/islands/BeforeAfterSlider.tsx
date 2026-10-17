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

const INITIAL_POSITION = 50;

export default function BeforeAfterSlider({ beforeSrc, afterSrc, alt, width, height, provisional }: Props) {
  const [position, setPosition] = useState(INITIAL_POSITION);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setPosition(Number(event.target.value));

  const frameStyle = {
    aspectRatio: `${width} / ${height}`,
    '--pos': `${position}%`,
  } as CSSProperties;

  return (
    <figure className="ba">
      <div className="ba-frame" style={frameStyle}>
        <img className="ba-image" src={afterSrc} alt={alt} width={width} height={height} loading="lazy" draggable={false} />
        <img
          className={provisional ? 'ba-image ba-before ba-provisional' : 'ba-image ba-before'}
          src={beforeSrc}
          alt=""
          width={width}
          height={height}
          loading="lazy"
          draggable={false}
        />
        <span className="t-eyebrow ba-label ba-label-before">Antes</span>
        <span className="t-eyebrow ba-label ba-label-after">Después</span>
        <div className="ba-divider" aria-hidden="true" />
        <div className="ba-knob" aria-hidden="true">
          <span>‹</span>
          <span>›</span>
        </div>
        <input
          className="ba-range"
          type="range"
          min={0}
          max={100}
          step={1}
          value={position}
          onChange={handleChange}
          aria-label="Comparar antes y después del retoque"
          aria-valuetext={`Mostrando ${position}% de la toma original`}
        />
      </div>
      {provisional && (
        <p className="ba-note">Ejemplo ilustrativo. Los pares reales de antes y después se cargan desde el CMS.</p>
      )}
    </figure>
  );
}
