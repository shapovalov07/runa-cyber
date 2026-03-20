const getText = (value) => (typeof value === 'string' ? value : '');

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeAttr = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const normalizeUrl = (value) => {
  const source = getText(value).trim().replace(/&amp;/g, '&');
  if (!source) return '';
  if (!/^https?:\/\//i.test(source)) return '';
  return source;
};

const HAS_HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/i;
const ALLOWED_HTML_TAGS = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre']);
const MAPPED_TAG_NAMES = {
  div: 'p',
};

const buildLinkHtml = (label, href) => {
  const safeHref = normalizeUrl(href);
  if (!safeHref) return label;
  return `<a href="${escapeAttr(safeHref)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
};

const tokenizeLinks = (value) => {
  const tokens = [];

  const withMarkdownLinks = value.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/gi, (_, label, href) => {
    const token = `__RICH_LINK_${tokens.length}__`;
    tokens.push(buildLinkHtml(label, href));
    return token;
  });

  const withAutoLinks = withMarkdownLinks.replace(/https?:\/\/[^\s<]+/gi, (rawUrl) => {
    let url = rawUrl;
    let trailing = '';

    while (/[),.!?;:]$/.test(url)) {
      trailing = `${url.slice(-1)}${trailing}`;
      url = url.slice(0, -1);
    }

    const token = `__RICH_LINK_${tokens.length}__`;
    tokens.push(`${buildLinkHtml(url, url)}${trailing}`);
    return token;
  });

  return { value: withAutoLinks, tokens };
};

const restoreTokens = (value, tokens) =>
  value.replace(/__RICH_LINK_(\d+)__/g, (_, index) => {
    const token = tokens[Number(index)];
    return typeof token === 'string' ? token : '';
  });

const applyInlineMarkdown = (value) =>
  value
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>');

const sanitizeTagMarkup = (rawTag) => {
  const match = rawTag.match(/^<\s*(\/?)\s*([a-z0-9:-]+)([^>]*)>$/i);
  if (!match) return '';

  const isClosing = Boolean(match[1]);
  const sourceTag = (match[2] || '').toLowerCase();
  const tag = MAPPED_TAG_NAMES[sourceTag] || sourceTag;
  if (!ALLOWED_HTML_TAGS.has(tag)) return '';

  if (isClosing) {
    return tag === 'br' ? '' : `</${tag}>`;
  }

  if (tag === 'br') {
    return '<br />';
  }

  if (tag === 'a') {
    const attrs = match[3] || '';
    const hrefMatch = attrs.match(/\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const hrefCandidate = hrefMatch?.[1] || hrefMatch?.[2] || hrefMatch?.[3] || '';
    const safeHref = normalizeUrl(hrefCandidate);
    if (!safeHref) return '';
    return `<a href="${escapeAttr(safeHref)}" target="_blank" rel="noopener noreferrer">`;
  }

  return `<${tag}>`;
};

const stripDangerousBlocks = (value) =>
  value
    .replace(/<\s*(script|style|iframe|object|embed|meta|link)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|meta|link)[^>]*\/?\s*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

export const sanitizeRichTextHtml = (value) => {
  const source = getText(value).replace(/\r\n?/g, '\n').trim();
  if (!source) return '';

  const tokens = [];
  const tokenized = stripDangerousBlocks(source).replace(/<[^>]*>/g, (rawTag) => {
    const token = `__RICH_TAG_${tokens.length}__`;
    tokens.push(sanitizeTagMarkup(rawTag));
    return token;
  });

  const escaped = escapeHtml(tokenized);
  return escaped.replace(/__RICH_TAG_(\d+)__/g, (_, index) => tokens[Number(index)] || '').trim();
};

export const toRichTextHtml = (value, { multiline = true } = {}) => {
  const text = getText(value).replace(/\r\n?/g, '\n').trim();
  if (!text) return '';

  if (HAS_HTML_TAG_PATTERN.test(text)) {
    return sanitizeRichTextHtml(text);
  }

  const escaped = escapeHtml(text);
  const linked = tokenizeLinks(escaped);
  const formatted = applyInlineMarkdown(linked.value);
  const withLineBreaks = multiline ? formatted.replace(/\n/g, '<br />') : formatted.replace(/\n/g, ' ');

  return restoreTokens(withLineBreaks, linked.tokens);
};

export const toRichTextPlainText = (value) =>
  getText(value)
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/\s*(p|div|li|blockquote|pre)\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/gi, '$1')
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
