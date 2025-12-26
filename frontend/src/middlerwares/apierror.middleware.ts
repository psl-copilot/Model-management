import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit"
import toast from "react-hot-toast"

const errorLogger: Middleware = () => next => action => {
    if (isRejectedWithValue(action)) {
        const errorMessage =
            (action.payload as any)?.data?.message ||
            action.error?.message ||
            "Something went wrong"

        toast.error(errorMessage)
    }

    return next(action)
}

export default errorLogger
