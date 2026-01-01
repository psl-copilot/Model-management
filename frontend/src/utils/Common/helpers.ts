import dayjs from "dayjs";
import type { User } from "./types";

export const hideValue = (value: string, sign = "*") => sign?.repeat(value?.length)

export const dateFormatter = (date: string, options = { time: true }) => {

    if (date) {

        let format = "MM/DD/YYYY hh:mm a"

        if (!options?.time) {
            format = "MM/DD/YYYY"
        }

        const formatted_date = dayjs(date).format(format)
        return formatted_date
    }

    return null
}

type Path = string | string[] | null | undefined

export const getNestedValue = (
    obj: unknown,
    path: Path,
    separator: string = " - "
): string => {
    if (!path) return "-"

    if (Array.isArray(path)) {
        const values = path
            .map((key) => getNestedValue(obj, key, separator))
            .filter(
                (val): val is string =>
                    val !== "-" && val !== null && val !== undefined
            )

        return values.length ? values.join(separator) : "-"
    }

    if (typeof path === "string") {
        const value = path
            .replace(/\[(\w+)\]/g, ".$1")
            .replace(/^\./, "")
            .split(".")
            .reduce<any | null>((acc, key) => {
                if (acc && typeof acc === "object" && key in acc) {
                    return acc[key]
                }
                return null
            }, obj)

        return value !== null && value !== undefined && value !== ""
            ? String(value)
            : "-"
    }

    return "-"
}

export const decodeToken = (token: string): User | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''),
        );

        const payload = JSON.parse(jsonPayload);

        let innerPayload = payload;
        if (payload.tokenString) {
            try {
                const innerToken = payload.tokenString;
                const innerBase64Url = innerToken.split('.')[1];
                const innerBase64 = innerBase64Url
                    .replace(/-/g, '+')
                    .replace(/_/g, '/');
                const innerJsonPayload = decodeURIComponent(
                    atob(innerBase64)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join(''),
                );
                innerPayload = JSON.parse(innerJsonPayload);
            } catch (innerError) {
                console.warn(
                    'Failed to decode inner token, using outer payload:',
                    innerError,
                );
            }
        }

        return {
            id: innerPayload.sub || payload.sub || payload.clientId || 'unknown',
            username:
                innerPayload.preferred_username ||
                innerPayload.username ||
                payload.preferred_username ||
                payload.username ||
                innerPayload.sub ||
                payload.sub ||
                'user',
            email: innerPayload.email || payload.email,
            claims: payload.claims || innerPayload.realm_access?.roles || [],
            tenantId: payload.tenantId || innerPayload.tenantId,
        };
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
}


