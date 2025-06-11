import useSWR from "swr";

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

export function useApi<T>(
  url: string,
  runAfter?: (res: T) => void,
  options?: RequestInit
) {
  const { data, error, isLoading } = useSWR<T>(
    `/api${url}`,
    fetcher(runAfter),
    {
      ...options,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    data,
    error,
    isLoading,
  };
}
