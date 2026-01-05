import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "../../../utils/Common/storage";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export const configApi = createApi({
    reducerPath: 'configApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${BASE_URL}/config/api/`,
        prepareHeaders: (headers) => {
            const token = getAuthToken()
            if (token) headers.set("authorization", `Bearer ${token}`)
            return headers
        }
    }),

    endpoints: (builder) => ({
        getTypes: builder.query({
            query: () => ({
                url: `transaction-types`,
                method: "GET",
            }),
        }),
    }),
})

export const {
    useGetTypesQuery
} = configApi
