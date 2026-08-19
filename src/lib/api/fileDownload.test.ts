import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadFile } from './fileDownload';
import { triggerFileDownload } from '@/src/utils/download';

/**
 * Only the DOM-touching half is replaced — the filename parsing stays real,
 * so these cover the header handling end to end.
 */
vi.mock('@/src/utils/download', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/src/utils/download')>()),
  triggerFileDownload: vi.fn(),
}));

describe('downloadFile', () => {
  const triggerFileDownloadSpy = vi.mocked(triggerFileDownload);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubFetch(response: Response) {
    const fetchMock = vi.fn(() => Promise.resolve(response));

    vi.stubGlobal('fetch', fetchMock);

    return fetchMock;
  }

  it('saves the blob under the name the response carries', async () => {
    stubFetch(
      new Response('binary', {
        status: 200,
        headers: { 'Content-Disposition': 'attachment; filename="employees-2026.xlsx"' },
      })
    );

    await downloadFile('/api/employees/export', 'employees.xlsx');

    expect(triggerFileDownloadSpy).toHaveBeenCalledTimes(1);
    expect(triggerFileDownloadSpy.mock.calls[0][1]).toBe('employees-2026.xlsx');
  });

  it('falls back to the given filename when the response does not name one', async () => {
    stubFetch(new Response('binary', { status: 200 }));

    await downloadFile('/api/employees/export', 'employees.xlsx');

    expect(triggerFileDownloadSpy.mock.calls[0][1]).toBe('employees.xlsx');
  });

  it('forwards the request init, so criteria can travel in a POST body', async () => {
    const fetchMock = stubFetch(new Response('binary', { status: 200 }));
    const init = { method: 'POST', body: JSON.stringify({ scope: 'all' }) };

    await downloadFile('/api/employees/export', 'employees.xlsx', init);

    expect(fetchMock).toHaveBeenCalledWith('/api/employees/export', init);
  });

  it('throws the API error shape on a JSON failure, and saves nothing', async () => {
    stubFetch(
      new Response(JSON.stringify({ success: false, message: 'Export unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(downloadFile('/api/employees/export', 'employees.xlsx')).rejects.toMatchObject({
      message: 'Export unavailable',
      details: { success: false, message: 'Export unavailable' },
    });
    expect(triggerFileDownloadSpy).not.toHaveBeenCalled();
  });

  it('still throws a usable error when the failure body is not JSON', async () => {
    stubFetch(new Response('<html>gateway error</html>', { status: 502, statusText: 'Bad Gateway' }));

    await expect(downloadFile('/api/employees/export', 'employees.xlsx')).rejects.toThrow('Bad Gateway');
    expect(triggerFileDownloadSpy).not.toHaveBeenCalled();
  });
});
