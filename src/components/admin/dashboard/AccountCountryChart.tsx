import dynamic from "next/dynamic";
import { api } from "~/utils/api";
import CountryFeatures from "~/lib/world_countries.json";

const ResponsiveChoroplethCanvas = dynamic(
  () => import("@nivo/geo").then((m) => m.ResponsiveChoroplethCanvas),
  { ssr: false },
);

const AccountCountryChart: React.FC = () => {
  const { data: countries } = api.accounts.getCountryDistribution.useQuery(
    undefined,
    {
      refetchInterval: 10_000,
    },
  );

  if (!countries) {
    return (
      <div className="h-full w-full animate-pulse rounded-lg bg-blueish-grey-600/80" />
    );
  }

  return (
    <ResponsiveChoroplethCanvas
      data={countries}
      features={CountryFeatures.features}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      colors={[
        "#5159b2",
        "#515abf",
        "#515bcc",
        "#515cd8",
        "#505ee5",
        "#505ff2",
        "#5060ff",
      ]} // Descending order of red shades
      domain={[Math.max(...countries.map((country) => country.value)) * 1.1, 0]}
      unknownColor="#C6CFE6"
      label="properties.name"
      projectionTranslation={[0.5, 0.5]}
      borderWidth={0.5}
      borderColor="#000"
      theme={{
        tooltip: {
          container: {
            background: "#0B1324",
            border: "1px solid #202C4A",
            fontSize: 12,
          },
        },
      }}
    />
  );
};

export default AccountCountryChart;
