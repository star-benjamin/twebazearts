import { useEffect, useRef, useState } from 'react';

/**
 * When a photo is shown with object-fit: contain inside a container of a
 * different aspect ratio, the photo gets letterboxed — it doesn't fill the
 * container edge-to-edge. If you position an overlay (like the artwork)
 * using percentages of the *container*, it drifts out of alignment with the
 * photo the moment the container's aspect ratio changes (which is exactly
 * what happens between desktop and mobile).
 *
 * This hook measures the photo's actual rendered box (left/top/width/height
 * in px, relative to the container) so overlays can be positioned as a
 * percentage of the PHOTO itself. That stays correct at any screen size.
 *
 * @param {React.RefObject<HTMLElement>} containerRef
 * @param {number} naturalWidth  - the photo's real pixel width
 * @param {number} naturalHeight - the photo's real pixel height
 */
export function useContainedImageBox(containerRef, naturalWidth, naturalHeight) {
  const [box, setBox] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !naturalWidth || !naturalHeight) return;

    const compute = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (!cw || !ch) return;

      const containerRatio = cw / ch;
      const imageRatio = naturalWidth / naturalHeight;

      let width, height;
      if (imageRatio > containerRatio) {
        // Photo is relatively wider than the container — width-constrained,
        // letterboxed top and bottom.
        width = cw;
        height = cw / imageRatio;
      } else {
        // Photo is relatively taller — height-constrained, letterboxed
        // left and right.
        height = ch;
        width = ch * imageRatio;
      }

      setBox({ left: (cw - width) / 2, top: (ch - height) / 2, width, height, ready: true });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef, naturalWidth, naturalHeight]);

  return box;
}

/** Convenience: a ref + the box it measures, bundled together. */
export function useContainedImageBoxRef(naturalWidth, naturalHeight) {
  const ref = useRef(null);
  const box = useContainedImageBox(ref, naturalWidth, naturalHeight);
  return [ref, box];
}
