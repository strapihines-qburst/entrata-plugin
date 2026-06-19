type TextChild = { type: "text"; text?: string };
type ParagraphBlock = { type: "paragraph"; children?: TextChild[] };

export const blocksToPlainText = (blocks: unknown): string => {
  if (!Array.isArray(blocks)) {
    return "";
  }

  return (blocks as ParagraphBlock[])
    .map((block) => {
      if (block.type !== "paragraph" || !Array.isArray(block.children)) {
        return "";
      }

      return block.children.map((child) => child.text ?? "").join("");
    })
    .filter(Boolean)
    .join("\n\n");
};

export const plainTextToBlocks = (text: string) => {
  if (!text.trim()) {
    return [];
  }

  return text
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: "paragraph",
      children: [{ type: "text", text: paragraph }],
    }));
};
