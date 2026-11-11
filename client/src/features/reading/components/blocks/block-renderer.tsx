import type { CSSProperties } from "react";
import type { Block, Highlight } from "../../types";
import { AuthoredBlock } from "./authored-block";
import { ImageBlock, TimelineBlock } from "./simple-blocks";

interface BlockRendererProps {
  block: Block;
  highlights: Highlight[];
  openHighlightId: string | null;
  onToggleHighlight: (id: string) => void;
  onEditHighlight: (id: string) => void;
  textStyle: CSSProperties;
}

export function BlockRenderer({ block, highlights, openHighlightId, onToggleHighlight, onEditHighlight, textStyle }: BlockRendererProps) {
  switch (block.type) {
    case "authored":
      return (
        <AuthoredBlock
          blockId={block.id}
          onEditHighlight={onEditHighlight}
          {...(block.heading ? { heading: block.heading } : {})}
          markdown={block.markdown}
          highlights={highlights.filter((h) => h.blockId === block.id)}
          openHighlightId={openHighlightId}
          onToggleHighlight={onToggleHighlight}
          textStyle={textStyle}
        />
      );
    case "image":
      return <ImageBlock alt={block.alt} caption={block.caption} credit={block.credit} {...(block.src ? { src: block.src } : {})} />;
    case "timeline":
      return <TimelineBlock heading={block.heading} items={block.items} />;
    case "sources":
      return null; // rendered once, as a footnote, by <LessonEnd>
  }
}
