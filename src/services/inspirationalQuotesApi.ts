import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { inspirationalQuote, inspirationalSearchedQuote } from "../models/globalTypes";

export const inspirationalQuotesApi = createApi({
  reducerPath: "inspirationalQuotesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.quotable.io",
  }),
  endpoints: (builder) => ({
    getRandomQuote: builder.query<inspirationalQuote[], void>({
      query: () => "/quotes/random",
    }),
    getQuoteByKeyword: builder.query<inspirationalSearchedQuote, string>({
      query: (keyword) => `/search/quotes?query=${keyword}`,
    }),
  }),
});

export const { useGetRandomQuoteQuery, useGetQuoteByKeywordQuery } = inspirationalQuotesApi;
