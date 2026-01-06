
import { decrypt, encrypt } from "./crypto";
import { CookieStorage, LocalStorage, SessionStorage, type StorageType } from "./enums";
import Cookies from 'js-cookie';

const insertData = (
    data: unknown,
    key: string,
    type: StorageType = CookieStorage,
    encrypted = false,
    cookieOptions?: Cookies.CookieAttributes
) => {
    let value: string;

    value = encrypted ? encrypt(data) : JSON.stringify(data);

    switch (type) {
        case CookieStorage:
            Cookies.set(key, value, {
                ...cookieOptions,
            });
            break;

        case SessionStorage:
            sessionStorage.setItem(key, value);
            break;

        case LocalStorage:
            localStorage.setItem(key, value);
            break;
    }
};


const extractData = (
    key: string,
    type: StorageType = CookieStorage,
    encrypted = false
) => {
    let data: string | null | undefined;

    switch (type) {
        case CookieStorage:
            data = Cookies.get(key);
            break;

        case SessionStorage:
            data = sessionStorage.getItem(key);
            break;

        case LocalStorage:
            data = localStorage.getItem(key);
            break;

        default:
            return null;
    }

    if (!data) return null;

    if (encrypted) {
        return decrypt(data);
    }

    return JSON.parse(data);
};


const getAuthToken = () => {
    return extractData("access_token");
};

const resetData = () => {
    sessionStorage.clear()
    localStorage.clear()
    Object.keys(Cookies.get()).forEach((key) => {
        Cookies.remove(key);
    });
};

export {
    extractData,
    insertData,
    resetData,
    getAuthToken
};
