import dayjs from "dayjs";

export const hideValue = (value: string, sign = "*") => sign?.repeat(value?.length)

export const dateFormatter = (date: string, options = { time: true }) => {

    if (date) {

        let format = "MM/DD/YYYY hh:mm a"

        if (!options?.time) {
            format = "MM/DD/YYYY"
        }

        let formatted_date = dayjs(date).format(format)
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


