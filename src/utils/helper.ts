/**
 *
 * @param email
 * @returns
 */
export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'];

export const BYTES_IN_MB = 1024 * 1024;

/**
 * Renders a byte count the way a file listing does: the largest unit that keeps the number
 * under 1024, with one decimal on anything above plain bytes ("2.4 MB", "812 B").
 *
 * @param bytes Size of the file, as `File.size` reports it.
 */
export const formatFileSize = (bytes: number) => {
  let size = bytes;
  let unit = 0;

  while (size >= 1024 && unit < FILE_SIZE_UNITS.length - 1) {
    size /= 1024;
    unit += 1;
  }

  // Bytes are always whole, so a decimal place there would only ever read as ".0".
  return `${unit === 0 ? size : size.toFixed(1)} ${FILE_SIZE_UNITS[unit]}`;
};
