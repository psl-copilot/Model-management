import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit"
import toast from "react-hot-toast"
import { resetData } from "../utils/Common/storage"

interface ApiErrorPayload {
  status?: number
  data?: {
    message?: string
  }
}

const errorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const payload = action.payload as ApiErrorPayload | undefined
    const status = payload?.status

    if (status === 401) {
      resetData()

      window.location.href = "/login"

      return
    }

    const errorMessage =
      payload?.data?.message ||
      action.error?.message ||
      "Something went wrong"

    toast.error(errorMessage)
  }

  return next(action)
}

export default errorLogger
