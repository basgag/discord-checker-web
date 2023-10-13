import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";

import AdminLayout from "~/layouts/AdminLayout";
import TokenRateChart from "~/components/admin/dashboard/TokenRateChart";
import AccountCountryChart from "~/components/admin/dashboard/AccountCountryChart";
import Box from "~/components/common/BoxComponent";
import AccountStats from "~/components/admin/dashboard/AccountStats";

export default function Dashboard() {
  return (
    <AdminLayout heading="Dashboard">
      <div className="grid grid-cols-12 gap-6">
        <AccountStats />

        <div className="col-span-full grid grid-cols-1 grid-rows-1 gap-6 overflow-hidden lg:grid-cols-2">
          <div className="pt-5">
            <div className="pb-5 leading-[15px]">
              <h1 className="text-xl font-bold">Country Overiew</h1>
              <span className="text-base text-neutral-300">
                Stored accounts by their location
              </span>
            </div>

            <Box className="h-96 w-full bg-opacity-80 !p-2">
              <AccountCountryChart />
            </Box>
          </div>

          <div className="pt-5">
            <div className="pb-5 leading-[15px]">
              <h1 className="text-xl font-bold">Tokens per Day</h1>
              <span className="text-base text-neutral-300">
                Counts of tokens per origin
              </span>
            </div>
            <Box className="h-96 w-full bg-opacity-80 !p-2 backdrop-blur">
              <TokenRateChart />
            </Box>
          </div>
        </div>
      </div>
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
