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

export const capitalize = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);


const decodeJwtPayload = (token: string): any | null => {
    try {
        const base64 = token.split('.')[1];
        if (!base64) return null;

        const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(json);
    } catch {
        return null;
    }
};

export const decodeToken = (token: string): User | null => {
    try {
        const outerPayload = decodeJwtPayload(token);
        if (!outerPayload) return null;

        const innerPayload =
            typeof outerPayload.tokenString === 'string'
                ? decodeJwtPayload(outerPayload.tokenString) ?? outerPayload
                : outerPayload;

        const claimsRaw = outerPayload.claims ?? innerPayload.realm_access?.roles ?? [];
        const trsClaim = claimsRaw.find((c: string) => c.startsWith('trs_'))?.replace(/^trs_/, '') ?? null;

        return {
            id:
                innerPayload.sub ??
                outerPayload.sub ??
                outerPayload.clientId ??
                'unknown',

            username:
                innerPayload.preferred_username ??
                innerPayload.username ??
                outerPayload.preferred_username ??
                outerPayload.username ??
                innerPayload.sub ??
                outerPayload.sub ??
                'user',

            email: innerPayload.email ?? outerPayload.email,

            claims: trsClaim,

            tenantId:
                outerPayload.tenantId ??
                innerPayload.tenantId,
        };
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};



