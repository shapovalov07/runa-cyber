const routes = ['', '/clubs', '/tournaments', '/news', '/franchise', '/contacts', '/admin'];

export default function sitemap() {
  const now = new Date();

  return routes.map((route) => ({
    url: `https://runa-cyber.ru${route}`,
    lastModified: now,
    changeFrequency: route === '/franchise' ? 'weekly' : 'monthly',
    priority: route === '' || route === '/franchise' ? 1 : 0.7,
  }));
}
