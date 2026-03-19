import { toRichTextHtml } from '@/lib/rich-text';

const getText = (value) => (typeof value === 'string' ? value : '');

export default function RichTextContent({ value, className = '', multiline = true, as = 'div' }) {
  const html = toRichTextHtml(value, { multiline });
  if (!html) return null;

  const Tag = getText(as) || 'div';

  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
