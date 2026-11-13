/**
 * Small, safe markdown renderer for newsroom articles.
 * Supports: # ## ### headings, paragraphs, - lists, **bold**, *italic*, [text](url), ![alt](https://image)
 * All HTML in the source is escaped first.
 */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(src: string) {
  let t = esc(src);
  t = t.replace(/!\[([^\]]*)\]\((https:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
  t = t.replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return t;
}

export function renderMarkdown(src: string): string {
  return src
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const h = block.match(/^(#{1,3}) (.+)$/);
      if (h) return `<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`;
      const lines = block.split("\n");
      if (lines.every((l) => /^- /.test(l))) return `<ul>${lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join("")}</ul>`;
      return `<p>${lines.map(inline).join("<br>")}</p>`;
    })
    .join("\n");
}
