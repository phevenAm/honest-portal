import { useEffect } from "react";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "./index";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// biome-ignore lint/suspicious/noExplicitAny: RTK async thunk action creators don't have a shared type
export function useFetchOnIdle<T>(selector: (state: RootState) => T, thunk: (() => any) | null, errorMessage: string) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selector);

  useEffect(() => {
    if (status === "idle" && thunk) {
      dispatch(thunk())
        .unwrap()
        .catch((err: unknown) => {
          console.error(errorMessage, err);
        });

      //!implement retry if status === error
    }
  }, [status, dispatch, thunk, errorMessage]);
}
