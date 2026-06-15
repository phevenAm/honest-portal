import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../store";

// biome-ignore lint/suspicious/noExplicitAny: RTK async thunk action creators don't have a shared type
export function useFetchOnIdle<T>(selector: (state: RootState) => T, thunk: any, errorMessage: string) {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(selector);

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
