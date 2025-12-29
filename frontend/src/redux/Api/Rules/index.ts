import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "../../../utils/Common/storage";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export const rulesApi = createApi({
    reducerPath: 'rulesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${BASE_URL}/rules/api/`,
        prepareHeaders: (headers) => {
            let token = getAuthToken()
            if (token) headers.set("authorization", `Bearer ${token}`)
            return headers
        }
    }),

    endpoints: (builder) => ({
        getRules: builder.mutation({
            query: ({ body, params }) => ({
                url: `all`,
                method: "POST",
                body: { ...body },
                params
            }),
        }),
        getRuleById: builder.query({
            query: ({ id }) => ({
                url: `${id}`,
                method: "GET",
            }),
        }),
    }),
})

export const {
    useGetRulesMutation,
    useGetRuleByIdQuery
} = rulesApi
