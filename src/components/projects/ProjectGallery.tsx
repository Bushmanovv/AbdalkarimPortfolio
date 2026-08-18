import Image from "next/image";

import type { GalleryItem } from "@/types";
import { asset } from "@/lib/site";

interface ProjectGalleryProps {
  items: GalleryItem[];
}

/**
 * Project gallery.
 *
 * Renders nothing when no media exists, so a case study never ships an empty
 * frame. Add entries to a project's `gallery` array (files under `public/`)
 * and the section appears automatically.
 */
export function ProjectGallery({ items }: ProjectGalleryProps) {
  if (items.length === 0) return null;

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.src} className="panel overflow-hidden">
          <div className="relative aspect-[16/10] bg-bg-secondary">
            <Image
              src={asset(item.src)}
              alt={item.alt}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
          {item.caption ? (
            <p className="border-t border-line px-4 py-2.5 font-mono text-[11px] text-fg-muted">
              {item.caption}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
