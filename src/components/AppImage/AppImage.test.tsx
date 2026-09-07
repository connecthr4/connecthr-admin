import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import AppImage, { BLUR_DATA_URL } from './AppImage';

describe('AppImage', () => {
  it('renders an img with the given alt text and intrinsic dimensions', () => {
    render(<AppImage src="/logo.png" alt="Company logo" width={120} height={40} />);

    const image = screen.getByTestId('AppImageTest');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Company logo');
    expect(image).toHaveAttribute('width', '120');
    expect(image).toHaveAttribute('height', '40');
  });

  it('routes the source through the Next.js image optimizer', () => {
    render(<AppImage src="/logo.png" alt="Company logo" width={120} height={40} />);

    expect(screen.getByTestId('AppImageTest').getAttribute('src')).toContain('/_next/image');
  });

  it('lazy loads by default', () => {
    render(<AppImage src="/logo.png" alt="Company logo" width={120} height={40} />);

    expect(screen.getByTestId('AppImageTest')).toHaveAttribute('loading', 'lazy');
  });

  it('loads eagerly when preload is set', () => {
    render(<AppImage src="/logo.png" alt="Company logo" width={120} height={40} preload />);

    expect(screen.getByTestId('AppImageTest')).not.toHaveAttribute('loading', 'lazy');
  });

  it('applies a custom className', () => {
    render(<AppImage src="/logo.png" alt="Company logo" width={120} height={40} className="avatar" />);

    expect(screen.getByTestId('AppImageTest')).toHaveClass('avatar');
  });

  it('swaps in the fallback source once the original fails to load', () => {
    render(<AppImage src="/missing.png" alt="Avatar" width={40} height={40} fallbackSrc="/avatar-placeholder.png" />);

    const image = screen.getByTestId('AppImageTest');
    expect(image.getAttribute('src')).toContain(encodeURIComponent('/missing.png'));

    fireEvent.error(image);

    expect(screen.getByTestId('AppImageTest').getAttribute('src')).toContain(
      encodeURIComponent('/avatar-placeholder.png')
    );
  });

  it('still calls a caller supplied onError alongside the fallback swap', () => {
    const onError = vi.fn();

    render(
      <AppImage
        src="/missing.png"
        alt="Avatar"
        width={40}
        height={40}
        fallbackSrc="/avatar-placeholder.png"
        onError={onError}
      />
    );

    fireEvent.error(screen.getByTestId('AppImageTest'));

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('keeps the original source when no fallback is provided', () => {
    render(<AppImage src="/missing.png" alt="Avatar" width={40} height={40} />);

    const image = screen.getByTestId('AppImageTest');
    fireEvent.error(image);

    expect(screen.getByTestId('AppImageTest').getAttribute('src')).toContain(encodeURIComponent('/missing.png'));
  });

  it('supplies a default blur placeholder for runtime sources', () => {
    render(<AppImage src="/logo.png" alt="Company logo" width={120} height={40} placeholder="blur" />);

    expect(screen.getByTestId('AppImageTest').getAttribute('style')).toContain(BLUR_DATA_URL);
  });

  it('prefers an explicit blurDataURL over the default', () => {
    const blurDataURL = 'data:image/png;base64,customblurvalue';

    render(
      <AppImage
        src="/logo.png"
        alt="Company logo"
        width={120}
        height={40}
        placeholder="blur"
        blurDataURL={blurDataURL}
      />
    );

    expect(screen.getByTestId('AppImageTest').getAttribute('style')).toContain(blurDataURL);
  });

  it('forwards additional props to the underlying img', () => {
    render(<AppImage src="/logo.png" alt="Company logo" width={120} height={40} data-tracking-id="brand-logo" />);

    expect(screen.getByTestId('AppImageTest')).toHaveAttribute('data-tracking-id', 'brand-logo');
  });
});
