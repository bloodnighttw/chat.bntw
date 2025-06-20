import useSWR, { type SWRConfiguration } from "swr";

function fetcher<T>(runAfter?: (res:T) => void) {
  const a = (url: string, options?: RequestInit) =>
    fetch(url, options)
      .then((res) => res.json())
      .then((res) => {
        runAfter?.(res);
        return res;
      });
  return a;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAPI<T, E = any>(
  url: string,
  runAfter?: (res: T) => void,
  options?: SWRConfiguration<T>, 
) {
  const swr = useSWR<T, E>(
    `/api${url}`,
    fetcher(runAfter),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      ...options,
    }
  );

  return swr;
}


