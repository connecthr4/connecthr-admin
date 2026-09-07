/**
 * AppImage is a reusable wrapper around Next.js's Image that standardizes image rendering
 * across the application: one place to set optimisation defaults, one place to recover from
 * a broken source, and the Next 16 prop names (`preload`, never the deprecated `priority`).
 *
 * @example
 * ```tsx
 * import AppImage from '@src/components/AppImage'
 *
 * export default function Logo() {
 *   return <AppImage src="/zentrohr-logo.svg" alt="ZentroHR" width={931} height={202} preload />;
 * }
 * ```
 */
'use client';

import { useState } from 'react';
import NextImage, { type ImageProps } from 'next/image';

/**
 * A 1x1 neutral-grey PNG, scaled up and blurred by `placeholder="blur"`.
 *
 * Next.js derives a `blurDataURL` automatically for statically imported files but not for
 * runtime sources, and asking for `placeholder="blur"` without one is a hard error. This is
 * the stand-in for those, small enough (a little over 100 bytes) to stay inline in the markup.
 */
export const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN4+vw1AAVsArjSAflTAAAAAElFTkSuQmCC';

/**
 * Define the props available for the AppImage component.
 *
 * Everything `next/image` accepts is forwarded, minus `priority`, which Next 16 deprecated in
 * favour of `preload`. Pass `preload` for the LCP image, `sizes` whenever the image is `fill`
 * or CSS-sized, and `width`/`height` everywhere else so the browser can reserve the space.
 */
export type AppImageProps = Omit<ImageProps, 'priority'> & {
  /**
   * Source to swap in when `src` fails to load — a missing avatar, an expired remote URL.
   *
   * Without it a broken image renders as the browser's own placeholder plus the alt text.
   */
  fallbackSrc?: ImageProps['src'];
};

/**
 * The stateful half, mounted only when a fallback was asked for, so that the common case
 * stays a plain render with no state and no re-render on failure.
 */
function ImageWithFallback({ src, fallbackSrc, onError, ...rest }: AppImageProps) {
  const [hasFailed, setHasFailed] = useState(false);

  return (
    <NextImage
      {...rest}
      data-testid="AppImageTest"
      src={hasFailed && fallbackSrc ? fallbackSrc : src}
      onError={(event) => {
        setHasFailed(true);
        onError?.(event);
      }}
    />
  );
}

export default function AppImage({ fallbackSrc, placeholder, blurDataURL, ...rest }: AppImageProps) {
  /**
   * Only a runtime `src` needs the stand-in: a static import already carries a blurDataURL
   * generated from the file itself, which is a far better preview than flat grey.
   */
  const resolvedBlurDataURL =
    placeholder === 'blur' && typeof rest.src === 'string' ? (blurDataURL ?? BLUR_DATA_URL) : blurDataURL;

  if (fallbackSrc) {
    return (
      <ImageWithFallback
        {...rest}
        fallbackSrc={fallbackSrc}
        placeholder={placeholder}
        blurDataURL={resolvedBlurDataURL}
      />
    );
  }

  return <NextImage {...rest} data-testid="AppImageTest" placeholder={placeholder} blurDataURL={resolvedBlurDataURL} />;
}
