import { api } from "~/utils/api";
import { FiAlertTriangle, FiCheckCircle, FiStar } from "react-icons/fi";
import clsx from "clsx";
import { type IconType } from "react-icons";

interface IStatsEntry {
  name: string;
  icon: IconType;
  key: string;
  textColor: string;
  gradient: string;
  borderColor: string;
}

const entries = [
  {
    name: "Verified Accounts",
    icon: FiCheckCircle,
    key: "verified",
    textColor: "text-green-100",
    gradient: "from-green-700 via-green-800 to-green-900",
    borderColor: "border-green-500",
  },
  {
    name: "Unverified Accounts",
    icon: FiAlertTriangle,
    key: "unverified",
    textColor: "text-yellow-100",
    gradient: "from-yellow-700 via-yellow-800 to-yellow-900",
    borderColor: "border-yellow-500",
  },
  {
    name: "Nitro Accounts",
    icon: FiStar,
    key: "nitro",
    textColor: "text-purple-100",
    gradient: "from-purple-700 via-purple-800 to-purple-900",
    borderColor: "border-purple-500",
  },
] as const;

interface ISkeletonStatsCardProps {
  entry: IStatsEntry;
}

const SkeletonStatsCard: React.FC<ISkeletonStatsCardProps> = ({ entry }) => {
  const { gradient, icon: Icon, textColor, borderColor, name } = entry;
  return (
    <div
      className={clsx(
        "flex flex-row rounded-lg border bg-gradient-to-r p-6",
        borderColor,
        gradient,
      )}
    >
      <div className="my-auto">
        <div className={clsx("text-lg font-medium text-opacity-70", textColor)}>
          {name}
        </div>
        <div className="h-[40px] w-32 animate-pulse rounded-lg bg-blueish-grey-600/20" />
      </div>
      <div
        className={clsx(
          "my-auto ml-auto rounded-full bg-gradient-to-l p-4  text-opacity-70",
          textColor,
          gradient,
        )}
      >
        <Icon className="flex text-2xl" />
      </div>
    </div>
  );
};

const AccountStats: React.FC = () => {
  const { data: stats } = api.accounts.getStats.useQuery(undefined, {
    refetchInterval: 10_000,
  });

  if (!stats) {
    return (
      <div className="col-span-full grid grid-cols-1 grid-rows-1 gap-4 overflow-hidden md:grid-cols-3">
        {entries.map((entry) => {
          return (
            <SkeletonStatsCard entry={entry} key={`skel-stats-${entry.key}`} />
          );
        })}
      </div>
    );
  }

  return (
    <div className="col-span-full grid grid-cols-1 grid-rows-1 gap-4 overflow-hidden md:grid-cols-3">
      {entries.map(
        ({ gradient, icon: Icon, textColor, borderColor, key, name }) => (
          <div
            key={`stats-${key}`}
            className={clsx(
              "flex flex-row rounded-lg border bg-gradient-to-r p-6",
              borderColor,
              gradient,
            )}
          >
            <div className="my-auto">
              <div
                className={clsx(
                  "text-lg font-medium text-opacity-70",
                  textColor,
                )}
              >
                {name}
              </div>
              <div className={clsx("text-4xl", textColor)}>{stats[key]}</div>
            </div>
            <div
              className={clsx(
                "my-auto ml-auto rounded-full bg-gradient-to-l p-4  text-opacity-70",
                textColor,
                gradient,
              )}
            >
              <Icon className="flex text-2xl" />
            </div>
          </div>
        ),
      )}
    </div>
  );
};

export default AccountStats;
