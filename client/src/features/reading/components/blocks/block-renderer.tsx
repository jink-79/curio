import type { CSSProperties } from "react";
import type { Block, Highlight } from "../../types";
import { AuthoredBlock } from "./authored-block";
import { QuizBlock } from "./quiz-block";
import { ConceptsBlock, ImageBlock, PeopleBlock, TakeawaysBlock, TimelineBlock } from "./simple-blocks";
import { SourcesBlock } from "./sources-block";

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
    case "concepts":
      return <ConceptsBlock heading={block.heading} items={block.items} />;
    case "people":
      return <PeopleBlock heading={block.heading} items={block.items} />;
    case "timeline":
      return <TimelineBlock heading={block.heading} items={block.items} />;
    case "takeaways":
      return <TakeawaysBlock items={block.items} />;
    case "quiz":
      return <QuizBlock questions={block.questions} />;
    case "sources":
      return <SourcesBlock heading={block.heading} items={block.items} />;
  }
}
