import { useEffect } from "react";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "./index";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

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
