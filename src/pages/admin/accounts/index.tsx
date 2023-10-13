import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";
import AdminLayout from "~/layouts/AdminLayout";
import { useMemo } from "react";
import clsx from "clsx";
import { FiCheck, FiCheckCircle, FiChevronDown } from "react-icons/fi";
import Image from "next/image";
import { Listbox } from "@headlessui/react";
import debounce from "lodash/debounce";
import PaginationButtons from "~/components/home/checker/PaginationButtons";
import { usePagination } from "~/hooks/usePagination";
import { usePaginatedAccounts } from "~/hooks/usePaginatedAccounts";
import AccountWithUserCard, {
  SkeletonAccountWithUserCard,
} from "~/components/home/checker/AccountWithUserCard";
import { useAccountFilters } from "~/hooks/useAccountFilters";
import Link from "next/link";

export default function AccountsOverview() {
  const {
    pageIndex: page,
    nextPage,
    resetPage,
    previousPage,
  } = usePagination(1);
  const { filters, setFilter } = useAccountFilters();
  const { accounts, fetchNextPage } = usePaginatedAccounts(filters);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter("search", e.target.value);
    resetPage();
  };

  const handleVerifiedFilterChange = () => {
    setFilter("verifiedOnly", !filters.verifiedOnly);
    resetPage();
  };

  const handleNitroFilterChange = () => {
    setFilter("nitroOnly", !filters.nitroOnly);
    resetPage();
  };

  const handleFetchNextPage = () => {
    if (!accounts?.pages[page]?.nextCursor) {
      return;
    }

    void fetchNextPage();
    nextPage();
  };

  const toShow = useMemo(() => {
    return accounts?.pages[page]?.items;
  }, [accounts?.pages, page]);

  return (
    <AdminLayout heading="Discord Accounts">
      <div className="items-center gap-2 md:flex">
        <input
          placeholder="Username | ID | Email | Phone Number"
          className="mb-1 mt-1 block w-full max-w-[400px] rounded border-2 border-blurple bg-gray-700 p-2 font-mono placeholder-gray-300 caret-blurple outline-none focus:border-blurple-dark"
          onChange={debounce(handleSearchChange, 500)}
        />
        <button
          onClick={handleNitroFilterChange}
          className={clsx(
            "mr-1 rounded border border-gray-700 bg-gray-800 p-2.5 transition duration-150 ease-in-out hover:border-purple-500 hover:bg-purple-400/30 md:mr-0",
            filters.nitroOnly
              ? "border-purple-500 bg-gradient-to-br from-purple-400/30 to-purple-500/20"
              : "border-gray-700",
          )}
        >
          <Image
            src="/images/badges/nitro.svg"
            width={32}
            height={32}
            alt="Nitro"
          />
        </button>
        <button
          onClick={handleVerifiedFilterChange}
          className={clsx(
            "rounded border border-gray-700 bg-gray-800 p-2.5 transition duration-150 ease-in-out hover:border-green-500 hover:bg-green-400/30",
            filters.verifiedOnly
              ? "border-green-500 bg-gradient-to-br from-green-400/30 to-green-500/20"
              : "border-gray-700",
          )}
        >
          <FiCheckCircle className="h-6 w-8 text-green-500" />
        </button>

        <div className="ml-auto w-20">
          <Listbox
            value={filters.limit}
            onChange={(v) => {
              setFilter("limit", v);
              resetPage();
            }}
          >
            <Listbox.Button className="relative w-full cursor-default rounded border border-gray-700 bg-gray-800 p-2.5 text-left shadow-md focus:outline-none sm:text-sm">
              <span className="block truncate">{filters.limit}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <FiChevronDown
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 overflow-auto rounded bg-black">
              {[5, 10, 25, 30, 50, 100].map((value) => {
                return (
                  <Listbox.Option
                    key={value}
                    value={value}
                    className={({ active }) =>
                      clsx(
                        "relative select-none py-2 pl-10 pr-4",
                        active && "bg-blurple-dark/50 text-indigo-100",
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {value}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blurple">
                            <FiCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                );
              })}
            </Listbox.Options>
          </Listbox>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 grid-rows-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {toShow && toShow.length === 0 && (
          <div className="col-span-3 rounded border border-gray-700 bg-gray-800 px-2 py-3">
            <h3 className="text-lg font-bold">No Results :(</h3>
            <span className="text-gray-300">
              There were no accounts matching your query or there are no
              accounts stored in the database yet.
            </span>
          </div>
        )}

        {toShow
          ? toShow.map((account) => (
              <Link href={`/admin/accounts/${account.id}`} key={account.id}>
                <AccountWithUserCard account={account} onDeleted={() => true} />
              </Link>
            ))
          : Array.from({ length: filters.limit }).map((_, i) => (
              <SkeletonAccountWithUserCard key={`acc-skel-${i}`} />
            ))}
      </div>

      {accounts && (
        <div className="my-4 flex items-center justify-between">
          <PaginationButtons
            onPrevious={previousPage}
            isPreviousDisabled={page === 0}
            onNext={handleFetchNextPage}
            isNextDisabled={!accounts?.pages[page]?.nextCursor}
          />

          <span className="text-gray-300">
            Page <b>{page + 1}</b>
          </span>
        </div>
      )}
    </AdminLayout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/admin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}
