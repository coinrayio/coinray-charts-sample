// useResize.ts
import {useEffect, useRef, useState, type RefObject} from 'react';

export function useElementSize<T extends HTMLElement>(): [RefObject<T>, {width: number; height: number}] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({width: 0, height: 0});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setSize({width: cr.width, height: cr.height});
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
}

// Optional: fire when a hidden tab becomes visible (FlexLayout hides inactive tabs)
export function useVisibility<T extends HTMLElement>(ref: RefObject<T>, onVisible: () => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) onVisible();
    }, {threshold: 0});
    io.observe(el);
    return () => io.disconnect();
  }, [ref, onVisible]);
}
