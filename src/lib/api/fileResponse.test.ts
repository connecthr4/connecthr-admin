import { describe, expect, it } from 'vitest';

import { rebrandContentDisposition, streamFileResponse } from './fileResponse';

describe('rebrandContentDisposition', () => {
  it.each([
    [
      'attachment; filename="ConnectHR_Attendance_2026-09-17.xlsx"',
      'attachment; filename="ZentroHR_Attendance_2026-09-17.xlsx"',
    ],
    ['attachment; filename="connecthr-employees.xlsx"', 'attachment; filename="ZentroHR-employees.xlsx"'],
    ['attachment; filename="Connect HR Holidays.xlsx"', 'attachment; filename="ZentroHR Holidays.xlsx"'],
    [
      "attachment; filename*=UTF-8''Connect%20HR%20Holidays.xlsx",
      "attachment; filename*=UTF-8''ZentroHR%20Holidays.xlsx",
    ],
  ])('rewrites %s', (header, expected) => {
    expect(rebrandContentDisposition(header)).toBe(expected);
  });

  it('leaves a header without the legacy brand untouched', () => {
    const header = 'attachment; filename="attendance.xlsx"';

    expect(rebrandContentDisposition(header)).toBe(header);
  });
});

describe('streamFileResponse', () => {
  it('rebrands the file name the backend sends', () => {
    const upstream = new Response('binary', {
      headers: { 'Content-Disposition': 'attachment; filename="ConnectHR_Attendance.xlsx"' },
    });

    const response = streamFileResponse(upstream, 'attendance.xlsx');

    expect(response.headers.get('content-disposition')).toBe('attachment; filename="ZentroHR_Attendance.xlsx"');
  });

  it('falls back to the given name when the backend sends none', () => {
    const response = streamFileResponse(new Response('binary'), 'attendance.xlsx');

    expect(response.headers.get('content-disposition')).toBe('attachment; filename="attendance.xlsx"');
  });
});
