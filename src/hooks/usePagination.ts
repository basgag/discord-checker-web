import { useState } from "react";

export function usePagination() {
  const [pageIndex, setPageIndex] = useState<number>(0);

  const previousPage = () =>
    setPageIndex(pageIndex - 21 < 0 ? 0 : pageIndex - 21);

  const nextPage = () => setPageIndex(pageIndex + 21);

  const resetPage = () => setPageIndex(0);

  return {
    pageIndex,
    previousPage,
    nextPage,
    resetPage,
  };
}
