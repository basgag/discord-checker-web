import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";
import AdminLayout from "~/layouts/AdminLayout";
import { api } from "~/utils/api";
import { useState } from "react";
import DiscordAvatar from "~/components/DiscordAvatar";
import { isMigratedUser, usernameOrTag } from "~/lib/utils";
import BadgeList from "~/components/common/discord/BadgeList";
import clsx from "clsx";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
} from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { Listbox } from "@headlessui/react";
import _ from "lodash";

const SkeletonCard: React.FC = () => {
  return (
    <div className="animate-pulse rounded border border-gray-700 bg-gray-800 px-2 py-3">
      <div className="flex items-center">
        <div className="h-16 w-16 rounded-full bg-gray-700"></div>
        <div className="ml-4 text-left">
          <div className="mb-2 flex items-center space-x-2 text-sm">
            <div className="h-4 w-52 rounded bg-gray-700"></div>
          </div>
          <small className="text-xs text-gray-300">
            <div className="h-4 w-32 rounded bg-gray-700"></div>
          </small>
        </div>
      </div>
    </div>
  );
};

export default function AccountsOverview() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(30);
  const [search, setSearch] = useState("");
  const [isNitroOnly, setIsNitroOnly] = useState(false);
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);

  const { data: accounts, fetchNextPage } =
    api.accounts.getWithCursor.useInfiniteQuery(
      {
        limit,
        search,
        nitroOnly: isNitroOnly,
        verifiedOnly: isVerifiedOnly,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleVerifiedFilterChange = () => {
    setIsVerifiedOnly(!isVerifiedOnly);
    setPage(0);
  };

  const handleNitroFilterChange = () => {
    setIsNitroOnly(!isNitroOnly);
    setPage(0);
  };

  const handleFetchNextPage = () => {
    if (!accounts?.pages[page]?.nextCursor) {
      return;
    }

    void fetchNextPage();
    setPage((prev) => prev + 1);
  };

  const handleFetchPreviousPage = () => {
    if (page === 0) {
      return;
    }

    setPage((prev) => prev - 1);
  };

  const toShow = accounts?.pages[page]?.items;

  return (
    <AdminLayout>
      <div className="pb-5 leading-[15px]">
        <h1 className="text-3xl font-bold">Account Management</h1>
        <span className="text-neutral-300">View and manage all accounts</span>
      </div>

      <div className="items-center gap-2 md:flex">
        <input
          placeholder="Username | ID | Email | Phone Number"
          className="mb-1 mt-1 block w-full max-w-[400px] rounded border-2 border-blurple bg-gray-700 p-2 font-mono placeholder-gray-300 caret-blurple outline-none focus:border-blurple-dark"
          onChange={_.debounce(handleSearchChange, 500)}
        />
        <button
          onClick={handleNitroFilterChange}
          className={clsx(
            "mr-1 rounded border border-gray-700 bg-gray-800 p-2.5 transition duration-150 ease-in-out hover:border-purple-500 hover:bg-purple-400/30 md:mr-0",
            isNitroOnly
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
            isVerifiedOnly
              ? "border-green-500 bg-gradient-to-br from-green-400/30 to-green-500/20"
              : "border-gray-700",
          )}
        >
          <FiCheckCircle className="h-6 w-8 text-green-500" />
        </button>

        <div className="ml-auto w-20">
          <Listbox
            value={limit}
            onChange={(v) => {
              setLimit(v);
              setPage(0);
            }}
          >
            <Listbox.Button className="relative w-full cursor-default rounded border border-gray-700 bg-gray-800 p-2.5 text-left shadow-md focus:outline-none sm:text-sm">
              <span className="block truncate">{limit}</span>
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
              <div
                className={clsx(
                  "rounded border border-gray-700 bg-gray-800 px-2 py-3 transition duration-150 ease-in-out hover:-translate-y-1",
                  !account.verified &&
                    "border-yellow-500 bg-gradient-to-br from-yellow-400/30 to-yellow-500/20 text-yellow-200",
                  account.premium_type &&
                    account.premium_type > 0 &&
                    "border-purple-500 bg-gradient-to-br from-purple-400/30 to-purple-500/20 text-purple-200",
                )}
                key={`a-${account.id}`}
              >
                <div className="flex items-center">
                  <DiscordAvatar user={account} />
                  <div className="ml-4 text-left">
                    <div className="flex items-center space-x-2 text-sm">
                      <Link href={`/admin/accounts/${account.id}`}>
                        {isMigratedUser(account) ? (
                          <span className="font-medium">
                            {usernameOrTag(account)}
                          </span>
                        ) : (
                          <div>
                            <span className="font-medium">
                              {account.username}
                            </span>
                            <span
                              className={clsx(
                                "text-xs text-gray-300",
                                !account.verified && "text-yellow-300",
                                account.premium_type &&
                                  account.premium_type > 0 &&
                                  "text-purple-300",
                              )}
                            >
                              #{account.discriminator}
                            </span>
                          </div>
                        )}
                      </Link>
                      <BadgeList user={account} />
                    </div>
                    <small className="text-xs text-gray-300">
                      {account.id}
                    </small>
                  </div>
                </div>
              </div>
            ))
          : Array.from({ length: limit }).map((_, i) => (
              <SkeletonCard key={`s-${i}`} />
            ))}
      </div>

      {accounts && (
        <div className="mb-4 mt-4 flex items-center justify-between">
          <div className="space-x-1">
            <button
              className="rounded bg-blurple px-2 py-1.5 font-medium outline-none transition duration-150 hover:bg-blurple-dark disabled:opacity-50"
              onClick={handleFetchPreviousPage}
              disabled={page === 0}
            >
              <FiArrowLeft />
            </button>
            <button
              className="rounded bg-blurple px-2 py-1.5 font-medium outline-none transition duration-150 hover:bg-blurple-dark disabled:opacity-50"
              onClick={handleFetchNextPage}
              disabled={!accounts?.pages[page]?.nextCursor}
            >
              <FiArrowRight />
            </button>
          </div>

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
