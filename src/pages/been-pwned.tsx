import Header from "~/components/Header";
import BackgroundGrid from "~/components/BackgroundGrid";
import Container from "~/components/Container";
import { useState } from "react";
import { api } from "~/utils/api";
import DiscordAvatar from "~/components/DiscordAvatar";
import { isMigratedUser, usernameOrTag } from "~/lib/utils";
import BadgeList from "~/components/BadgeList";
import { FiClock, FiFile } from "react-icons/fi";
import { NextSeo } from "next-seo";

const SkeletonCard: React.FC = () => {
  return (
    <div className="flex h-28 w-full flex-col justify-center rounded border border-gray-700 bg-gray-800 p-5">
      <div className="flex items-center">
        <div className="mr-2 h-16 w-16 animate-pulse rounded-full border border-gray-600 bg-gray-700" />
        <div className="flex flex-col justify-center">
          <div className="mb-2 h-4 w-44 animate-pulse rounded bg-gray-700" />
          <div className="h-4 w-36 animate-pulse rounded bg-gray-700" />
        </div>
      </div>
      <div className="ml-auto h-4 w-32 animate-pulse rounded bg-gray-700" />
    </div>
  );
};

export default function BeenPwned() {
  const [pwnedId, setPwnedId] = useState<string>("");
  const { data: pwnedUser, isError } = api.accounts.getPreviewById.useQuery(
    pwnedId,
    {
      retry: false,
      trpc: { abortOnUnmount: true },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      enabled: !!pwnedId && pwnedId.length >= 16,
    },
  );

  return (
    <>
      <Header />
      <NextSeo
        title="Have I been Pwned?"
        description="Check whether your own account was queried on our Discord Token checker."
      />
      <main>
        <BackgroundGrid />
        <Container className="relative pt-5">
          <div className="leading-[15px]">
            <h1 className="text-xl font-bold">Have I been Pwned?</h1>
            <span className="text-sm text-neutral-300">
              Check whether your own account was queried on this website
            </span>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="font-medium" htmlFor="file-type">
                Discord ID
              </label>
              <span className="block text-sm text-neutral-300">
                Can be found in your Discord user profile
              </span>
              <input
                className="mt-2 block w-full rounded border-2 border-blurple bg-gray-800 p-2 font-mono leading-tight caret-blurple outline-none focus:border-blurple-dark"
                spellCheck={false}
                placeholder="214772155114717184"
                onChange={(e) => setPwnedId(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              {pwnedUser && !isError ? (
                <div className="flex h-28 w-full flex-col rounded border border-gray-700 bg-gray-800 p-5">
                  <div className="flex items-center">
                    <DiscordAvatar user={pwnedUser} />
                    <div className="ml-4 text-left">
                      <div className="flex items-center space-x-2 text-sm">
                        {isMigratedUser(pwnedUser) ? (
                          <span className="font-medium">
                            {usernameOrTag(pwnedUser)}
                          </span>
                        ) : (
                          <div>
                            <span className="font-medium">
                              {pwnedUser.username}
                            </span>
                            <span className="text-xs text-gray-300">
                              #{pwnedUser.discriminator}
                            </span>
                          </div>
                        )}
                        <BadgeList user={pwnedUser} />
                      </div>
                      <small className="text-xs text-gray-300">
                        {pwnedUser.id}
                      </small>
                    </div>
                  </div>

                  <div className="inline-flex justify-end gap-2">
                    <div className="inline-flex items-center text-xs">
                      <FiFile className="mr-1" />
                      <span>
                        {pwnedUser._count.tokens}{" "}
                        {pwnedUser._count.tokens > 1 ? "entries" : "entry"}
                      </span>
                    </div>

                    <div className="inline-flex items-center text-xs">
                      <FiClock className="mr-1" />
                      <span>
                        {new Date(pwnedUser.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : !isError ? (
                <SkeletonCard />
              ) : (
                <div className="h-28 w-full rounded border border-gray-700 bg-gray-800 p-5">
                  <h3 className="text-lg font-bold">No Account Found</h3>
                  <p className="text-sm text-neutral-300">
                    There are no tokens associated with this account :)
                  </p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
