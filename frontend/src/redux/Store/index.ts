import { configureStore } from '@reduxjs/toolkit'
import { authApi } from '../Api/Auth'
import errorLogger from '../../middlerwares/apierror.middleware'
import successLogger from '../../middlerwares/apisuccess.middleware'
import { rulesApi } from '../Api/Rules'
import { configApi } from '../Api/Config'

export default configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [rulesApi.reducerPath]: rulesApi.reducer,
        [configApi.reducerPath]: configApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
            .concat(authApi.middleware)
            .concat(rulesApi.middleware)
            .concat(configApi.middleware)
            .concat(errorLogger)
            .concat(successLogger)
})