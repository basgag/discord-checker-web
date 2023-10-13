import dynamic from "next/dynamic";
import { api } from "~/utils/api";

const ResponsiveLine = dynamic(
  () => import("@nivo/line").then((m) => m.ResponsiveLine),
  { ssr: false },
);

const TokenRateChart: React.FC = () => {
  const { data: tokenRates } = api.accounts.getTokenRates.useQuery(undefined, {
    refetchInterval: 10_000,
  });

  if (!tokenRates) {
    return (
      <div className="h-full w-full animate-pulse rounded-lg bg-blueish-grey-600/80" />
    );
  }

  return (
    <ResponsiveLine
      data={tokenRates}
      curve="catmullRom"
      margin={{ top: 25, right: 110, bottom: 50, left: 60 }}
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
        tickSize: 0,
        tickPadding: 10,
        tickRotation: 0,
        legend: "Date",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickSize: 0,
        tickPadding: 10,
        tickRotation: 0,
        legend: "Tokens",
        legendOffset: -50,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={10}
      pointColor={{ from: "color", modifiers: [] }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabel="y"
      pointLabelYOffset={-12}
      areaOpacity={0.25}
      useMesh={true}
      defs={[
        {
          id: "gradientC",
          type: "linearGradient",
          colors: [
            { offset: 0, color: "#e65a14" },
            { offset: 100, color: "#7e2801" },
          ],
        },
      ]}
      fill={[{ match: "*", id: "gradientC" }]}
      animate={true}
      lineWidth={2}
      enablePoints={false}
      enableArea={true}
      theme={{
        background: "transparent",
        crosshair: {
          line: {
            strokeWidth: 0,
          },
        },
        axis: {
          domain: {
            line: {
              stroke: "#C6CFE6",
              strokeWidth: 1,
            },
          },
          legend: {
            text: {
              fontSize: 11,
              fill: "#C6CFE6",
              outlineWidth: 0,
              outlineColor: "transparent",
            },
          },
          ticks: {
            line: {
              strokeWidth: 0,
            },
            text: {
              fontSize: 11,
              fill: "#C6CFE6",
              outlineWidth: 0,
              outlineColor: "transparent",
            },
          },
        },
        tooltip: {
          container: {
            background: "#0B1324",
            border: "1px solid #202C4A",
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
          symbolBorderWidth: 2,
          symbolBorderColor: "#202C4A",
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
  );
};

export default TokenRateChart;
