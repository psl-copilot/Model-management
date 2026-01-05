import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit"
import toast from "react-hot-toast"

interface ApiErrorPayload {
  data?: {
    message?: string
  }
}

const errorLogger: Middleware = () => next => action => {
  if (isRejectedWithValue(action)) {
    const payload = action.payload as ApiErrorPayload | undefined

    const errorMessage =
      payload?.data?.message ||
      action.error?.message ||
      "Something went wrong"

    toast.error(errorMessage)
  }

  return next(action)
}

export default errorLogger
