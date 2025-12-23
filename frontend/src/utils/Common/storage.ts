
import { decrypt, encrypt } from "./crypto";
import { SessionStorage } from "./enums";

const insertData = (data: unknown, key: string, type = SessionStorage, encrypted = true) => {

    let storage = type === SessionStorage ? sessionStorage : localStorage

    let value: string;

    if (encrypted) {
        value = encrypt(data);
    } else {
        value = JSON.stringify(data);
    }
    storage.setItem(key, value)

};

const extractData = (key: string, type = SessionStorage, encrypted = true) => {

    let storage = type === SessionStorage ? sessionStorage : localStorage

    let data = storage.getItem(key);

    if (!data) return null

    if (encrypted) {
        data = decrypt(data)
    }

    return data;

};

const resetData = () => {
    sessionStorage.clear()
    localStorage.clear()
};

export {
    extractData,
    insertData,
    resetData
};
