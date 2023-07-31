import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";
import AdminLayout from "~/layouts/AdminLayout";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function AccountDetails() {
  const router = useRouter();
  const { id } = router.query;

  const { data: account, error } = api.accounts.getById.useQuery(id as string);
  const notFound = error && error.data?.code === "NOT_FOUND";

  return (
    <AdminLayout>
      {notFound && (
        <div>
          <h1 className="text-3xl font-bold">Account not found</h1>
          <span className="text-neutral-300">This account does not exist</span>
        </div>
      )}

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
