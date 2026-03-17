import { promises as fs } from 'node:fs';
import path from 'node:path';

const getText = (value) => (typeof value === 'string' ? value.trim() : '');
const ADMIN_FILE = path.join(process.cwd(), 'data', 'cms', 'admin.json');
const ADMIN_HISTORY_LIMIT = 2000;
const ADMIN_ROLES = ['owner', 'admin'];
const ADMIN_ROLE_SET = new Set(ADMIN_ROLES);

const DEFAULT_ADMIN_DATA = {
  users: [
    {
      login: 'admin',
      password: '123456789',
      firstName: 'Владелец',
      lastName: 'RUNA',
      role: 'owner',
      createdAt: '2026-03-12T09:00:00.000Z',
    },
  ],
  history: [],
};

const toIsoDate = (value, fallback = new Date().toISOString()) => {
  const parsed = typeof value === 'string' ? new Date(value) : new Date(value ?? fallback);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
};

const normalizeRole = (value, fallback = 'admin') => {
  const role = getText(value).toLowerCase();
  return ADMIN_ROLE_SET.has(role) ? role : fallback;
};

const normalizeUser = (value, fallbackRole = 'admin') => {
  const login = getText(value?.login);
  const password = getText(value?.password);
  const firstName = getText(value?.firstName) || 'Имя';
  const lastName = getText(value?.lastName) || 'Фамилия';

  if (!login || !password) {
    return null;
  }

  return {
    login,
    password,
    firstName,
    lastName,
    role: normalizeRole(value?.role, fallbackRole),
    createdAt: toIsoDate(value?.createdAt),
  };
};

const normalizeUsers = (parsed) => {
  const sourceUsers = Array.isArray(parsed?.users)
    ? parsed.users
    : parsed && typeof parsed === 'object'
      ? [parsed]
      : [];

  const users = [];
  const usedLogins = new Set();

  sourceUsers.forEach((item, index) => {
    const normalized = normalizeUser(item, index === 0 ? 'owner' : 'admin');
    if (!normalized) return;
    if (usedLogins.has(normalized.login)) return;

    usedLogins.add(normalized.login);
    users.push(normalized);
  });

  if (users.length > 0 && !users.some((user) => user.role === 'owner')) {
    users[0] = {
      ...users[0],
      role: 'owner',
    };
  }

  return users;
};

const normalizeHistoryItem = (value) => {
  const action = getText(value?.action);
  const actorLogin = getText(value?.actorLogin);

  if (!action || !actorLogin) {
    return null;
  }

  return {
    id: getText(value?.id) || crypto.randomUUID(),
    action,
    actorLogin,
    actorRole: normalizeRole(value?.actorRole, 'admin'),
    targetType: getText(value?.targetType),
    targetId: getText(value?.targetId),
    summary: getText(value?.summary),
    createdAt: toIsoDate(value?.createdAt),
  };
};

const normalizeHistory = (parsed) => {
  if (!Array.isArray(parsed?.history)) return [];
  return parsed.history.map(normalizeHistoryItem).filter(Boolean).slice(0, ADMIN_HISTORY_LIMIT);
};

const toPublicUser = (user) => ({
  login: user.login,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  createdAt: user.createdAt,
});

const isStateNormalized = (parsed, normalizedState) => {
  if (!parsed || typeof parsed !== 'object') return false;
  if (!Array.isArray(parsed.users) || !Array.isArray(parsed.history)) return false;
  if (parsed.users.length !== normalizedState.users.length) return false;
  if (parsed.history.length !== normalizedState.history.length) return false;

  if (
    parsed.users.some((item) => {
      const role = getText(item?.role).toLowerCase();
      return (
        !getText(item?.login) ||
        !getText(item?.password) ||
        !getText(item?.firstName) ||
        !getText(item?.lastName) ||
        !ADMIN_ROLE_SET.has(role) ||
        !getText(item?.createdAt)
      );
    })
  ) {
    return false;
  }

  if (
    parsed.history.some(
      (item) => !getText(item?.id) || !getText(item?.action) || !getText(item?.actorLogin) || !getText(item?.createdAt)
    )
  ) {
    return false;
  }

  return true;
};

const writeAdminState = async (state) => {
  await fs.mkdir(path.dirname(ADMIN_FILE), { recursive: true });
  await fs.writeFile(ADMIN_FILE, `${JSON.stringify(state, null, 2)}\n`, 'utf-8');
};

const ensureAdminState = async () => {
  await fs.mkdir(path.dirname(ADMIN_FILE), { recursive: true });

  let parsed = null;

  try {
    const raw = await fs.readFile(ADMIN_FILE, 'utf-8');
    parsed = JSON.parse(raw);
  } catch {
    // Keep defaults below.
  }

  const users = normalizeUsers(parsed);
  const history = normalizeHistory(parsed);

  if (users.length === 0) {
    await writeAdminState(DEFAULT_ADMIN_DATA);
    return {
      users: [...DEFAULT_ADMIN_DATA.users],
      history: [...DEFAULT_ADMIN_DATA.history],
    };
  }

  const normalizedState = {
    users,
    history,
  };

  if (!isStateNormalized(parsed, normalizedState)) {
    await writeAdminState(normalizedState);
  }

  return normalizedState;
};

const appendHistoryEntry = (state, input) => {
  const entry = normalizeHistoryItem({
    id: crypto.randomUUID(),
    action: getText(input?.action),
    actorLogin: getText(input?.actorLogin),
    actorRole: normalizeRole(input?.actorRole, 'admin'),
    targetType: getText(input?.targetType),
    targetId: getText(input?.targetId),
    summary: getText(input?.summary),
    createdAt: new Date().toISOString(),
  });

  if (!entry) return null;

  state.history = [entry, ...state.history].slice(0, ADMIN_HISTORY_LIMIT);
  return entry;
};

const findUserByCredentials = (users, input) => {
  const login = getText(input?.login);
  const password = getText(input?.password);

  if (!login || !password) {
    return null;
  }

  return users.find((user) => user.login === login && user.password === password) ?? null;
};

const authorizeFromState = (state, input) => {
  const login = getText(input?.login);
  const password = getText(input?.password);

  if (!login || !password) {
    return {
      ok: false,
      status: 401,
      error: 'Укажите логин и пароль администратора.',
    };
  }

  const matchedUser = findUserByCredentials(state.users, { login, password });

  if (!matchedUser) {
    return {
      ok: false,
      status: 401,
      error: 'Неверный логин или пароль.',
    };
  }

  return {
    ok: true,
    user: toPublicUser(matchedUser),
    privateUser: matchedUser,
  };
};

export async function verifyAdminCredentials(input) {
  const state = await ensureAdminState();
  const auth = authorizeFromState(state, input);

  if (!auth.ok) {
    return auth;
  }

  return {
    ok: true,
    user: auth.user,
  };
}

export async function verifyOwnerCredentials(input) {
  const auth = await verifyAdminCredentials(input);

  if (!auth.ok) return auth;

  if (auth.user.role !== 'owner') {
    return {
      ok: false,
      status: 403,
      error: 'Доступно только владельцу.',
    };
  }

  return auth;
}

export async function appendAdminHistory(input) {
  const actorLogin = getText(input?.actorLogin || input?.actor?.login);
  const action = getText(input?.action);

  if (!actorLogin || !action) {
    return null;
  }

  const state = await ensureAdminState();

  const entry = appendHistoryEntry(state, {
    action,
    actorLogin,
    actorRole: getText(input?.actorRole || input?.actor?.role) || 'admin',
    targetType: input?.targetType,
    targetId: input?.targetId,
    summary: input?.summary,
  });

  if (!entry) return null;

  await writeAdminState(state);
  return entry;
}

export async function updateAdminProfile(input) {
  const state = await ensureAdminState();
  const auth = authorizeFromState(state, input);

  if (!auth.ok) {
    return auth;
  }

  const nextFirstName = getText(input?.firstName);
  const nextLastName = getText(input?.lastName);

  if (!nextFirstName || !nextLastName) {
    return {
      ok: false,
      status: 400,
      error: 'Введите имя и фамилию.',
    };
  }

  const targetIndex = state.users.findIndex((user) => user.login === auth.privateUser.login);

  if (targetIndex === -1) {
    return {
      ok: false,
      status: 404,
      error: 'Пользователь не найден.',
    };
  }

  state.users[targetIndex] = {
    ...state.users[targetIndex],
    firstName: nextFirstName,
    lastName: nextLastName,
  };

  appendHistoryEntry(state, {
    action: 'profile.update',
    actorLogin: auth.privateUser.login,
    actorRole: auth.privateUser.role,
    targetType: 'admin-user',
    targetId: auth.privateUser.login,
    summary: 'Обновлены данные профиля.',
  });

  await writeAdminState(state);

  return {
    ok: true,
    user: toPublicUser(state.users[targetIndex]),
  };
}

export async function getAdminUsers(input) {
  const state = await ensureAdminState();
  const auth = authorizeFromState(state, input?.auth);

  if (!auth.ok) {
    return auth;
  }

  if (auth.privateUser.role !== 'owner') {
    return {
      ok: false,
      status: 403,
      error: 'Доступно только владельцу.',
    };
  }

  const users = [...state.users]
    .sort((a, b) => {
      if (a.role !== b.role) {
        return a.role === 'owner' ? -1 : 1;
      }
      return a.login.localeCompare(b.login, 'ru');
    })
    .map(toPublicUser);

  return {
    ok: true,
    users,
  };
}

export async function createAdminUser(input) {
  const state = await ensureAdminState();
  const auth = authorizeFromState(state, input?.auth);

  if (!auth.ok) {
    return auth;
  }

  if (auth.privateUser.role !== 'owner') {
    return {
      ok: false,
      status: 403,
      error: 'Доступно только владельцу.',
    };
  }

  const nextLogin = getText(input?.user?.login);
  const nextPassword = getText(input?.user?.password);
  const nextFirstName = getText(input?.user?.firstName);
  const nextLastName = getText(input?.user?.lastName);
  const nextRole = normalizeRole(input?.user?.role, 'admin');

  if (!nextLogin || !nextPassword || !nextFirstName || !nextLastName) {
    return {
      ok: false,
      status: 400,
      error: 'Заполните все поля нового администратора.',
    };
  }

  if (state.users.some((user) => user.login === nextLogin)) {
    return {
      ok: false,
      status: 409,
      error: 'Пользователь с таким логином уже существует.',
    };
  }

  const nextUser = {
    login: nextLogin,
    password: nextPassword,
    firstName: nextFirstName,
    lastName: nextLastName,
    role: nextRole,
    createdAt: new Date().toISOString(),
  };

  state.users.push(nextUser);

  appendHistoryEntry(state, {
    action: 'admin.create',
    actorLogin: auth.privateUser.login,
    actorRole: auth.privateUser.role,
    targetType: 'admin-user',
    targetId: nextUser.login,
    summary: `Создан пользователь ${nextUser.login} (${nextRole}).`,
  });

  await writeAdminState(state);

  return {
    ok: true,
    user: toPublicUser(nextUser),
  };
}

export async function resetAdminUserPassword(input) {
  const state = await ensureAdminState();
  const auth = authorizeFromState(state, input?.auth);

  if (!auth.ok) {
    return auth;
  }

  if (auth.privateUser.role !== 'owner') {
    return {
      ok: false,
      status: 403,
      error: 'Доступно только владельцу.',
    };
  }

  const targetLogin = getText(input?.targetLogin);
  const nextPassword = getText(input?.nextPassword);

  if (!targetLogin) {
    return {
      ok: false,
      status: 400,
      error: 'Не указан логин пользователя.',
    };
  }

  if (!nextPassword) {
    return {
      ok: false,
      status: 400,
      error: 'Введите новый пароль.',
    };
  }

  const targetIndex = state.users.findIndex((user) => user.login === targetLogin);

  if (targetIndex === -1) {
    return {
      ok: false,
      status: 404,
      error: 'Пользователь не найден.',
    };
  }

  const targetUser = state.users[targetIndex];
  const isSelfChange = targetUser.login === auth.privateUser.login;

  if (normalizeRole(targetUser.role) !== 'admin' && !isSelfChange) {
    return {
      ok: false,
      status: 400,
      error: 'Сброс пароля доступен для администраторов или для вашего аккаунта.',
    };
  }

  state.users[targetIndex] = {
    ...targetUser,
    password: nextPassword,
  };

  appendHistoryEntry(state, {
    action: 'admin.password_reset',
    actorLogin: auth.privateUser.login,
    actorRole: auth.privateUser.role,
    targetType: 'admin-user',
    targetId: targetUser.login,
    summary: isSelfChange
      ? `Пользователь ${targetUser.login} изменил собственный пароль.`
      : `Сброшен пароль пользователя ${targetUser.login}.`,
  });

  await writeAdminState(state);

  return {
    ok: true,
    user: toPublicUser(state.users[targetIndex]),
  };
}

export async function deleteAdminUser(input) {
  const state = await ensureAdminState();
  const auth = authorizeFromState(state, input?.auth);

  if (!auth.ok) {
    return auth;
  }

  if (auth.privateUser.role !== 'owner') {
    return {
      ok: false,
      status: 403,
      error: 'Доступно только владельцу.',
    };
  }

  const targetLogin = getText(input?.targetLogin);

  if (!targetLogin) {
    return {
      ok: false,
      status: 400,
      error: 'Не указан логин пользователя для удаления.',
    };
  }

  if (targetLogin === auth.privateUser.login) {
    return {
      ok: false,
      status: 400,
      error: 'Нельзя удалить текущего пользователя.',
    };
  }

  const targetIndex = state.users.findIndex((user) => user.login === targetLogin);

  if (targetIndex === -1) {
    return {
      ok: false,
      status: 404,
      error: 'Пользователь не найден.',
    };
  }

  const targetUser = state.users[targetIndex];

  if (targetUser.role === 'owner') {
    const ownersCount = state.users.filter((user) => user.role === 'owner').length;

    if (ownersCount <= 1) {
      return {
        ok: false,
        status: 400,
        error: 'Нельзя удалить последнего владельца.',
      };
    }
  }

  state.users.splice(targetIndex, 1);

  appendHistoryEntry(state, {
    action: 'admin.delete',
    actorLogin: auth.privateUser.login,
    actorRole: auth.privateUser.role,
    targetType: 'admin-user',
    targetId: targetUser.login,
    summary: `Удален пользователь ${targetUser.login} (${targetUser.role}).`,
  });

  await writeAdminState(state);

  return {
    ok: true,
    removed: toPublicUser(targetUser),
  };
}

export async function getAdminHistory(input) {
  const state = await ensureAdminState();
  const auth = authorizeFromState(state, input?.auth);

  if (!auth.ok) {
    return auth;
  }

  if (auth.privateUser.role !== 'owner') {
    return {
      ok: false,
      status: 403,
      error: 'Доступно только владельцу.',
    };
  }

  const parsedLimit = Number.parseInt(String(input?.limit ?? ''), 10);
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 500) : 200;

  return {
    ok: true,
    history: state.history.slice(0, limit),
  };
}

export function getAdminCredentialsFromRequest(request) {
  return {
    login: getText(request.headers.get('x-admin-login')),
    password: getText(request.headers.get('x-admin-password')),
  };
}
