import { promises as fs } from 'node:fs';
import path from 'node:path';

const getText = (value) => (typeof value === 'string' ? value.trim() : '');
const ADMIN_FILE = path.join(process.cwd(), 'data', 'cms', 'admin.json');
const DEFAULT_ADMIN_DATA = {
  users: [
    {
      login: 'admin',
      password: '123456789',
      firstName: 'Админ',
      lastName: 'RUNA',
    },
  ],
};

const normalizeUser = (value) => {
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
  };
};

const normalizeUsers = (parsed) => {
  if (Array.isArray(parsed?.users)) {
    return parsed.users.map(normalizeUser).filter(Boolean);
  }

  const legacyUser = normalizeUser(parsed);
  return legacyUser ? [legacyUser] : [];
};

const ensureAdminUsers = async () => {
  await fs.mkdir(path.dirname(ADMIN_FILE), { recursive: true });
  let parsed = null;
  let users = [];

  try {
    const raw = await fs.readFile(ADMIN_FILE, 'utf-8');
    parsed = JSON.parse(raw);
    users = normalizeUsers(parsed);
  } catch {
    // Write defaults below.
  }

  if (users.length === 0) {
    await fs.writeFile(ADMIN_FILE, `${JSON.stringify(DEFAULT_ADMIN_DATA, null, 2)}\n`, 'utf-8');
    return DEFAULT_ADMIN_DATA.users;
  }

  const needsNormalization =
    !Array.isArray(parsed?.users) ||
    parsed.users.some((item) => !getText(item?.firstName) || !getText(item?.lastName));

  if (needsNormalization) {
    await fs.writeFile(ADMIN_FILE, `${JSON.stringify({ users }, null, 2)}\n`, 'utf-8');
  }

  return users;
};

export async function verifyAdminCredentials(input) {
  const users = await ensureAdminUsers();
  const receivedLogin = getText(input?.login);
  const receivedPassword = getText(input?.password);

  if (!receivedLogin || !receivedPassword) {
    return {
      ok: false,
      status: 401,
      error: 'Укажите логин и пароль администратора.',
    };
  }

  const matchedUser = users.find((user) => user.login === receivedLogin && user.password === receivedPassword);

  if (!matchedUser) {
    return {
      ok: false,
      status: 401,
      error: 'Неверный логин или пароль.',
    };
  }

  return {
    ok: true,
    user: {
      login: matchedUser.login,
      firstName: matchedUser.firstName,
      lastName: matchedUser.lastName,
    },
  };
}

export function getAdminCredentialsFromRequest(request) {
  return {
    login: getText(request.headers.get('x-admin-login')),
    password: getText(request.headers.get('x-admin-password')),
  };
}
