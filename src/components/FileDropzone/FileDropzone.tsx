/**
 * A single file field that takes a file either from the system picker or from a drag and drop,
 * validates it against the accepted types and size, and shows what is currently attached.
 *
 * @example
 * ```tsx
 * import FileDropzone from '@src/components/FileDropzone'
 *
 * export default function FileDropzone() {
 *   return <FileDropzone label="Upload Salary Slips" file={file} onChange={setFile} />;
 * }
 * ```
 */
'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import clsx from 'clsx';
import { Caption, ErrorText, Text3, Text4 } from '../Typography/Typography';
import { DOCUMENT_UPLOAD, STRINGS } from '@/src/constants/strings';
import { BYTES_IN_MB, formatFileSize } from '@/src/utils/helper';
import styles from './FileDropzone.module.scss';

/**
 * Define the props available for the FileDropzone component.
 */
interface FileDropzoneProps {
  /**
   * Title shown above the box, and the accessible name of the file input inside it.
   */
  label: string;

  /**
   * The file currently attached, or `null` while the field is empty. The component holds no
   * file of its own — only the drag and validation state — so the caller decides where a
   * picked file lives.
   */
  file: File | null;

  /**
   * Fired with a file that passed validation, or with `null` when the user removes one. A
   * rejected file is never reported: the reason is shown under the box instead.
   */
  onChange: (file: File | null) => void;

  /**
   * MIME types the field accepts. Also what the picker offers, so the file system dialog
   * greys out everything else before a bad pick can even be made.
   *
   * @default DOCUMENT_UPLOAD.ACCEPTED_TYPES
   */
  accept?: readonly string[];

  /**
   * Largest file the field takes, in megabytes.
   *
   * @default DOCUMENT_UPLOAD.MAX_SIZE_MB
   */
  maxSizeMB?: number;

  /**
   * The caption under the instruction, naming what may be uploaded.
   *
   * @default STRINGS.SUPPORTED_FORMATS
   */
  hint?: string;

  /**
   * While `true` neither the picker nor a drop can change the field.
   */
  disabled?: boolean;

  /**
   * Additional CSS class names for the field wrapper.
   */
  className?: string;
}

/**
 * Points the thumbnail at a blob URL for the attached file, alive for exactly as long as
 * that thumbnail is on screen.
 *
 * @remarks
 * Only images get one. A PDF is shown as an icon, and a URL that nothing renders would just
 * pin the file in memory until the tab is closed. Revoking in the cleanup is what keeps a
 * user who reselects a dozen times from leaking a dozen blobs.
 *
 * The URL is written straight onto the node rather than held in state: creating one is
 * exactly the kind of external-system work an effect is for, and going through state would
 * mean a second render for every pick.
 */
function useImagePreview(file: File | null, isImage: boolean) {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;

    if (!image || !file || !isImage) return;

    const objectUrl = URL.createObjectURL(file);

    image.src = objectUrl;

    return () => URL.revokeObjectURL(objectUrl);
  }, [file, isImage]);

  return imageRef;
}

export default function FileDropzone({
  label,
  file,
  onChange,
  accept = DOCUMENT_UPLOAD.ACCEPTED_TYPES,
  maxSizeMB = DOCUMENT_UPLOAD.MAX_SIZE_MB,
  hint = STRINGS.SUPPORTED_FORMATS,
  disabled = false,
  className,
}: FileDropzoneProps) {
  const inputId = useId();
  const labelId = `${inputId}-label`;
  const hintId = `${inputId}-hint`;
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isImage = Boolean(file?.type.startsWith('image/'));
  const imageRef = useImagePreview(file, isImage);

  /**
   * Reports a picked file, or the reason it was refused. A drop bypasses the input's
   * `accept` entirely — the browser only applies that to the picker — so the type is
   * checked here as well as declared there.
   */
  const handleFile = (candidate: File | undefined) => {
    if (!candidate) return;

    if (!accept.includes(candidate.type)) {
      return setError(STRINGS.UNSUPPORTED_FILE_TYPE);
    }

    if (candidate.size > maxSizeMB * BYTES_IN_MB) {
      return setError(`${STRINGS.FILE_TOO_LARGE} ${maxSizeMB}MB.`);
    }

    setError(null);

    onChange(candidate);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);

    /*
      Clearing the input means picking the same file twice in a row still fires a change —
      browsers skip the event when the value is unchanged, which would otherwise make
      "remove, then reselect the same file" do nothing.
    */
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    // Without this the browser handles the drop itself and navigates to the file.
    event.preventDefault();

    if (disabled) return;

    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = () => {
    if (!disabled) setIsDragging(true);
  };

  /**
   * Dragging between the box's own children fires `dragleave` on the way out of each one, so
   * the highlight is only dropped once the pointer has left the box itself. `relatedTarget`
   * is null when the drag leaves the window, which `contains` reads as "outside" too.
   */
  const handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();

    setIsDragging(false);

    if (disabled) return;

    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleRemove = () => {
    setError(null);

    onChange(null);
  };

  const dragProps = {
    onDragOver: handleDragOver,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  return (
    <div data-testid="FileDropzoneTest" className={clsx(styles.field, className)}>
      <Text3 as="p" id={labelId} className={styles.title}>
        {label}
      </Text3>

      {/*
        One input serves both states, so the empty box and the "Replace file" link can each
        open the picker through `htmlFor`. It is visually hidden rather than absent, which
        keeps the field reachable by keyboard — `.field:has(input:focus-visible)` draws the
        ring on the box.
      */}
      <input
        id={inputId}
        type="file"
        className={styles.input}
        accept={accept.join(',')}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-describedby={file ? undefined : hintId}
        onChange={handleInputChange}
      />

      {file ? (
        /*
          A div, not a label: the remove button sits inside it, and a click on it would
          otherwise reach the label and reopen the picker on the way out.
        */
        <div className={clsx(styles.dropzone, styles.filled, isDragging && styles.dragging)} {...dragProps}>
          <div className={styles.preview}>
            {isImage ? (
              /*
                `src` is set by the effect above, not here: it owns the blob URL's lifetime.
                Decorative, so it carries no alt text — the file's name is already beside it.
              */
              // eslint-disable-next-line @next/next/no-img-element -- a blob URL, which next/image cannot optimise.
              <img ref={imageRef} alt="" className={styles.thumbnail} />
            ) : (
              <span className={styles.fileIcon}>
                <FileText size={20} />
              </span>
            )}

            <span className={styles.meta}>
              <Text4 truncation="ellipsis" className={styles.fileName}>
                {file.name}
              </Text4>

              <Caption className={styles.fileSize}>{formatFileSize(file.size)}</Caption>
            </span>

            <button
              type="button"
              className={styles.remove}
              onClick={handleRemove}
              disabled={disabled}
              aria-label={`${STRINGS.REMOVE} ${label}`}
            >
              <X size={16} />
            </button>
          </div>

          <label htmlFor={inputId} className={styles.replace}>
            <Caption>{STRINGS.REPLACE_FILE}</Caption>
          </label>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={clsx(styles.dropzone, isDragging && styles.dragging, disabled && styles.disabled)}
          {...dragProps}
        >
          <span className={styles.icon}>
            <Upload size={20} />
          </span>

          <Text4 className={styles.instruction}>
            {STRINGS.DRAG_AND_DROP} <span className={styles.action}>{STRINGS.CHOOSE_FILE}</span> {STRINGS.TO_UPLOAD}
          </Text4>

          <Caption id={hintId} className={styles.hint}>
            {hint}
          </Caption>
        </label>
      )}

      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
