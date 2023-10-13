import { api } from "~/utils/api";

interface IUsePaginatedAccounts {
  limit?: number;
  search?: string;
  nitroOnly?: boolean;
  verifiedOnly?: boolean;
}

export function usePaginatedAccounts(props: IUsePaginatedAccounts) {
  const { data: accounts, fetchNextPage } =
    api.accounts.getWithCursor.useInfiniteQuery(props, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      keepPreviousData: true,
    });

  return {
    accounts,
    fetchNextPage,
  };
}
