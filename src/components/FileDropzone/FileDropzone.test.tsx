import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import FileDropzone from './FileDropzone';
import { DOCUMENT_UPLOAD, STRINGS } from '@/src/constants/strings';
import { BYTES_IN_MB } from '@/src/utils/helper';

const LABEL = STRINGS.UPLOAD_APPOINTMENT_LETTER;

const pdfFile = () => new File(['letter'], 'appointment-letter.pdf', { type: 'application/pdf' });

/**
 * Files report the size of their contents, and building a genuinely oversized one would mean
 * allocating megabytes per test, so the size is declared instead.
 */
const oversizedFile = () => {
  const file = pdfFile();

  Object.defineProperty(file, 'size', { value: (DOCUMENT_UPLOAD.MAX_SIZE_MB + 1) * BYTES_IN_MB });

  return file;
};

/**
 * Drops a file on the box. `userEvent` has no drag and drop, and a drop is the one path that
 * reaches the component with a file the input's `accept` never filtered.
 */
const dropFile = (file: File) => {
  fireEvent.drop(screen.getByText(STRINGS.SUPPORTED_FORMATS).closest('label') as HTMLElement, {
    dataTransfer: { files: [file], types: ['Files'] },
  });
};

describe('FileDropzone', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // jsdom implements neither, and the image preview calls both.
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
  });

  it('renders the label, the instruction and the supported formats', () => {
    render(<FileDropzone label={LABEL} file={null} onChange={onChange} />);

    expect(screen.getByText(LABEL)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.CHOOSE_FILE)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.SUPPORTED_FORMATS)).toBeInTheDocument();
  });

  it('names the file input after the label and offers only the accepted types', () => {
    render(<FileDropzone label={LABEL} file={null} onChange={onChange} />);

    expect(screen.getByLabelText(LABEL)).toHaveAttribute('accept', DOCUMENT_UPLOAD.ACCEPTED_TYPES.join(','));
  });

  it('reports a file picked through the input', async () => {
    const user = userEvent.setup();
    const file = pdfFile();

    render(<FileDropzone label={LABEL} file={null} onChange={onChange} />);

    await user.upload(screen.getByLabelText(LABEL), file);

    expect(onChange).toHaveBeenCalledWith(file);
  });

  it('reports a dropped file', () => {
    const file = pdfFile();

    render(<FileDropzone label={LABEL} file={null} onChange={onChange} />);

    dropFile(file);

    expect(onChange).toHaveBeenCalledWith(file);
  });

  it('refuses a dropped file of an unsupported type', () => {
    render(<FileDropzone label={LABEL} file={null} onChange={onChange} />);

    dropFile(new File(['nope'], 'notes.txt', { type: 'text/plain' }));

    expect(screen.getByText(STRINGS.UNSUPPORTED_FILE_TYPE)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('refuses a file over the size limit, naming it', () => {
    render(<FileDropzone label={LABEL} file={null} onChange={onChange} />);

    dropFile(oversizedFile());

    expect(screen.getByText(`${STRINGS.FILE_TOO_LARGE} ${DOCUMENT_UPLOAD.MAX_SIZE_MB}MB.`)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('honours a size limit given by the caller', () => {
    render(<FileDropzone label={LABEL} file={null} onChange={onChange} maxSizeMB={1} />);

    const file = pdfFile();
    Object.defineProperty(file, 'size', { value: 2 * BYTES_IN_MB });

    dropFile(file);

    expect(screen.getByText(`${STRINGS.FILE_TOO_LARGE} 1MB.`)).toBeInTheDocument();
  });

  it('shows the name and size of the attached file', () => {
    const file = pdfFile();

    render(<FileDropzone label={LABEL} file={file} onChange={onChange} />);

    expect(screen.getByText(file.name)).toBeInTheDocument();
    expect(screen.getByText('6 B')).toBeInTheDocument();
    expect(screen.getByText(STRINGS.REPLACE_FILE)).toBeInTheDocument();
  });

  it('previews an attached image and releases the preview when it goes', () => {
    const image = new File(['jpeg'], 'payslip.jpeg', { type: 'image/jpeg' });

    const { rerender } = render(<FileDropzone label={LABEL} file={image} onChange={onChange} />);

    expect(screen.getByRole('presentation')).toHaveAttribute('src', 'blob:preview');

    rerender(<FileDropzone label={LABEL} file={null} onChange={onChange} />);

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });

  it('clears the file when it is removed', async () => {
    const user = userEvent.setup();

    render(<FileDropzone label={LABEL} file={pdfFile()} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: `${STRINGS.REMOVE} ${LABEL}` }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('cannot be changed while disabled', () => {
    render(<FileDropzone label={LABEL} file={null} onChange={onChange} disabled />);

    expect(screen.getByLabelText(LABEL)).toBeDisabled();

    dropFile(pdfFile());

    expect(onChange).not.toHaveBeenCalled();
  });
});
