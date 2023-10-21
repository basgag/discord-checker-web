import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";
import AdminLayout from "~/layouts/AdminLayout";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useEffect } from "react";
import AccountGuildOverview from "~/components/admin/accounts/AccountGuildOverview";
import Button from "~/components/common/Button";
import { FiLogIn } from "react-icons/fi";
import DiscordAvatar from "~/components/DiscordAvatar";
import { isMigratedUser, usernameOrTag } from "~/lib/utils";
import BadgeList from "~/components/common/discord/BadgeList";
import PaymentMethodsOverview from "~/components/admin/accounts/PaymentMethodsOverview";

export default function AccountDetails() {
  const router = useRouter();
  const { id } = router.query;

  const { data: account, error } = api.accounts.getById.useQuery(id as string);
  const notFound = error && error.data?.code === "NOT_FOUND";

  useEffect(() => {
    if (notFound) {
      void router.push("/admin/accounts");
    }
  }, [notFound, router]);

  return (
    <AdminLayout>
      {account && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-full overflow-hidden">
            <div className="flex items-center space-x-4">
              <DiscordAvatar user={account} />
              <div className="flex items-center space-x-2">
                <div className="mb-2 text-lg">
                  {isMigratedUser(account) ? (
                    <h2 className="font-bold">{usernameOrTag(account)}</h2>
                  ) : (
                    <div>
                      <span className="font-bold">{account.username}</span>
                      <span className="text-xs text-neutral-300">
                        #{account.discriminator}
                      </span>
                    </div>
                  )}

                  <span className="text-sm text-neutral-200">{account.id}</span>
                </div>
                <BadgeList user={account} />
              </div>
            </div>
          </div>
        </div>
      )}

      <AccountGuildOverview userId={account?.id ?? ""} />
      <PaymentMethodsOverview userId={account?.id ?? ""} />

      <div>
        {account?.tokens.map((t) => (
          <input type="hidden" name="token" value={t.value} key={t.value} />
        ))}
      </div>
      <Button name="fast-login">
        <FiLogIn className="h-4 w-4" />
        <span>Fast Login</span>
      </Button>
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

  const id = context.params?.id;
  if (!id || id.length < 17) {
    return {
      redirect: {
        destination: "/admin/accounts",
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
