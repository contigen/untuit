import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function readTextRecord(record: NDEFRecord) {
  const textDecoder = new TextDecoder(record.encoding)
  return textDecoder.decode(record.data as unknown as AllowSharedBufferSource)
}
