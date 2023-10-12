import Box from "~/components/common/BoxComponent";
import DiscordAvatar from "~/components/DiscordAvatar";
import { isMigratedUser, usernameOrTag } from "~/lib/utils";
import BadgeList from "~/components/common/discord/BadgeList";
import { type Account, useAccountStore } from "~/lib/store";
import clsx from "clsx";
import { FiX } from "react-icons/fi";

const DeleteAccountButton = ({ account }: { account: Account }) => {
  const { removeAccount } = useAccountStore();
  return (
    <button
      className="absolute right-2 top-2 flex h-3.5 w-3.5 items-center rounded-full bg-red-600 p-0.5 text-neutral-200 transition duration-150 hover:bg-red-700"
      onClick={() => removeAccount(account)}
    >
      <FiX className="h-6 w-6" />
    </button>
  );
};

interface IAccountWithUserCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  account: Account;
}

const AccountWithUserCard: React.FC<IAccountWithUserCardProps> = ({
  account,
  className,
  ...props
}) => {
  const { user } = account;
  return (
    <Box
      className={clsx(
        "relative !px-3 !py-4 text-center transition duration-200 hover:-translate-y-1",
        className,
      )}
      {...props}
    >
      <div className="flex items-center">
        <DiscordAvatar user={user} />
        <div className="ml-4 text-left">
          <div className="flex items-center space-x-2 truncate text-sm">
            {isMigratedUser(user) ? (
              <span className="font-medium">{usernameOrTag(user)}</span>
            ) : (
              <div className="truncate lg:max-w-[180px]">
                <span className="font-medium">{user.username}</span>
                <span className="text-xs text-neutral-300">
                  #{user.discriminator}
                </span>
              </div>
            )}
            <BadgeList user={user} className="hidden md:flex" />
          </div>
          <small className="text-xs text-neutral-300">{user.id}</small>
        </div>
      </div>
      <DeleteAccountButton account={account} />
    </Box>
  );
};

export default AccountWithUserCard;
