'use client'

import { RotatingLines } from 'react-loader-spinner'

export function Spinner({
  strokeColor,
  width,
  strokeWidth,
}: {
  strokeColor?: string
  width?: string
  strokeWidth?: string
}) {
  return (
    <RotatingLines
      strokeColor={strokeColor || '#fff'}
      strokeWidth={strokeWidth || '4'}
      width={width || '24'}
    />
  )
}
