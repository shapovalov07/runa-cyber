'use client';

import { useMemo, useRef, useState } from 'react';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

const toDateTimeLocal = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 16);
  }
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

const createInitialNewsForm = () => ({
  title: '',
  summary: '',
  content: '',
  imageSrc: '',
  imageAlt: '',
  sourceUrl: '',
  publishedAt: toDateTimeLocal(),
});

const createInitialGalleryForm = () => ({
  alt: '',
  src: '',
});

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Дата не указана';
  return dateFormatter.format(date);
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Время неизвестно';
  return dateTimeFormatter.format(date);
};

const readResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));
  return payload ?? {};
};

export default function AdminPanel() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [newsForm, setNewsForm] = useState(createInitialNewsForm);
  const [newsFile, setNewsFile] = useState(null);
  const [galleryForm, setGalleryForm] = useState(createInitialGalleryForm);
  const [galleryFile, setGalleryFile] = useState(null);
  const newsFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);

  const [news, setNews] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [newsBusy, setNewsBusy] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);

  const [loadError, setLoadError] = useState('');
  const [newsMessage, setNewsMessage] = useState('');
  const [galleryMessage, setGalleryMessage] = useState('');

  const authHeaders = useMemo(
    () => ({
      'x-admin-login': getText(login),
      'x-admin-password': getText(password),
    }),
    [login, password]
  );

  const adminIdentity = useMemo(() => {
    const firstName = getText(currentUser?.firstName);
    const lastName = getText(currentUser?.lastName);
    const loginName = getText(currentUser?.login) || getText(login);
    const fullName = [firstName, lastName].filter(Boolean).join(' ');

    if (fullName && loginName) return `${fullName} (${loginName})`;
    if (fullName) return fullName;
    if (loginName) return loginName;
    return 'администратор';
  }, [currentUser, login]);

  const fetchContent = async () => {
    setLoadError('');

    try {
      const [newsResponse, galleryResponse] = await Promise.all([
        fetch('/api/news', { cache: 'no-store' }),
        fetch('/api/gallery', { cache: 'no-store' }),
      ]);

      const [newsPayload, galleryPayload] = await Promise.all([readResponse(newsResponse), readResponse(galleryResponse)]);

      if (!newsResponse.ok || !newsPayload.ok) {
        throw new Error(newsPayload.error || 'Не удалось получить новости.');
      }

      if (!galleryResponse.ok || !galleryPayload.ok) {
        throw new Error(galleryPayload.error || 'Не удалось получить фото галереи.');
      }

      setNews(Array.isArray(newsPayload.news) ? newsPayload.news : []);
      setPhotos(Array.isArray(galleryPayload.photos) ? galleryPayload.photos : []);
    } catch (error) {
      setLoadError(error.message || 'Не удалось загрузить данные CMS.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setAuthError('');

    const loginValue = getText(login);
    const passwordValue = getText(password);

    if (!loginValue || !passwordValue) {
      setAuthError('Введите логин и пароль.');
      return;
    }

    try {
      setAuthBusy(true);

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: loginValue,
          password: passwordValue,
        }),
      });

      const payload = await readResponse(response);

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Не удалось войти в админку.');
      }

      const user = {
        login: getText(payload?.user?.login) || loginValue,
        firstName: getText(payload?.user?.firstName),
        lastName: getText(payload?.user?.lastName),
      };

      setCurrentUser(user);
      setIsAuthenticated(true);
      setLoading(true);
      await fetchContent();
    } catch (error) {
      setAuthError(error.message || 'Ошибка входа в админку.');
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLogin('');
    setPassword('');
    setNews([]);
    setPhotos([]);
    setLoadError('');
    setNewsMessage('');
    setGalleryMessage('');
    setRefreshing(false);
    setLoading(false);
  };

  const ensureCredentials = () => {
    if (isAuthenticated && getText(login) && getText(password)) return true;
    setNewsMessage('Сначала войдите в админку.');
    setGalleryMessage('Сначала войдите в админку.');
    return false;
  };

  const submitNews = async (event) => {
    event.preventDefault();
    setNewsMessage('');

    if (!ensureCredentials()) return;
    if (!getText(newsForm.title) || !getText(newsForm.summary)) {
      setNewsMessage('Для новости обязательно заполните заголовок и короткое описание.');
      return;
    }

    try {
      setNewsBusy(true);

      const formData = new FormData();
      formData.set('login', getText(login));
      formData.set('password', getText(password));
      formData.set('title', getText(newsForm.title));
      formData.set('summary', getText(newsForm.summary));
      formData.set('content', getText(newsForm.content));
      formData.set('imageSrc', getText(newsForm.imageSrc));
      formData.set('imageAlt', getText(newsForm.imageAlt));
      formData.set('sourceUrl', getText(newsForm.sourceUrl));
      formData.set('publishedAt', getText(newsForm.publishedAt));

      if (newsFile) {
        formData.set('photo', newsFile);
      }

      const response = await fetch('/api/news', {
        method: 'POST',
        body: formData,
      });

      const payload = await readResponse(response);

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Не удалось создать новость.');
      }

      setNews((prev) => [payload.item, ...prev]);
      setNewsForm(createInitialNewsForm);
      setNewsFile(null);
      if (newsFileInputRef.current) {
        newsFileInputRef.current.value = '';
      }
      setNewsMessage('Новость опубликована.');
    } catch (error) {
      setNewsMessage(error.message || 'Ошибка публикации новости.');
    } finally {
      setNewsBusy(false);
    }
  };

  const removeNews = async (id) => {
    setNewsMessage('');

    if (!ensureCredentials()) return;
    if (!window.confirm('Удалить эту новость?')) return;

    try {
      setNewsBusy(true);

      const response = await fetch(`/api/news/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      const payload = await readResponse(response);

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Не удалось удалить новость.');
      }

      setNews((prev) => prev.filter((item) => item.id !== id));
      setNewsMessage('Новость удалена.');
    } catch (error) {
      setNewsMessage(error.message || 'Ошибка удаления новости.');
    } finally {
      setNewsBusy(false);
    }
  };

  const submitPhoto = async (event) => {
    event.preventDefault();
    setGalleryMessage('');

    if (!ensureCredentials()) return;
    if (!galleryFile && !getText(galleryForm.src)) {
      setGalleryMessage('Добавьте файл изображения или ссылку на фото.');
      return;
    }

    try {
      setGalleryBusy(true);

      const formData = new FormData();
      formData.set('login', getText(login));
      formData.set('password', getText(password));
      formData.set('alt', getText(galleryForm.alt));
      formData.set('src', getText(galleryForm.src));

      if (galleryFile) {
        formData.set('photo', galleryFile);
      }

      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });

      const payload = await readResponse(response);

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Не удалось добавить фото.');
      }

      setPhotos((prev) => [payload.item, ...prev]);
      setGalleryForm(createInitialGalleryForm);
      setGalleryFile(null);
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = '';
      }
      setGalleryMessage('Фото добавлено в галерею.');
    } catch (error) {
      setGalleryMessage(error.message || 'Ошибка загрузки фото.');
    } finally {
      setGalleryBusy(false);
    }
  };

  const removePhoto = async (id) => {
    setGalleryMessage('');

    if (!ensureCredentials()) return;
    if (!window.confirm('Удалить это фото из галереи?')) return;

    try {
      setGalleryBusy(true);

      const response = await fetch(`/api/gallery/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      const payload = await readResponse(response);

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Не удалось удалить фото.');
      }

      setPhotos((prev) => prev.filter((item) => item.id !== id));
      setGalleryMessage('Фото удалено.');
    } catch (error) {
      setGalleryMessage(error.message || 'Ошибка удаления фото.');
    } finally {
      setGalleryBusy(false);
    }
  };

  const refreshData = async () => {
    if (!isAuthenticated) return;
    setRefreshing(true);
    await fetchContent();
  };

  if (!isAuthenticated) {
    return (
      <section className="section">
        <div className="container">
          <div className="card admin-card">
            <h2 className="section-title" style={{ marginBottom: 10 }}>
              Вход в админку
            </h2>
            <p className="section-lead" style={{ marginBottom: 14 }}>
              Введите логин и пароль администратора.
            </p>

            <form className="form-grid" onSubmit={submitLogin}>
              <label className="form-field full" htmlFor="admin-login">
                <span>Логин</span>
                <input
                  id="admin-login"
                  name="admin-login"
                  type="text"
                  value={login}
                  onChange={(event) => setLogin(event.target.value)}
                  placeholder="Введите логин"
                  autoComplete="username"
                />
              </label>

              <label className="form-field full" htmlFor="admin-password">
                <span>Пароль</span>
                <input
                  id="admin-password"
                  name="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Введите пароль"
                  autoComplete="current-password"
                />
              </label>

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={authBusy}>
                  {authBusy ? 'Входим...' : 'Войти'}
                </button>
              </div>
            </form>

            <p className={`form-note ${authError ? 'error' : ''}`} aria-live="polite">
              {authError}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="card admin-card">
            <p>Загрузка данных CMS...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container admin-layout">
        <div className="card admin-card">
          <h2 className="section-title" style={{ marginBottom: 10 }}>
            Админ-панель
          </h2>
          <p className="section-lead" style={{ marginBottom: 14 }}>
            Вы вошли как <strong>{adminIdentity}</strong>.
          </p>

          <div className="form-actions" style={{ marginTop: 14 }}>
            <button className="btn btn-outline" type="button" onClick={refreshData} disabled={refreshing}>
              {refreshing ? 'Обновляем...' : 'Обновить данные'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={logout} disabled={refreshing || newsBusy || galleryBusy}>
              Выйти
            </button>
          </div>

          {loadError && (
            <p className="form-note error" role="alert">
              {loadError}
            </p>
          )}
        </div>

        <div className="admin-grid">
          <div className="card admin-card">
            <h3>Публикация новости</h3>
            <form className="form-grid" onSubmit={submitNews}>
              <label className="form-field full" htmlFor="news-title">
                <span>Заголовок *</span>
                <input
                  id="news-title"
                  name="news-title"
                  type="text"
                  value={newsForm.title}
                  onChange={(event) => setNewsForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Например: Новая серия турниров в RUNA"
                  required
                />
              </label>

              <label className="form-field full" htmlFor="news-summary">
                <span>Короткое описание *</span>
                <textarea
                  id="news-summary"
                  name="news-summary"
                  value={newsForm.summary}
                  onChange={(event) => setNewsForm((prev) => ({ ...prev, summary: event.target.value }))}
                  placeholder="Кратко о событии (1-3 предложения)"
                  required
                />
              </label>

              <label className="form-field full" htmlFor="news-content">
                <span>Дополнительный текст</span>
                <textarea
                  id="news-content"
                  name="news-content"
                  value={newsForm.content}
                  onChange={(event) => setNewsForm((prev) => ({ ...prev, content: event.target.value }))}
                  placeholder="Подробности новости"
                />
              </label>

              <div className="form-field full">
                <span>Изображение новости</span>
                <div className="file-picker">
                  <input
                    ref={newsFileInputRef}
                    id="news-image-file"
                    name="news-image-file"
                    type="file"
                    className="file-picker-input"
                    accept="image/*"
                    onChange={(event) => setNewsFile(event.target.files?.[0] ?? null)}
                  />
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => newsFileInputRef.current?.click()}
                    disabled={newsBusy}
                  >
                    {newsFile ? 'Выбрать другое изображение' : 'Выбрать изображение'}
                  </button>
                  <p className="file-picker-name">{newsFile ? newsFile.name : 'Файл не выбран'}</p>
                </div>
              </div>

              <label className="form-field" htmlFor="news-source-url">
                <span>Ссылка на источник</span>
                <input
                  id="news-source-url"
                  name="news-source-url"
                  type="url"
                  value={newsForm.sourceUrl}
                  onChange={(event) => setNewsForm((prev) => ({ ...prev, sourceUrl: event.target.value }))}
                  placeholder="https://vk.com/..."
                />
              </label>

              <label className="form-field" htmlFor="news-published-at">
                <span>Дата публикации</span>
                <input
                  id="news-published-at"
                  name="news-published-at"
                  type="datetime-local"
                  value={newsForm.publishedAt}
                  onChange={(event) => setNewsForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
                />
              </label>

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={newsBusy}>
                  {newsBusy ? 'Публикуем...' : 'Опубликовать новость'}
                </button>
              </div>
            </form>

            <p className={`form-note ${newsMessage && newsMessage.includes('Ошибка') ? 'error' : ''}`} aria-live="polite">
              {newsMessage}
            </p>
          </div>

          <div className="card admin-card admin-gallery-card">
            <div className="admin-gallery-head">
              <h3>Добавить фото в галерею</h3>
              <p>Загрузите файл или укажите ссылку на изображение.</p>
            </div>

            <form className="form-grid gallery-form-grid" onSubmit={submitPhoto}>
              <div className="form-field full gallery-upload-field">
                <span>Файл изображения</span>
                <div className="gallery-upload-shell">
                  <input
                    ref={galleryFileInputRef}
                    id="gallery-file"
                    name="gallery-file"
                    type="file"
                    className="file-picker-input"
                    accept="image/*"
                    onChange={(event) => setGalleryFile(event.target.files?.[0] ?? null)}
                  />
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    disabled={galleryBusy}
                  >
                    {galleryFile ? 'Выбрать другой файл' : 'Выбрать файл'}
                  </button>
                  <p className={`gallery-file-status ${galleryFile ? 'is-selected' : ''}`}>
                    {galleryFile ? galleryFile.name : 'Файл не выбран'}
                  </p>
                </div>
              </div>

              <p className="gallery-separator" aria-hidden="true">
                или
              </p>

              <label className="form-field full" htmlFor="gallery-src">
                <span>Ссылка на фото</span>
                <input
                  id="gallery-src"
                  name="gallery-src"
                  type="text"
                  value={galleryForm.src}
                  onChange={(event) => setGalleryForm((prev) => ({ ...prev, src: event.target.value }))}
                  placeholder="/images/lounge.jpg или https://..."
                />
              </label>

              <label className="form-field full" htmlFor="gallery-alt">
                <span>Описание фото</span>
                <input
                  id="gallery-alt"
                  name="gallery-alt"
                  type="text"
                  value={galleryForm.alt}
                  onChange={(event) => setGalleryForm((prev) => ({ ...prev, alt: event.target.value }))}
                  placeholder="Описание для alt"
                />
              </label>

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={galleryBusy}>
                  {galleryBusy ? 'Сохраняем...' : 'Добавить фото'}
                </button>
              </div>
            </form>

            <p
              className={`form-note ${galleryMessage && galleryMessage.includes('Ошибка') ? 'error' : ''}`}
              aria-live="polite"
            >
              {galleryMessage}
            </p>
          </div>
        </div>

        <div className="admin-grid">
          <div className="card admin-card">
            <h3>Опубликованные новости</h3>
            <div className="admin-list">
              {news.length === 0 && <p className="admin-empty">Список новостей пуст.</p>}
              {news.map((item) => (
                <article className="admin-item" key={item.id}>
                  <div className="admin-item-head">
                    <strong>{item.title}</strong>
                    <button className="btn btn-ghost" type="button" onClick={() => removeNews(item.id)} disabled={newsBusy}>
                      Удалить
                    </button>
                  </div>
                  <p className="admin-meta">{formatDate(item.publishedAt)}</p>
                  <p>{item.summary}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="card admin-card">
            <h3>Фото в галерее</h3>
            <div className="admin-list">
              {photos.length === 0 && <p className="admin-empty">В галерее пока нет фото.</p>}
              {photos.map((item) => (
                <article className="admin-item admin-item-photo" key={item.id}>
                  <img src={item.src} alt={item.alt} loading="lazy" />
                  <div>
                    <div className="admin-item-head">
                      <strong>{item.alt || 'Фото клуба'}</strong>
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={() => removePhoto(item.id)}
                        disabled={galleryBusy}
                      >
                        Удалить
                      </button>
                    </div>
                    <p className="admin-meta">{formatDateTime(item.createdAt)}</p>
                    <p className="admin-path">{item.src}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
