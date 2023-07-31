import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { FiAlertTriangle, FiCheckCircle, FiStar } from "react-icons/fi";

const ResponsiveChoroplethCanvas = dynamic(
  () => import("@nivo/geo").then((m) => m.ResponsiveChoroplethCanvas),
  { ssr: false },
);
const ResponsiveLine = dynamic(
  () => import("@nivo/line").then((m) => m.ResponsiveLine),
  { ssr: false },
);

import CountryFeatures from "~/lib/world_countries.json";
import dynamic from "next/dynamic";
import AdminLayout from "~/layouts/AdminLayout";

const SkeletonStatsCard: React.FC = () => {
  return (
    <div className="flex flex-row items-center rounded-lg border-2 border-gray-700 bg-gray-800 p-6">
      <div>
        <div className="mb-2 h-5 w-44 animate-pulse rounded bg-gray-700" />
        <div className="h-10 w-32 animate-pulse rounded bg-gray-700" />
      </div>
      <div className="my-auto ml-auto animate-pulse rounded-full bg-gray-700 p-[26px]" />
    </div>
  );
};

export default function Dashboard() {
  const { data: auth } = useSession();
  const { data: stats } = api.accounts.getStats.useQuery();
  const { data: countries } = api.accounts.getCountryDistribution.useQuery();
  const { data: tokenRates } = api.accounts.getTokenRates.useQuery();

  return (
    <AdminLayout>
      <div className="pb-5 leading-[15px]">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <span className="text-neutral-300">
          Welcome back, <b>{auth?.user?.name}</b>!
        </span>
      </div>

      {stats ? (
        <div className="grid grid-cols-1 grid-rows-1 gap-2 md:grid-cols-3">
          <div className="flex flex-row rounded-lg border-2 border-green-500 bg-gradient-to-r from-green-700 via-green-800 to-green-900 p-6">
            <div className="my-auto">
              <div className="text-lg font-medium text-green-300">
                Verified Accounts
              </div>
              <div className="text-4xl text-green-100">{stats.verified}</div>
            </div>
            <div className="my-auto ml-auto rounded-full bg-gradient-to-l from-green-700 via-green-800 to-green-900 p-4 text-green-300">
              <FiCheckCircle className="flex text-2xl" />
            </div>
          </div>
          <div className="flex flex-row rounded-lg border-2 border-yellow-500 bg-gradient-to-r from-yellow-700 via-yellow-800 to-yellow-900 p-6">
            <div className="my-auto">
              <div className="text-lg font-medium text-yellow-300">
                Unverified Accounts
              </div>
              <div className="text-4xl text-yellow-100">{stats.unverified}</div>
            </div>
            <div className="my-auto ml-auto rounded-full bg-gradient-to-l from-yellow-700 via-yellow-800 to-yellow-900 p-4 text-yellow-300">
              <FiAlertTriangle className="flex text-2xl" />
            </div>
          </div>
          <div className="flex flex-row rounded-lg border-2 border-purple-500 bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900 p-6">
            <div className="my-auto">
              <div className="text-lg font-medium text-purple-300">
                Nitro Accounts
              </div>
              <div className="text-4xl text-purple-100">{stats.nitro}</div>
            </div>
            <div className="my-auto ml-auto rounded-full bg-gradient-to-l from-purple-700 via-purple-800 to-purple-900 p-4 text-purple-300">
              <FiStar className="flex text-2xl" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 grid-rows-1 gap-2 md:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, index) => {
              return <SkeletonStatsCard key={`sp-${index}`} />;
            })}
        </div>
      )}

      <div className="grid grid-cols-1 grid-rows-1 gap-2 lg:grid-cols-2">
        <div className="pt-5">
          <div className="pb-5 leading-[15px]">
            <h1 className="text-xl font-bold">Country Overiew</h1>
            <span className="text-sm text-neutral-300">
              Stored accounts by their location
            </span>
          </div>

          <div className="h-96 w-full rounded border border-gray-700 bg-black/50 p-2">
            {countries ? (
              <ResponsiveChoroplethCanvas
                data={countries}
                features={CountryFeatures.features}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                colors="reds"
                domain={[
                  0,
                  Math.floor(
                    countries.reduce((a, b) => a + b.value, 0) /
                      countries.length,
                  ),
                ]}
                unknownColor="#142669"
                label="properties.name"
                projectionTranslation={[0.5, 0.5]}
                borderWidth={0.5}
                borderColor="#000"
                theme={{
                  tooltip: {
                    container: {
                      background: "#000",
                      fontSize: 12,
                    },
                  },
                }}
              />
            ) : (
              <div className="h-full w-full animate-pulse rounded bg-gray-800" />
            )}
          </div>
        </div>

        <div className="pt-5">
          <div className="pb-5 leading-[15px]">
            <h1 className="text-xl font-bold">Tokens per Day</h1>
            <span className="text-sm text-neutral-300">
              Counts of tokens per origin
            </span>
          </div>
          <div className="h-96 w-full rounded border border-gray-700 bg-black/50 p-2">
            {tokenRates ? (
              <ResponsiveLine
                data={tokenRates}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: "point" }}
                yScale={{
                  type: "linear",
                  min: 0,
                  max: "auto",
                  stacked: true,
                  reverse: false,
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Date",
                  legendOffset: 36,
                  legendPosition: "middle",
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Tokens",
                  legendOffset: -50,
                  legendPosition: "middle",
                }}
                pointSize={5}
                pointColor={{ from: "color" }}
                pointBorderWidth={2}
                useMesh={true}
                enableGridX={false}
                theme={{
                  background: "transparent",
                  axis: {
                    domain: {
                      line: {
                        stroke: "#fff",
                        strokeWidth: 1,
                      },
                    },
                    legend: {
                      text: {
                        fontSize: 12,
                        fill: "#fff",
                        outlineWidth: 0,
                        outlineColor: "transparent",
                      },
                    },
                    ticks: {
                      line: {
                        stroke: "#fff",
                        strokeWidth: 1,
                      },
                      text: {
                        fontSize: 11,
                        fill: "#fff",
                        outlineWidth: 0,
                        outlineColor: "transparent",
                      },
                    },
                  },
                  tooltip: {
                    container: {
                      background: "#000",
                      fontSize: 12,
                    },
                  },
                  legends: {
                    title: {
                      text: {
                        fontSize: 11,
                        fill: "#fff",
                        outlineWidth: 0,
                        outlineColor: "transparent",
                      },
                    },
                    text: {
                      fontSize: 11,
                      fill: "#fff",
                      outlineWidth: 0,
                      outlineColor: "transparent",
                    },
                    ticks: {
                      line: {},
                      text: {
                        fontSize: 10,
                        fill: "#fff",
                        outlineWidth: 0,
                        outlineColor: "transparent",
                      },
                    },
                  },
                }}
                legends={[
                  {
                    anchor: "bottom-right",
                    direction: "column",
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: "left-to-right",
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: "circle",
                    symbolBorderColor: "rgba(0, 0, 0, .5)",
                    effects: [
                      {
                        on: "hover",
                        style: {
                          itemBackground: "rgba(0, 0, 0, .03)",
                          itemOpacity: 1,
                        },
                      },
                    ],
                  },
                ]}
              />
            ) : (
              <div className="h-full w-full animate-pulse rounded bg-gray-800" />
            )}
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
