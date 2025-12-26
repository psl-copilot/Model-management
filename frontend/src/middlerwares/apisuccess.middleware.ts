import { isFulfilled, type Middleware } from "@reduxjs/toolkit"
import toast from "react-hot-toast"

const successLogger: Middleware = () => next => action => {
  if (isFulfilled(action)) {
    const showSuccess = (action.meta as any)?.baseQueryMeta?.show_success
    const message =
      (action.meta as any)?.baseQueryMeta?.message ||
      (action.payload as any)?.message

    if (showSuccess && message) {
      toast.success(message)
    }
  }

  return next(action)
}

export default successLogger
