const TOKEN_KEY = 'axys_token';
const USER_KEY = 'axys_user';
const REMEMBER_KEY = 'axys_remember';

function storageFor(remember) {
  return remember ? window.localStorage : window.sessionStorage;
}

export function persistAuth({ token, user, remember }) {
  const primary = storageFor(remember);
  primary.setItem(TOKEN_KEY, token);
  primary.setItem(USER_KEY, JSON.stringify(user));
  window.localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0');

  const secondary = remember ? window.sessionStorage : window.localStorage;
  secondary.removeItem(TOKEN_KEY);
  secondary.removeItem(USER_KEY);
}

export function clearPersistedAuth() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(REMEMBER_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
}

export function readPersistedAuth() {
  const remember = window.localStorage.getItem(REMEMBER_KEY) === '1';
  const primary = storageFor(remember);
  let token = primary.getItem(TOKEN_KEY);
  let rawUser = primary.getItem(USER_KEY);

  if (!token || !rawUser) {
    token =
      window.localStorage.getItem(TOKEN_KEY) ||
      window.sessionStorage.getItem(TOKEN_KEY);
    rawUser =
      window.localStorage.getItem(USER_KEY) ||
      window.sessionStorage.getItem(USER_KEY);
  }

  if (!token || !rawUser) {
    return null;
  }

  try {
    return { token, user: JSON.parse(rawUser), remember };
  } catch {
    clearPersistedAuth();
    return null;
  }
}
