import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "../../../utils/Common/storage";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export const ruleBuilderApi = createApi({
    reducerPath: 'ruleBuilderApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${BASE_URL}/`,
        prepareHeaders: (headers) => {
            const token = getAuthToken()
            if (token) headers.set("Authorization", `Bearer ${token}`)
            return headers
        }
    }),
    endpoints: (builder) => ({
        getNodes: builder.query({
            query: () => ({
                url: `nodes?category=rule_builder`,
                method: "GET",
            }),
        }),
    }),
})

export const {
    useGetNodesQuery,
} = ruleBuilderApi
