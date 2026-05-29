import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  inspirationalQuote,
  inspirationalSearchedQuote,
} from "../models/globalTypes";

export const inspirationalQuotesApi = createApi({
  reducerPath: "inspirationalQuotesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.quotable.io/quotes/",
  }),
  endpoints: (builder) => ({
    getRandomQuote: builder.query<inspirationalQuote[], void>({
      query: () => "random",
    }),
    getQuoteByKeyword: builder.query<inspirationalSearchedQuote[], string>({
      query: (keyword) => `search?keyword=${keyword}`,
    }),
  }),
});

export const { useGetRandomQuoteQuery, useGetQuoteByKeywordQuery } =
  inspirationalQuotesApi;
