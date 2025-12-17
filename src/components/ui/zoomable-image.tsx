"use client";

import Image, { type ImageProps } from "next/image";
import { type ImgHTMLAttributes } from "react";
import Zoom, { type UncontrolledProps } from "react-medium-image-zoom";
import { cn } from "@/shared/lib/utils";

export interface ImageZoomProps extends Omit<ImageProps, "alt"> {
  alt: string;
  zoomInProps?: ImgHTMLAttributes<HTMLImageElement>;
  zoomProps?: Partial<UncontrolledProps>;
  className?: string;
}

function getImageSrc(src: ImageProps["src"]): string {
  if (typeof src === "string") return src;
  if ("default" in src) return src.default.src;
  return src.src;
}

/**
 * Zoomable image component that allows users to zoom in on images.
 * Supports Next.js Image component with medium-zoom functionality.
 * @param zoomInProps - Props for the zoomed image element
 * @param zoomProps - Props for the Zoom component
 * @param className - CSS class names for the image
 * @param props - Standard Next.js Image props
 * @returns A zoomable image component
 * @example
 * ```tsx
 * <ImageZoom
 *   src="https://example.com/image.png"
 *   alt="Example"
 *   width={400}
 *   height={300}
 * />
 * ```
 */
export function ImageZoom({
  zoomInProps,
  zoomProps,
  className,
  children,
  alt,
  ...props
}: ImageZoomProps) {
  return (
    <Zoom
      {...(zoomProps as Record<string, unknown>)}
      zoomImg={{
        src: getImageSrc(props.src),
        sizes: undefined,
        className: cn(
          "image-rendering-high-quality cursor-zoom-out",
          zoomInProps?.className
        ),
        ...zoomInProps,
      }}
    >
      {children ?? (
        <Image
          alt={alt}
          className={cn("cursor-zoom-in rounded-md transition-all", className)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
          {...props}
        />
      )}
    </Zoom>
  );
}
