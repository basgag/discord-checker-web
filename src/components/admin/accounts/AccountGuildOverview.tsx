import { api } from "~/utils/api";
import BoxWithHeader from "~/components/admin/common/BoxWithHeader";
import { FiHash, FiUsers } from "react-icons/fi";
import clsx from "clsx";
import { FaCircle, FaCrown } from "react-icons/fa";
import GuildIcon from "~/components/admin/accounts/GuildIcon";
import Button from "~/components/common/Button";
import { FaMagnifyingGlass } from "react-icons/fa6";

interface IAccountGuildOverviewProps {
  userId: string;
}

const SkeletonGuildOverview: React.FC = () => {
  return (
    <div className="h-[65px] w-full animate-pulse bg-blueish-grey-600/80" />
  );
};

const AccountGuildOverview: React.FC<IAccountGuildOverviewProps> = ({
  userId,
}) => {
  const { data: guilds } = api.accounts.getGuildsById.useQuery(userId, {
    enabled: !!userId,
  });

  return (
    <BoxWithHeader headline="Server Overview">
      {!guilds
        ? Array.from({ length: 5 }).map((_, index) => (
            <SkeletonGuildOverview key={index} />
          ))
        : guilds
            .sort(
              (a, b) =>
                (b.approximate_member_count ?? 0) -
                (a.approximate_member_count ?? 0),
            )
            .sort((a, b) => Number(b.owner) - Number(a.owner))
            .sort((a, b) => Number(b.permissions) - Number(a.permissions))
            .slice(0, 5)
            .map((guild, index) => {
              return (
                <div
                  key={guild.id}
                  className={clsx(
                    "border-x border-t border-blueish-grey-500/20 bg-blueish-grey-600 p-2",
                    "cursor-pointer transition duration-200 hover:bg-blueish-grey-500/20",
                    index === 0 && "rounded-t",
                    index === guilds.slice(0, 5).length - 1 &&
                      "rounded-b border-b",
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className="pointer-events-none h-12 w-12 select-none rounded-full border border-blueish-grey-500/20">
                      <GuildIcon guild={guild} size={48} />
                    </div>
                    <div>
                      <p className="mb-1 text-base font-medium">{guild.name}</p>
                      <div className="flex items-center space-x-2 text-sm font-light text-neutral-200">
                        <div className="flex items-center space-x-1.5">
                          <FiHash className="h-3 w-3" />
                          <span>{guild.id}</span>
                        </div>
                        <hr className="h-3 border-l border-blueish-grey-500/40" />
                        <div className="flex items-center space-x-1.5">
                          <FiUsers className="h-3 w-3" />
                          <span>{guild.approximate_member_count ?? "?"}</span>
                        </div>
                        <hr className="h-3 border-l border-blueish-grey-500/40" />
                        <div className="flex items-center space-x-1.5">
                          <FaCircle className="h-3 w-3 text-green-300" />
                          <span>{guild.approximate_presence_count ?? "?"}</span>
                        </div>
                        {guild.owner && (
                          <>
                            <hr className="h-3 border-l border-blueish-grey-500/40" />
                            <div className="flex items-center space-x-1.5">
                              <FaCrown className="h-3 w-3 text-yellow-300" />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

      {!!guilds && guilds.length > guilds.slice(0, 5).length && (
        <div className="mt-4">
          <Button>
            <FaMagnifyingGlass className="h-4 w-4" />
            <span>Show all {guilds.length} servers</span>
          </Button>
        </div>
      )}
    </BoxWithHeader>
  );
};

export default AccountGuildOverview;
