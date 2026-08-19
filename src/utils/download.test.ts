import { afterEach, describe, expect, it, vi } from 'vitest';

import { parseContentDispositionFilename, triggerFileDownload } from './download';

describe('parseContentDispositionFilename', () => {
  it('returns null when the header is missing', () => {
    expect(parseContentDispositionFilename(null)).toBeNull();
  });

  it('reads a quoted filename', () => {
    expect(parseContentDispositionFilename('attachment; filename="holidays-2026.xlsx"')).toBe('holidays-2026.xlsx');
  });

  it('reads an unquoted filename', () => {
    expect(parseContentDispositionFilename('attachment; filename=holidays.xlsx')).toBe('holidays.xlsx');
  });

  it('prefers the RFC 5987 filename* form and decodes it', () => {
    expect(
      parseContentDispositionFilename('attachment; filename="fallback.xlsx"; filename*=UTF-8\'\'holiday%20list.xlsx')
    ).toBe('holiday list.xlsx');
  });

  it('falls back to the plain filename when filename* is malformed', () => {
    expect(parseContentDispositionFilename('attachment; filename="ok.xlsx"; filename*=UTF-8\'\'%E0%A4%A')).toBe(
      'ok.xlsx'
    );
  });

  it('returns null when the header names nothing usable', () => {
    expect(parseContentDispositionFilename('attachment')).toBeNull();
  });
});

describe('triggerFileDownload', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clicks a temporary anchor and revokes the object URL', () => {
    /**
     * jsdom does not implement the object-URL APIs, so they are installed
     * here rather than spied on.
     */
    const createObjectURL = vi.fn(() => 'blob:mock-url');
    const revokeObjectURL = vi.fn();
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;

    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    try {
      triggerFileDownload(new Blob(['data']), 'holidays.xlsx');

      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(document.querySelector('a')).toBeNull();
    } finally {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
    }
  });
});
