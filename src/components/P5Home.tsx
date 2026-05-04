import p5 from 'p5';
import { useEffect, useRef } from 'react';

import { createP5HomeSketch } from './P5Home/sketch';
import type { HomeItem, HomeItemId } from './P5Home/types';

type P5HomeProps = {
  items: HomeItem[];
  onNavigate: (id: HomeItemId) => void;
};

export function P5Home({ items, onNavigate }: P5HomeProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sketchRef = useRef<p5 | null>(null);

  useEffect(() => {
    const sketch = createP5HomeSketch({
      getHostElement: () => hostRef.current,
      items,
      onNavigate,
    });

    sketchRef.current = new p5(sketch);

    return () => {
      sketchRef.current?.remove();
      sketchRef.current = null;
    };
  }, [items, onNavigate]);

  return (
    <div className="p5-home" ref={hostRef}>
      <nav className="p5-home-nav visually-hidden" aria-label="Website sections">
        {items.map((item) => (
          <a
            href={`#${item.id}`}
            key={item.id}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(item.id);
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
