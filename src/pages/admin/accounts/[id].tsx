import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";
import AdminLayout from "~/layouts/AdminLayout";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useEffect } from "react";

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
    <AdminLayout heading="Discord Accounts">
      <div>
        {account?.tokens.map((t) => (
          <input type="hidden" name="token" value={t.value} key={t.value} />
        ))}
      </div>
      <button name="fast-login">Fast Login</button>
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
