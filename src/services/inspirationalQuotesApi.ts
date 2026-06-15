import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

import type { LocalQuote } from "../data/quotes";
import { quotes } from "../data/quotes";

export const inspirationalQuotesApi = createApi({
  reducerPath: "inspirationalQuotesApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getQuotesByTag: builder.query<LocalQuote[], string | null>({
      queryFn: (tag) => ({
        data: tag ? quotes.filter((q) => q.tags.includes(tag)) : quotes,
      }),
    }),
  }),
});

export const { useGetQuotesByTagQuery } = inspirationalQuotesApi;
