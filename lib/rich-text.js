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

export const toRichTextHtml = (value, { multiline = true } = {}) => {
  const text = getText(value).replace(/\r\n?/g, '\n').trim();
  if (!text) return '';

  const escaped = escapeHtml(text);
  const linked = tokenizeLinks(escaped);
  const formatted = applyInlineMarkdown(linked.value);
  const withLineBreaks = multiline ? formatted.replace(/\n/g, '<br />') : formatted.replace(/\n/g, ' ');

  return restoreTokens(withLineBreaks, linked.tokens);
};

export const toRichTextPlainText = (value) =>
  getText(value)
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/gi, '$1')
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
