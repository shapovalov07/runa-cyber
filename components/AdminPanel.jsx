'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { clubCities } from '@/data/clubs';
import { isVideoMediaSrc } from '@/lib/media';

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
const USER_ROLE_OPTIONS = [
  { value: 'admin', label: 'Администратор' },
  { value: 'owner', label: 'Владелец' },
];
const USER_ROLE_VALUES = new Set(USER_ROLE_OPTIONS.map((option) => option.value));
const GALLERY_SECTION_OPTIONS = [
  { value: 'home', label: 'Главная' },
  { value: 'clubs', label: 'Наши клубы' },
  { value: 'tournaments', label: 'Кибертурниры' },
];
const GALLERY_SECTION_VALUES = new Set(GALLERY_SECTION_OPTIONS.map((option) => option.value));
const CLUB_CITY_OPTIONS = [
  { value: '', label: 'Все города' },
  ...clubCities.map((city) => ({
    value: getText(city?.slug).toLowerCase(),
    label: getText(city?.city) || getText(city?.slug),
  })),
].filter((option) => option.value === '' || option.value);
const CLUB_CITY_VALUES = new Set(CLUB_CITY_OPTIONS.map((option) => option.value).filter(Boolean));

const normalizeGallerySection = (value) => {
  const section = getText(value).toLowerCase();
  return GALLERY_SECTION_VALUES.has(section) ? section : 'home';
};
const normalizeGalleryCitySlug = (value, section = 'clubs') => {
  if (normalizeGallerySection(section) !== 'clubs') return '';

  const slug = getText(value).toLowerCase();
  if (!slug) return '';

  return CLUB_CITY_VALUES.has(slug) ? slug : '';
};

const normalizeUserRole = (value) => {
  const role = getText(value).toLowerCase();
  return USER_ROLE_VALUES.has(role) ? role : 'admin';
};

const getUserRoleLabel = (value) =>
  USER_ROLE_OPTIONS.find((option) => option.value === normalizeUserRole(value))?.label || 'Администратор';

const getGallerySectionLabel = (value) =>
  GALLERY_SECTION_OPTIONS.find((option) => option.value === normalizeGallerySection(value))?.label || 'Главная';
const getGalleryCityLabel = (value) => {
  const slug = normalizeGalleryCitySlug(value);
  const selected = CLUB_CITY_OPTIONS.find((option) => option.value === slug);
  return selected?.label || 'Все города';
};

const HISTORY_ACTION_LABELS = {
  'profile.update': 'Профиль',
  'admin.create': 'Создание администратора',
  'admin.delete': 'Удаление администратора',
  'admin.password_reset': 'Сброс пароля администратора',
  'tournament-event.create': 'Создание мероприятия',
  'tournament-event.delete': 'Удаление мероприятия',
  'news.create': 'Создание новости',
  'news.update': 'Редактирование новости',
  'news.delete': 'Удаление новости',
  'gallery.create': 'Добавление фото',
  'gallery.delete': 'Удаление фото',
};
const sortAdminUsers = (list) =>
  [...list].sort((a, b) => {
    const leftRole = normalizeUserRole(a?.role);
    const rightRole = normalizeUserRole(b?.role);

    if (leftRole !== rightRole) {
      return leftRole === 'owner' ? -1 : 1;
    }

    return getText(a?.login).localeCompare(getText(b?.login), 'ru');
  });

const getHistoryActionLabel = (action) => HISTORY_ACTION_LABELS[getText(action)] || getText(action) || 'Изменение';

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

const createInitialNewsEditForm = () => ({
  title: '',
  summary: '',
  content: '',
  imageSrc: '',
  imageAlt: '',
  sourceUrl: '',
  publishedAt: toDateTimeLocal(),
});

const createNewsEditForm = (item) => ({
  title: getText(item?.title),
  summary: getText(item?.summary),
  content: getText(item?.content),
  imageSrc: getText(item?.imageSrc),
  imageAlt: getText(item?.imageAlt),
  sourceUrl: getText(item?.sourceUrl),
  publishedAt: toDateTimeLocal(item?.publishedAt),
});

const createInitialGalleryForm = () => ({
  section: 'home',
  citySlug: '',
  alt: '',
});

const createInitialTournamentEventForm = () => ({
  title: '',
  summary: '',
  imageSrc: '',
  imageAlt: '',
});

const createInitialProfileForm = () => ({
  firstName: '',
  lastName: '',
});

const createInitialAdminUserForm = () => ({
  login: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'admin',
});

const ADMIN_PANEL_SECTION_OPTIONS = [
  { value: 'profile', label: 'Профиль' },
  { value: 'news', label: 'Новости' },
  { value: 'gallery', label: 'Фото клуба' },
  { value: 'tournament-events', label: 'Мероприятия' },
  { value: 'history', label: 'История', ownerOnly: true },
];

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

const renderTournamentEventMedia = (item) => {
  const src = getText(item?.imageSrc);
  if (!src) return null;

  const mediaLabel = getText(item?.imageAlt) || getText(item?.title) || 'Мероприятие RUNA';
  if (isVideoMediaSrc(src)) {
    return <video src={src} aria-label={mediaLabel} controls preload="metadata" playsInline />;
  }

  return <img src={src} alt={mediaLabel} loading="lazy" />;
};

const renderNewsMedia = (item) => {
  const src = getText(item?.imageSrc);
  if (!src) return null;

  const mediaLabel = getText(item?.imageAlt) || getText(item?.title) || 'Новость RUNA';
  if (isVideoMediaSrc(src)) {
    return <video src={src} aria-label={mediaLabel} controls preload="metadata" playsInline />;
  }

  return <img src={src} alt={mediaLabel} loading="lazy" />;
};

const ADMIN_SESSION_KEY = 'runa-admin-session';

const readStoredAdminSession = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const login = getText(parsed?.login);
    const password = getText(parsed?.password);

    if (!login || !password) return null;

    return {
      login,
      password,
    };
  } catch {
    return null;
  }
};

const saveAdminSession = (session) => {
  if (typeof window === 'undefined') return;

  const login = getText(session?.login);
  const password = getText(session?.password);

  if (!login || !password) return;

  window.localStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({
      login,
      password,
    })
  );
};

const clearAdminSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
};

export default function AdminPanel() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [newsForm, setNewsForm] = useState(createInitialNewsForm);
  const [newsFile, setNewsFile] = useState(null);
  const [editingNewsId, setEditingNewsId] = useState('');
  const [editNewsForm, setEditNewsForm] = useState(createInitialNewsEditForm);
  const [editNewsFile, setEditNewsFile] = useState(null);
  const [galleryForm, setGalleryForm] = useState(createInitialGalleryForm);
  const [galleryFile, setGalleryFile] = useState(null);
  const [tournamentEventForm, setTournamentEventForm] = useState(createInitialTournamentEventForm);
  const [tournamentEventFile, setTournamentEventFile] = useState(null);
  const [profileForm, setProfileForm] = useState(createInitialProfileForm);
  const [adminUserForm, setAdminUserForm] = useState(createInitialAdminUserForm);
  const newsFileInputRef = useRef(null);
  const editNewsFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);
  const tournamentEventFileInputRef = useRef(null);

  const [news, setNews] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [tournamentEvents, setTournamentEvents] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminHistory, setAdminHistory] = useState([]);
  const [galleryViewSection, setGalleryViewSection] = useState('home');
  const [galleryViewCitySlug, setGalleryViewCitySlug] = useState('');
  const [activeAdminSection, setActiveAdminSection] = useState('news');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [restoringSession, setRestoringSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [newsBusy, setNewsBusy] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [tournamentEventsBusy, setTournamentEventsBusy] = useState(false);
  const [adminUsersBusy, setAdminUsersBusy] = useState(false);
  const [adminHistoryBusy, setAdminHistoryBusy] = useState(false);

  const [loadError, setLoadError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [newsMessage, setNewsMessage] = useState('');
  const [galleryMessage, setGalleryMessage] = useState('');
  const [tournamentEventsMessage, setTournamentEventsMessage] = useState('');
  const [adminUsersMessage, setAdminUsersMessage] = useState('');

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
  const isOwner = normalizeUserRole(currentUser?.role) === 'owner';
  const availableAdminSections = useMemo(
    () => ADMIN_PANEL_SECTION_OPTIONS.filter((section) => !section.ownerOnly || isOwner),
    [isOwner]
  );

  const visiblePhotos = useMemo(
    () => {
      const section = normalizeGallerySection(galleryViewSection);
      const bySection = photos.filter((item) => normalizeGallerySection(item?.section) === section);

      if (section !== 'clubs') return bySection;

      const targetCitySlug = normalizeGalleryCitySlug(galleryViewCitySlug, 'clubs');
      if (!targetCitySlug) return bySection;

      return bySection.filter((item) => normalizeGalleryCitySlug(item?.citySlug, 'clubs') === targetCitySlug);
    },
    [galleryViewCitySlug, galleryViewSection, photos]
  );

  useEffect(() => {
    if (availableAdminSections.some((section) => section.value === activeAdminSection)) return;
    setActiveAdminSection(availableAdminSections[0]?.value || 'news');
  }, [activeAdminSection, availableAdminSections]);

  useEffect(() => {
    if (normalizeGallerySection(galleryViewSection) === 'clubs') return;
    if (!galleryViewCitySlug) return;
    setGalleryViewCitySlug('');
  }, [galleryViewCitySlug, galleryViewSection]);

  const applyAuthorizedUser = (user, loginValue, passwordValue) => {
    setLogin(loginValue);
    setPassword(passwordValue);
    setCurrentUser(user);
    setProfileForm({
      firstName: user.firstName,
      lastName: user.lastName,
    });
    setProfileMessage('');
    setAuthError('');
    setIsAuthenticated(true);
  };

  const fetchContent = async (
    sessionUser = currentUser,
    sessionCredentials = { login: getText(login), password: getText(password) }
  ) => {
    setLoadError('');

    try {
      const [newsResponse, galleryResponse, tournamentEventsResponse] = await Promise.all([
        fetch('/api/news', { cache: 'no-store' }),
        fetch('/api/gallery', { cache: 'no-store' }),
        fetch('/api/tournament-events', { cache: 'no-store' }),
      ]);

      const [newsPayload, galleryPayload, tournamentEventsPayload] = await Promise.all([
        readResponse(newsResponse),
        readResponse(galleryResponse),
        readResponse(tournamentEventsResponse),
      ]);

      if (!newsResponse.ok || !newsPayload.ok) {
        throw new Error(newsPayload.error || 'Не удалось получить новости.');
      }

      if (!galleryResponse.ok || !galleryPayload.ok) {
        throw new Error(galleryPayload.error || 'Не удалось получить фото галереи.');
      }
      if (!tournamentEventsResponse.ok || !tournamentEventsPayload.ok) {
        throw new Error(tournamentEventsPayload.error || 'Не удалось получить мероприятия турниров.');
      }

      setNews(Array.isArray(newsPayload.news) ? newsPayload.news : []);
      setPhotos(Array.isArray(galleryPayload.photos) ? galleryPayload.photos : []);
      setTournamentEvents(Array.isArray(tournamentEventsPayload.items) ? tournamentEventsPayload.items : []);

      if (normalizeUserRole(sessionUser?.role) === 'owner') {
        setAdminHistoryBusy(true);
        try {
          const [usersResponse, historyResponse] = await Promise.all([
            fetch('/api/admin/users', {
              cache: 'no-store',
              headers: {
                'x-admin-login': getText(sessionCredentials?.login),
                'x-admin-password': getText(sessionCredentials?.password),
              },
            }),
            fetch('/api/admin/history?limit=200', {
              cache: 'no-store',
              headers: {
                'x-admin-login': getText(sessionCredentials?.login),
                'x-admin-password': getText(sessionCredentials?.password),
              },
            }),
          ]);

          const [usersPayload, historyPayload] = await Promise.all([
            readResponse(usersResponse),
            readResponse(historyResponse),
          ]);

          if (!usersResponse.ok || !usersPayload.ok) {
            throw new Error(usersPayload.error || 'Не удалось получить список администраторов.');
          }

          if (!historyResponse.ok || !historyPayload.ok) {
            throw new Error(historyPayload.error || 'Не удалось получить историю изменений.');
          }

          setAdminUsers(sortAdminUsers(Array.isArray(usersPayload.users) ? usersPayload.users : []));
          setAdminHistory(Array.isArray(historyPayload.history) ? historyPayload.history : []);
        } finally {
          setAdminHistoryBusy(false);
        }
      } else {
        setAdminUsers([]);
        setAdminHistory([]);
        setAdminHistoryBusy(false);
      }
    } catch (error) {
      setLoadError(error.message || 'Не удалось загрузить данные CMS.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const saved = readStoredAdminSession();

      if (!saved) {
        setRestoringSession(false);
        return;
      }

      try {
        setAuthBusy(true);

        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(saved),
        });

        const payload = await readResponse(response);

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || 'Сохраненная сессия недействительна.');
        }

        if (cancelled) return;

        const user = {
          login: getText(payload?.user?.login) || saved.login,
          firstName: getText(payload?.user?.firstName),
          lastName: getText(payload?.user?.lastName),
          role: normalizeUserRole(payload?.user?.role),
        };

        applyAuthorizedUser(user, saved.login, saved.password);
        saveAdminSession({
          login: saved.login,
          password: saved.password,
        });

        setLoading(true);
        await fetchContent(user, {
          login: saved.login,
          password: saved.password,
        });
      } catch {
        clearAdminSession();

        if (cancelled) return;

        setIsAuthenticated(false);
        setCurrentUser(null);
        setLogin('');
        setPassword('');
      } finally {
        if (cancelled) return;
        setAuthBusy(false);
        setRestoringSession(false);
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

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
        role: normalizeUserRole(payload?.user?.role),
      };

      applyAuthorizedUser(user, loginValue, passwordValue);
      saveAdminSession({
        login: loginValue,
        password: passwordValue,
      });
      setLoading(true);
      await fetchContent(user, {
        login: loginValue,
        password: passwordValue,
      });
    } catch (error) {
      setAuthError(error.message || 'Ошибка входа в админку.');
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLogin('');
    setPassword('');
    setNews([]);
    setPhotos([]);
    setTournamentEvents([]);
    setAdminUsers([]);
    setAdminHistory([]);
    setLoadError('');
    setProfileMessage('');
    setNewsMessage('');
    setGalleryMessage('');
    setTournamentEventsMessage('');
    setAdminUsersMessage('');
    setEditingNewsId('');
    setEditNewsForm(createInitialNewsEditForm);
    setEditNewsFile(null);
    setGalleryForm(createInitialGalleryForm);
    setGalleryFile(null);
    setTournamentEventForm(createInitialTournamentEventForm);
    setTournamentEventFile(null);
    setProfileForm(createInitialProfileForm);
    setAdminUserForm(createInitialAdminUserForm);
    setGalleryViewSection('home');
    setGalleryViewCitySlug('');
    setActiveAdminSection('news');
    if (galleryFileInputRef.current) {
      galleryFileInputRef.current.value = '';
    }
    if (tournamentEventFileInputRef.current) {
      tournamentEventFileInputRef.current.value = '';
    }
    setAdminUsersBusy(false);
    setAdminHistoryBusy(false);
    setTournamentEventsBusy(false);
    setRefreshing(false);
    setLoading(false);
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    setProfileMessage('');

    if (!(isAuthenticated && getText(login) && getText(password))) {
      setProfileMessage('Сначала войдите в админку.');
      return;
    }

    const firstName = getText(profileForm.firstName);
    const lastName = getText(profileForm.lastName);

    if (!firstName || !lastName) {
      setProfileMessage('Введите имя и фамилию.');
      return;
    }

    try {
      setProfileBusy(true);

      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: getText(login),
          password: getText(password),
          firstName,
          lastName,
        }),
      });

      const payload = await readResponse(response);

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Не удалось обновить профиль.');
      }

      const updatedUser = {
        login: getText(payload?.user?.login) || getText(login),
        firstName: getText(payload?.user?.firstName),
        lastName: getText(payload?.user?.lastName),
        role: normalizeUserRole(payload?.user?.role),
      };

      setCurrentUser(updatedUser);
      saveAdminSession({
        login: getText(login),
        password: getText(password),
      });
      setProfileForm({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      });
      setProfileMessage('Профиль обновлен.');
    } catch (error) {
      setProfileMessage(error.message || 'Ошибка обновления профиля.');
    } finally {
      setProfileBusy(false);
    }
  };

  const ensureCredentials = () => {
    if (isAuthenticated && getText(login) && getText(password)) return true;
    setNewsMessage('Сначала войдите в админку.');
    setGalleryMessage('Сначала войдите в админку.');
    setTournamentEventsMessage('Сначала войдите в админку.');
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

  const openNewsEdit = (item) => {
    setNewsMessage('');
    setEditingNewsId(item.id);
    setEditNewsForm(createNewsEditForm(item));
    setEditNewsFile(null);
    if (editNewsFileInputRef.current) {
      editNewsFileInputRef.current.value = '';
    }
  };

  const cancelNewsEdit = () => {
    setEditingNewsId('');
    setEditNewsForm(createInitialNewsEditForm);
    setEditNewsFile(null);
    if (editNewsFileInputRef.current) {
      editNewsFileInputRef.current.value = '';
    }
  };

  const submitEditedNews = async (event, id) => {
    event.preventDefault();
    setNewsMessage('');

    if (!ensureCredentials()) return;
    if (!id || editingNewsId !== id) return;
    if (!getText(editNewsForm.title) || !getText(editNewsForm.summary)) {
      setNewsMessage('Для новости обязательно заполните заголовок и короткое описание.');
      return;
    }

    try {
      setNewsBusy(true);

      const formData = new FormData();
      formData.set('login', getText(login));
      formData.set('password', getText(password));
      formData.set('title', getText(editNewsForm.title));
      formData.set('summary', getText(editNewsForm.summary));
      formData.set('content', getText(editNewsForm.content));
      formData.set('imageSrc', getText(editNewsForm.imageSrc));
      formData.set('imageAlt', getText(editNewsForm.imageAlt));
      formData.set('sourceUrl', getText(editNewsForm.sourceUrl));
      formData.set('publishedAt', getText(editNewsForm.publishedAt));

      if (editNewsFile) {
        formData.set('photo', editNewsFile);
      }

      const response = await fetch(`/api/news/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: formData,
      });

      const payload = await readResponse(response);

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Не удалось обновить новость.');
      }

      setNews((prev) => {
        const next = prev.map((item) => (item.id === id ? payload.item : item));
        next.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        return next;
      });
      cancelNewsEdit();
      setNewsMessage('Новость обновлена.');
    } catch (error) {
      setNewsMessage(error.message || 'Ошибка обновления новости.');
    } finally {
      setNewsBusy(false);
    }
  };

  const submitPhoto = async (event) => {
    event.preventDefault();
    setGalleryMessage('');

    if (!ensureCredentials()) return;
    const targetSection = normalizeGallerySection(galleryForm.section);
    const targetCitySlug = normalizeGalleryCitySlug(galleryForm.citySlug, targetSection);
    if (targetSection === 'clubs' && getText(galleryForm.citySlug) && !targetCitySlug) {
      setGalleryMessage('Выберите корректный город для раздела «Наши клубы».');
      return;
    }
    if (!galleryFile) {
      setGalleryMessage('Добавьте файл изображения.');
      return;
    }

    try {
      setGalleryBusy(true);

      const formData = new FormData();
      formData.set('login', getText(login));
      formData.set('password', getText(password));
      formData.set('section', targetSection);
      formData.set('citySlug', targetCitySlug);
      formData.set('alt', getText(galleryForm.alt));
      formData.set('photo', galleryFile);

      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });

      const payload = await readResponse(response);

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Не удалось добавить фото.');
      }

      setPhotos((prev) => [payload.item, ...prev]);
      setGalleryViewSection(targetSection);
      setGalleryViewCitySlug(targetSection === 'clubs' ? targetCitySlug : '');
      setGalleryForm({
        ...createInitialGalleryForm(),
        section: targetSection,
        citySlug: targetSection === 'clubs' ? targetCitySlug : '',
      });
      setGalleryFile(null);
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = '';
      }
      const cityMessage = targetSection === 'clubs' ? `, город «${getGalleryCityLabel(targetCitySlug)}»` : '';
      setGalleryMessage(`Фото добавлено в раздел «${getGallerySectionLabel(targetSection)}»${cityMessage}.`);
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

  const submitTournamentEvent = async (event) => {
    event.preventDefault();
    setTournamentEventsMessage('');

    if (!ensureCredentials()) return;
    if (!getText(tournamentEventForm.title) || !getText(tournamentEventForm.summary)) {
      setTournamentEventsMessage('Заполните название и краткое описание мероприятия.');
      return;
    }
    if (!tournamentEventFile && !getText(tournamentEventForm.imageSrc)) {
      setTournamentEventsMessage('Добавьте медиафайл (фото/GIF/видео) или укажите ссылку.');
      return;
    }

    try {
      setTournamentEventsBusy(true);

      const formData = new FormData();
      formData.set('login', getText(login));
      formData.set('password', getText(password));
      formData.set('title', getText(tournamentEventForm.title));
      formData.set('summary', getText(tournamentEventForm.summary));
      formData.set('imageSrc', getText(tournamentEventForm.imageSrc));
      formData.set('imageAlt', getText(tournamentEventForm.imageAlt));

      if (tournamentEventFile) {
        formData.set('photo', tournamentEventFile);
      }

      const response = await fetch('/api/tournament-events', {
        method: 'POST',
        body: formData,
      });

      const payload = await readResponse(response);

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Не удалось добавить мероприятие.');
      }

      setTournamentEvents((prev) => [payload.item, ...prev.filter((item) => item.id !== payload.item.id)]);
      setTournamentEventForm(createInitialTournamentEventForm);
      setTournamentEventFile(null);
      if (tournamentEventFileInputRef.current) {
        tournamentEventFileInputRef.current.value = '';
      }
      setTournamentEventsMessage('Мероприятие добавлено.');
    } catch (error) {
      setTournamentEventsMessage(error.message || 'Ошибка добавления мероприятия.');
    } finally {
      setTournamentEventsBusy(false);
    }
  };

  const removeTournamentEvent = async (id) => {
    setTournamentEventsMessage('');

    if (!ensureCredentials()) return;
    if (!id) return;
    if (!window.confirm('Удалить это мероприятие?')) return;

    try {
      setTournamentEventsBusy(true);

      const response = await fetch(`/api/tournament-events/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      const payload = await readResponse(response);

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Не удалось удалить мероприятие.');
      }

      setTournamentEvents((prev) => prev.filter((item) => item.id !== id));
      setTournamentEventsMessage('Мероприятие удалено.');
    } catch (error) {
      setTournamentEventsMessage(error.message || 'Ошибка удаления мероприятия.');
    } finally {
      setTournamentEventsBusy(false);
    }
  };

  const submitAdminUser = async (event) => {
    event.preventDefault();
    setAdminUsersMessage('');

    if (!ensureCredentials()) return;
    if (!isOwner) {
      setAdminUsersMessage('Доступно только владельцу.');
      return;
    }

    const payload = {
      login: getText(adminUserForm.login),
      password: getText(adminUserForm.password),
      firstName: getText(adminUserForm.firstName),
      lastName: getText(adminUserForm.lastName),
      role: normalizeUserRole(adminUserForm.role),
    };

    if (!payload.login || !payload.password || !payload.firstName || !payload.lastName) {
      setAdminUsersMessage('Заполните все поля нового пользователя.');
      return;
    }

    try {
      setAdminUsersBusy(true);

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await readResponse(response);

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Не удалось создать пользователя.');
      }

      setAdminUsers((prev) => sortAdminUsers([result.user, ...prev.filter((item) => item.login !== result.user.login)]));
      setAdminUserForm(createInitialAdminUserForm);
      setAdminUsersMessage(`Пользователь ${result.user.login} создан.`);
      setRefreshing(true);
      await fetchContent(currentUser, {
        login: getText(login),
        password: getText(password),
      });
    } catch (error) {
      setAdminUsersMessage(error.message || 'Ошибка создания пользователя.');
    } finally {
      setAdminUsersBusy(false);
    }
  };

  const removeAdminUser = async (targetLogin) => {
    setAdminUsersMessage('');

    if (!ensureCredentials()) return;
    if (!isOwner) {
      setAdminUsersMessage('Доступно только владельцу.');
      return;
    }
    if (!targetLogin) return;
    if (!window.confirm(`Удалить пользователя ${targetLogin}?`)) return;

    try {
      setAdminUsersBusy(true);

      const response = await fetch(`/api/admin/users/${encodeURIComponent(targetLogin)}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      const result = await readResponse(response);

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Не удалось удалить пользователя.');
      }

      setAdminUsers((prev) => prev.filter((item) => item.login !== targetLogin));
      setAdminUsersMessage(`Пользователь ${targetLogin} удален.`);
      setRefreshing(true);
      await fetchContent(currentUser, {
        login: getText(login),
        password: getText(password),
      });
    } catch (error) {
      setAdminUsersMessage(error.message || 'Ошибка удаления пользователя.');
    } finally {
      setAdminUsersBusy(false);
    }
  };

  const resetAdminPassword = async (targetLogin, targetRole) => {
    setAdminUsersMessage('');

    if (!ensureCredentials()) return;
    if (!isOwner) {
      setAdminUsersMessage('Доступно только владельцу.');
      return;
    }
    if (!targetLogin) return;
    const isSelfPasswordChange = targetLogin === getText(currentUser?.login);
    if (normalizeUserRole(targetRole) !== 'admin' && !isSelfPasswordChange) {
      setAdminUsersMessage('Сброс пароля доступен для администраторов или для вашего аккаунта.');
      return;
    }

    const enteredPassword = window.prompt(`Введите новый пароль для ${targetLogin}:`, '');
    if (enteredPassword === null) return;

    const nextPassword = getText(enteredPassword);
    if (!nextPassword) {
      setAdminUsersMessage('Введите новый пароль.');
      return;
    }

    try {
      setAdminUsersBusy(true);

      const response = await fetch(`/api/admin/users/${encodeURIComponent(targetLogin)}`, {
        method: 'PATCH',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: nextPassword,
        }),
      });

      const result = await readResponse(response);

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Не удалось сбросить пароль.');
      }

      const sessionLogin = getText(login);
      const sessionPassword = isSelfPasswordChange ? nextPassword : getText(password);

      if (isSelfPasswordChange) {
        setPassword(sessionPassword);
        saveAdminSession({
          login: sessionLogin,
          password: sessionPassword,
        });
      }

      setAdminUsersMessage(`Пароль пользователя ${targetLogin} обновлен.`);
      setRefreshing(true);
      await fetchContent(currentUser, {
        login: sessionLogin,
        password: sessionPassword,
      });
    } catch (error) {
      setAdminUsersMessage(error.message || 'Ошибка сброса пароля.');
    } finally {
      setAdminUsersBusy(false);
    }
  };

  const refreshData = async () => {
    if (!isAuthenticated) return;
    setRefreshing(true);
    await fetchContent(currentUser, {
      login: getText(login),
      password: getText(password),
    });
  };

  if (restoringSession) {
    return (
      <section className="section">
        <div className="container">
          <div className="card admin-card">
            <p>Проверяем сохраненную сессию...</p>
          </div>
        </div>
      </section>
    );
  }

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
            Вы вошли как <strong>{adminIdentity}</strong> ({getUserRoleLabel(currentUser?.role)}).
          </p>

          <div className="form-actions" style={{ marginTop: 14 }}>
            <button
              className="btn btn-outline"
              type="button"
              onClick={refreshData}
              disabled={
                refreshing ||
                profileBusy ||
                newsBusy ||
                galleryBusy ||
                tournamentEventsBusy ||
                adminUsersBusy ||
                adminHistoryBusy
              }
            >
              {refreshing ? 'Обновляем...' : 'Обновить данные'}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={logout}
              disabled={
                refreshing ||
                profileBusy ||
                newsBusy ||
                galleryBusy ||
                tournamentEventsBusy ||
                adminUsersBusy ||
                adminHistoryBusy
              }
            >
              Выйти
            </button>
          </div>

          <div className="form-field full" style={{ marginTop: 4 }}>
            <span>Раздел админки</span>
            <div className="contacts-city-buttons admin-section-buttons">
              {availableAdminSections.map((section) => (
                <button
                  key={section.value}
                  className={`clubs-picker-link ${activeAdminSection === section.value ? 'is-active' : ''}`}
                  type="button"
                  onClick={() => setActiveAdminSection(section.value)}
                  aria-pressed={activeAdminSection === section.value}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {activeAdminSection === 'profile' && (
            <div className="admin-profile-box">
            <h3>Профиль пользователя</h3>
            <p className="admin-profile-lead">Можно изменить только имя и фамилию. Логин фиксирован для вашего аккаунта.</p>

            <form className="form-grid admin-profile-form" onSubmit={submitProfile}>
              <label className="form-field full" htmlFor="admin-profile-login">
                <span>Логин</span>
                <input id="admin-profile-login" name="admin-profile-login" type="text" value={getText(currentUser?.login)} readOnly />
              </label>

              <label className="form-field" htmlFor="admin-profile-first-name">
                <span>Имя</span>
                <input
                  id="admin-profile-first-name"
                  name="admin-profile-first-name"
                  type="text"
                  value={profileForm.firstName}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  placeholder="Введите имя"
                  required
                />
              </label>

              <label className="form-field" htmlFor="admin-profile-last-name">
                <span>Фамилия</span>
                <input
                  id="admin-profile-last-name"
                  name="admin-profile-last-name"
                  type="text"
                  value={profileForm.lastName}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  placeholder="Введите фамилию"
                  required
                />
              </label>

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={profileBusy}>
                  {profileBusy ? 'Сохраняем...' : 'Сохранить профиль'}
                </button>
              </div>
            </form>

            <p className={`form-note ${profileMessage && profileMessage.includes('Ошибка') ? 'error' : ''}`} aria-live="polite">
              {profileMessage}
            </p>
            </div>
          )}

          {isOwner && activeAdminSection === 'profile' && (
            <div className="admin-profile-box">
              <h3>Управление администраторами</h3>
              <p className="admin-profile-lead">Только владелец может добавлять и удалять пользователей админки.</p>

              <form className="form-grid admin-profile-form" onSubmit={submitAdminUser}>
                <label className="form-field" htmlFor="new-admin-login">
                  <span>Логин *</span>
                  <input
                    id="new-admin-login"
                    name="new-admin-login"
                    type="text"
                    value={adminUserForm.login}
                    onChange={(event) => setAdminUserForm((prev) => ({ ...prev, login: event.target.value }))}
                    placeholder="new_admin"
                    required
                  />
                </label>

                <label className="form-field" htmlFor="new-admin-password">
                  <span>Пароль *</span>
                  <input
                    id="new-admin-password"
                    name="new-admin-password"
                    type="text"
                    value={adminUserForm.password}
                    onChange={(event) => setAdminUserForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Введите пароль"
                    required
                  />
                </label>

                <label className="form-field" htmlFor="new-admin-first-name">
                  <span>Имя *</span>
                  <input
                    id="new-admin-first-name"
                    name="new-admin-first-name"
                    type="text"
                    value={adminUserForm.firstName}
                    onChange={(event) => setAdminUserForm((prev) => ({ ...prev, firstName: event.target.value }))}
                    placeholder="Введите имя"
                    required
                  />
                </label>

                <label className="form-field" htmlFor="new-admin-last-name">
                  <span>Фамилия *</span>
                  <input
                    id="new-admin-last-name"
                    name="new-admin-last-name"
                    type="text"
                    value={adminUserForm.lastName}
                    onChange={(event) => setAdminUserForm((prev) => ({ ...prev, lastName: event.target.value }))}
                    placeholder="Введите фамилию"
                    required
                  />
                </label>

                <label className="form-field full" htmlFor="new-admin-role">
                  <span>Роль *</span>
                  <select
                    id="new-admin-role"
                    name="new-admin-role"
                    value={adminUserForm.role}
                    onChange={(event) => setAdminUserForm((prev) => ({ ...prev, role: normalizeUserRole(event.target.value) }))}
                  >
                    {USER_ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="form-actions">
                  <button className="btn btn-primary" type="submit" disabled={adminUsersBusy}>
                    {adminUsersBusy ? 'Сохраняем...' : 'Добавить пользователя'}
                  </button>
                </div>
              </form>

              <p className={`form-note ${adminUsersMessage && adminUsersMessage.includes('Ошибка') ? 'error' : ''}`} aria-live="polite">
                {adminUsersMessage}
              </p>

              <div className="admin-list">
                {adminUsers.length === 0 && <p className="admin-empty">Пользователи админки пока не добавлены.</p>}
                {adminUsers.map((user) => (
                  <article className="admin-item" key={user.login}>
                    <div className="admin-item-head">
                      <strong>
                        {user.firstName} {user.lastName}
                      </strong>
                      <div className="admin-item-actions">
                        <button
                          className="btn btn-outline"
                          type="button"
                          onClick={() => resetAdminPassword(user.login, user.role)}
                          disabled={
                            adminUsersBusy ||
                            (normalizeUserRole(user.role) !== 'admin' && user.login !== getText(currentUser?.login))
                          }
                        >
                          Сбросить пароль
                        </button>
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => removeAdminUser(user.login)}
                          disabled={adminUsersBusy || user.login === currentUser?.login}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                    <p className="admin-meta">{getUserRoleLabel(user.role)}</p>
                    <p className="admin-path">{user.login}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {loadError && (
            <p className="form-note error" role="alert">
              {loadError}
            </p>
          )}
        </div>

        {(activeAdminSection === 'news' ||
          activeAdminSection === 'gallery' ||
          activeAdminSection === 'tournament-events') && (
          <div className="admin-grid admin-grid-single">
            {activeAdminSection === 'news' && <div className="card admin-card">
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
                <span>Медиа новости (фото, GIF, видео)</span>
                <div className="file-picker">
                  <input
                    ref={newsFileInputRef}
                    id="news-image-file"
                    name="news-image-file"
                    type="file"
                    className="file-picker-input"
                    accept="image/*,video/*,.gif"
                    onChange={(event) => setNewsFile(event.target.files?.[0] ?? null)}
                  />
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => newsFileInputRef.current?.click()}
                    disabled={newsBusy}
                  >
                    {newsFile ? 'Выбрать другой файл' : 'Выбрать файл'}
                  </button>
                  <p className="file-picker-name">{newsFile ? newsFile.name : 'Файл не выбран'}</p>
                </div>
              </div>

              <label className="form-field" htmlFor="news-image-src">
                <span>Или ссылка на медиа</span>
                <input
                  id="news-image-src"
                  name="news-image-src"
                  type="text"
                  value={newsForm.imageSrc}
                  onChange={(event) => setNewsForm((prev) => ({ ...prev, imageSrc: event.target.value }))}
                  placeholder="/uploads/news/clip.mp4 или https://..."
                />
              </label>

              <label className="form-field" htmlFor="news-image-alt">
                <span>Описание медиа</span>
                <input
                  id="news-image-alt"
                  name="news-image-alt"
                  type="text"
                  value={newsForm.imageAlt}
                  onChange={(event) => setNewsForm((prev) => ({ ...prev, imageAlt: event.target.value }))}
                  placeholder="Новость RUNA"
                />
              </label>

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
            </div>}

            {activeAdminSection === 'gallery' && <div className="card admin-card admin-gallery-card">
            <div className="admin-gallery-head">
              <h3>Добавить фото в галерею</h3>
              <p>Загрузите файл изображения.</p>
            </div>

            <form className="form-grid gallery-form-grid" onSubmit={submitPhoto}>
              <div className="form-field full">
                <span>Раздел сайта *</span>
                <div className="contacts-city-buttons gallery-section-buttons">
                  {GALLERY_SECTION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={`clubs-picker-link ${normalizeGallerySection(galleryForm.section) === option.value ? 'is-active' : ''}`}
                      type="button"
                      onClick={() =>
                        setGalleryForm((prev) => ({
                          ...prev,
                          section: option.value,
                          citySlug: option.value === 'clubs' ? prev.citySlug : '',
                        }))
                      }
                      aria-pressed={normalizeGallerySection(galleryForm.section) === option.value}
                      disabled={galleryBusy}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {normalizeGallerySection(galleryForm.section) === 'clubs' && (
                <div className="form-field full">
                  <span>Город для фото</span>
                  <div className="contacts-city-buttons gallery-city-buttons">
                    {CLUB_CITY_OPTIONS.map((option) => (
                      <button
                        key={option.value || 'all-cities'}
                        className={`clubs-picker-link ${
                          normalizeGalleryCitySlug(galleryForm.citySlug, 'clubs') === option.value ? 'is-active' : ''
                        }`}
                        type="button"
                        onClick={() => setGalleryForm((prev) => ({ ...prev, citySlug: option.value }))}
                        aria-pressed={normalizeGalleryCitySlug(galleryForm.citySlug, 'clubs') === option.value}
                        disabled={galleryBusy}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="form-note">Если фото универсальное, оставьте «Все города».</p>
                </div>
              )}

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
            </div>}

            {activeAdminSection === 'tournament-events' && <div className="card admin-card">
            <h3>Добавить мероприятие кибертурниров</h3>
            <form className="form-grid" onSubmit={submitTournamentEvent}>
              <label className="form-field full" htmlFor="tournament-event-title">
                <span>Название *</span>
                <input
                  id="tournament-event-title"
                  name="tournament-event-title"
                  type="text"
                  value={tournamentEventForm.title}
                  onChange={(event) => setTournamentEventForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Например: FC 26 WEEKLY"
                  required
                />
              </label>

              <label className="form-field full" htmlFor="tournament-event-summary">
                <span>Краткое описание *</span>
                <textarea
                  id="tournament-event-summary"
                  name="tournament-event-summary"
                  value={tournamentEventForm.summary}
                  onChange={(event) => setTournamentEventForm((prev) => ({ ...prev, summary: event.target.value }))}
                  placeholder="1-2 предложения о формате мероприятия"
                  required
                />
              </label>

              <div className="form-field full">
                <span>Медиа мероприятия (фото, GIF, видео)</span>
                <div className="file-picker">
                  <input
                    ref={tournamentEventFileInputRef}
                    id="tournament-event-image-file"
                    name="tournament-event-image-file"
                    type="file"
                    className="file-picker-input"
                    accept="image/*,video/*,.gif"
                    onChange={(event) => setTournamentEventFile(event.target.files?.[0] ?? null)}
                  />
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => tournamentEventFileInputRef.current?.click()}
                    disabled={tournamentEventsBusy}
                  >
                    {tournamentEventFile ? 'Выбрать другой файл' : 'Выбрать файл'}
                  </button>
                  <p className="file-picker-name">{tournamentEventFile ? tournamentEventFile.name : 'Файл не выбран'}</p>
                </div>
              </div>

              <label className="form-field" htmlFor="tournament-event-image-src">
                <span>Или ссылка на медиа</span>
                <input
                  id="tournament-event-image-src"
                  name="tournament-event-image-src"
                  type="text"
                  value={tournamentEventForm.imageSrc}
                  onChange={(event) => setTournamentEventForm((prev) => ({ ...prev, imageSrc: event.target.value }))}
                  placeholder="/uploads/tournament-events/clip.mp4 или https://..."
                />
              </label>

              <label className="form-field" htmlFor="tournament-event-image-alt">
                <span>Описание медиа</span>
                <input
                  id="tournament-event-image-alt"
                  name="tournament-event-image-alt"
                  type="text"
                  value={tournamentEventForm.imageAlt}
                  onChange={(event) => setTournamentEventForm((prev) => ({ ...prev, imageAlt: event.target.value }))}
                  placeholder="Турнир RUNA"
                />
              </label>

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={tournamentEventsBusy}>
                  {tournamentEventsBusy ? 'Сохраняем...' : 'Добавить мероприятие'}
                </button>
              </div>
            </form>

            <p
              className={`form-note ${tournamentEventsMessage && tournamentEventsMessage.includes('Ошибка') ? 'error' : ''}`}
              aria-live="polite"
            >
              {tournamentEventsMessage}
            </p>
            </div>}
          </div>
        )}

        {(activeAdminSection === 'news' ||
          activeAdminSection === 'gallery' ||
          activeAdminSection === 'tournament-events' ||
          activeAdminSection === 'history') && (
          <div className="admin-grid admin-grid-single">
            {activeAdminSection === 'news' && <div className="card admin-card">
            <h3>Опубликованные новости</h3>
            <div className="admin-list">
              {news.length === 0 && <p className="admin-empty">Список новостей пуст.</p>}
              {news.map((item) => {
                const isEditing = editingNewsId === item.id;

                return (
                  <article className="admin-item" key={item.id}>
                    <div className="admin-item-head">
                      <strong>{item.title}</strong>
                      <div className="admin-item-actions">
                        <button
                          className="btn btn-outline"
                          type="button"
                          onClick={() => (isEditing ? cancelNewsEdit() : openNewsEdit(item))}
                          disabled={newsBusy}
                        >
                          {isEditing ? 'Отмена' : 'Редактировать'}
                        </button>
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => removeNews(item.id)}
                          disabled={newsBusy}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>

                    <p className="admin-meta">{formatDate(item.publishedAt)}</p>

                    {isEditing ? (
                      <form className="form-grid admin-edit-form" onSubmit={(event) => submitEditedNews(event, item.id)}>
                        <label className="form-field full" htmlFor={`news-edit-title-${item.id}`}>
                          <span>Заголовок *</span>
                          <input
                            id={`news-edit-title-${item.id}`}
                            type="text"
                            value={editNewsForm.title}
                            onChange={(event) => setEditNewsForm((prev) => ({ ...prev, title: event.target.value }))}
                            required
                          />
                        </label>

                        <label className="form-field full" htmlFor={`news-edit-summary-${item.id}`}>
                          <span>Короткое описание *</span>
                          <textarea
                            id={`news-edit-summary-${item.id}`}
                            value={editNewsForm.summary}
                            onChange={(event) => setEditNewsForm((prev) => ({ ...prev, summary: event.target.value }))}
                            required
                          />
                        </label>

                        <label className="form-field full" htmlFor={`news-edit-content-${item.id}`}>
                          <span>Дополнительный текст</span>
                          <textarea
                            id={`news-edit-content-${item.id}`}
                            value={editNewsForm.content}
                            onChange={(event) => setEditNewsForm((prev) => ({ ...prev, content: event.target.value }))}
                          />
                        </label>

                        <div className="form-field full">
                          <span>Заменить медиа (фото, GIF, видео)</span>
                          <div className="file-picker">
                            <input
                              ref={editNewsFileInputRef}
                              id={`news-edit-image-file-${item.id}`}
                              type="file"
                              className="file-picker-input"
                              accept="image/*,video/*,.gif"
                              onChange={(event) => setEditNewsFile(event.target.files?.[0] ?? null)}
                            />
                            <button
                              className="btn btn-outline"
                              type="button"
                              onClick={() => editNewsFileInputRef.current?.click()}
                              disabled={newsBusy}
                            >
                              {editNewsFile ? 'Выбрать другой файл' : 'Выбрать файл'}
                            </button>
                            <p className="file-picker-name">{editNewsFile ? editNewsFile.name : 'Оставить текущее медиа'}</p>
                          </div>
                        </div>

                        <label className="form-field" htmlFor={`news-edit-image-src-${item.id}`}>
                          <span>Или ссылка на медиа</span>
                          <input
                            id={`news-edit-image-src-${item.id}`}
                            type="text"
                            value={editNewsForm.imageSrc}
                            onChange={(event) => setEditNewsForm((prev) => ({ ...prev, imageSrc: event.target.value }))}
                            placeholder="/uploads/news/clip.mp4 или https://..."
                          />
                        </label>

                        <label className="form-field" htmlFor={`news-edit-image-alt-${item.id}`}>
                          <span>Описание медиа</span>
                          <input
                            id={`news-edit-image-alt-${item.id}`}
                            type="text"
                            value={editNewsForm.imageAlt}
                            onChange={(event) => setEditNewsForm((prev) => ({ ...prev, imageAlt: event.target.value }))}
                            placeholder="Новость RUNA"
                          />
                        </label>

                        <label className="form-field" htmlFor={`news-edit-source-url-${item.id}`}>
                          <span>Ссылка на источник</span>
                          <input
                            id={`news-edit-source-url-${item.id}`}
                            type="url"
                            value={editNewsForm.sourceUrl}
                            onChange={(event) => setEditNewsForm((prev) => ({ ...prev, sourceUrl: event.target.value }))}
                            placeholder="https://vk.com/..."
                          />
                        </label>

                        <label className="form-field" htmlFor={`news-edit-published-at-${item.id}`}>
                          <span>Дата публикации</span>
                          <input
                            id={`news-edit-published-at-${item.id}`}
                            type="datetime-local"
                            value={editNewsForm.publishedAt}
                            onChange={(event) => setEditNewsForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
                          />
                        </label>

                        <div className="form-actions">
                          <button className="btn btn-primary" type="submit" disabled={newsBusy}>
                            {newsBusy ? 'Сохраняем...' : 'Сохранить'}
                          </button>
                          <button className="btn btn-ghost" type="button" onClick={cancelNewsEdit} disabled={newsBusy}>
                            Отмена
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        {item.imageSrc ? <div className="admin-news-media-preview">{renderNewsMedia(item)}</div> : null}
                        <div>
                          <p>{item.summary}</p>
                          {item.content ? <p>{item.content}</p> : null}
                          <p className="admin-path">{item.imageSrc || 'Медиа не указано'}</p>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
            </div>}

            {activeAdminSection === 'gallery' && <div className="card admin-card">
            <h3>Фото в галереях</h3>
            <div className="form-field full" style={{ marginBottom: 12 }}>
              <span>Показать раздел</span>
              <div className="contacts-city-buttons gallery-section-buttons">
                {GALLERY_SECTION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`clubs-picker-link ${galleryViewSection === option.value ? 'is-active' : ''}`}
                    type="button"
                    onClick={() => setGalleryViewSection(option.value)}
                    aria-pressed={galleryViewSection === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {normalizeGallerySection(galleryViewSection) === 'clubs' && (
              <div className="form-field full" style={{ marginBottom: 12 }}>
                <span>Фильтр по городу</span>
                <div className="contacts-city-buttons gallery-city-buttons">
                  {CLUB_CITY_OPTIONS.map((option) => (
                    <button
                      key={option.value || 'all-cities-filter'}
                      className={`clubs-picker-link ${
                        normalizeGalleryCitySlug(galleryViewCitySlug, 'clubs') === option.value ? 'is-active' : ''
                      }`}
                      type="button"
                      onClick={() => setGalleryViewCitySlug(option.value)}
                      aria-pressed={normalizeGalleryCitySlug(galleryViewCitySlug, 'clubs') === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="admin-list">
              {visiblePhotos.length === 0 && (
                <p className="admin-empty">
                  {normalizeGallerySection(galleryViewSection) === 'clubs' && normalizeGalleryCitySlug(galleryViewCitySlug)
                    ? `В городе «${getGalleryCityLabel(
                        galleryViewCitySlug
                      )}» пока нет фото в разделе «${getGallerySectionLabel(galleryViewSection)}».`
                    : `В разделе «${getGallerySectionLabel(galleryViewSection)}» пока нет фото.`}
                </p>
              )}
              {visiblePhotos.map((item) => (
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
                    <p className="admin-meta">
                      {getGallerySectionLabel(item.section)}
                      {normalizeGallerySection(item.section) === 'clubs' ? ` · ${getGalleryCityLabel(item.citySlug)}` : ''}
                      {` · ${formatDateTime(item.createdAt)}`}
                    </p>
                    <p className="admin-path">{item.src}</p>
                  </div>
                </article>
              ))}
            </div>
            </div>}

            {activeAdminSection === 'tournament-events' && <div className="card admin-card">
            <h3>Мероприятия кибертурниров</h3>
            <div className="admin-list">
              {tournamentEvents.length === 0 && <p className="admin-empty">Список мероприятий пока пуст.</p>}
              {tournamentEvents.map((item) => (
                <article className="admin-item admin-item-photo" key={item.id}>
                  {renderTournamentEventMedia(item)}
                  <div>
                    <div className="admin-item-head">
                      <strong>{item.title}</strong>
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={() => removeTournamentEvent(item.id)}
                        disabled={tournamentEventsBusy}
                      >
                        Удалить
                      </button>
                    </div>
                    <p className="admin-meta">{formatDateTime(item.createdAt)}</p>
                    <p>{item.summary}</p>
                    <p className="admin-path">{item.imageSrc}</p>
                  </div>
                </article>
              ))}
            </div>
            </div>}

            {isOwner && activeAdminSection === 'history' && (
              <div className="card admin-card">
              <h3>История изменений</h3>
              {adminHistoryBusy ? <p className="admin-empty">Загружаем историю...</p> : null}
              <div className="admin-list">
                {adminHistory.length === 0 && <p className="admin-empty">История изменений пока пустая.</p>}
                {adminHistory.map((entry) => (
                  <article className="admin-item" key={entry.id}>
                    <div className="admin-item-head">
                      <strong>{getHistoryActionLabel(entry.action)}</strong>
                    </div>
                    <p className="admin-meta">{formatDateTime(entry.createdAt)}</p>
                    <p>
                      Исполнитель: {entry.actorLogin} ({getUserRoleLabel(entry.actorRole)})
                    </p>
                    <p>{entry.summary || 'Изменение без описания.'}</p>
                    {entry.targetId ? <p className="admin-path">{entry.targetId}</p> : null}
                  </article>
                ))}
              </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
