export const CookieStorage = 'cookie';
export const SessionStorage = 'session';
export const LocalStorage = 'local';

export type StorageType =
  | typeof CookieStorage
  | typeof SessionStorage
  | typeof LocalStorage;