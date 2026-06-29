import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@store/hooks";
import type { RootState } from "@store/index";

// biome-ignore lint/suspicious/noExplicitAny: RTK async thunk action creators don't have a shared type
export function useFetchOnIdle<T>(selector: (state: RootState) => T, thunk: any, errorMessage: string) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selector);

  useEffect(() => {
    if (status === "idle") {
      dispatch(thunk())
        .unwrap()
        .catch((err: unknown) => {
          console.error(errorMessage, err);
        });

      //!implement retry if status === error
    }
  }, [status, dispatch, thunk, errorMessage]);
}
