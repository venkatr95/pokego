'use client';

import { useEffect, useState } from 'react';

export function useWindowWidth(fallback = 1024): number {
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return width;
}
