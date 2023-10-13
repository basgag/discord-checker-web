import Box from "~/components/common/BoxComponent";
import DiscordAvatar from "~/components/DiscordAvatar";
import { isMigratedUser, usernameOrTag } from "~/lib/utils";
import BadgeList from "~/components/common/discord/BadgeList";
import { type Account as StoredAccount } from "~/lib/store";
import clsx from "clsx";
import { FiX } from "react-icons/fi";
import { type DiscordAccount } from "@prisma/client";

interface IDeleteAccountButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onDeleted?: IAccountWithUserCardProps["onDeleted"];
}

const DeleteAccountButton: React.FC<IDeleteAccountButtonProps> = ({
  onDeleted,
  ...props
}) => {
  return (
    <button
      className="absolute right-2 top-2 flex h-3.5 w-3.5 items-center rounded-full bg-red-600 p-0.5 text-neutral-200 transition duration-150 hover:bg-red-700 disabled:opacity-50"
      onClick={(e) => {
        e.preventDefault();
        if (onDeleted) {
          onDeleted();
        }
      }}
      {...props}
    >
      <FiX className="h-6 w-6" />
    </button>
  );
};

export const SkeletonAccountWithUserCard: React.FC = () => {
  return (
    <Box className="relative !px-3 !py-4 text-center transition duration-200 hover:-translate-y-1">
      <div className="flex items-center">
        <div className="h-16 w-16 animate-pulse rounded-full bg-blueish-grey-600/80" />
        <div className="ml-4 text-left">
          <div className="flex items-center space-x-2 truncate text-sm">
            <div className="h-[20px] w-32 animate-pulse rounded bg-blueish-grey-600/80" />
            <div className="flex items-center space-x-1">
              <div className="h-3 w-3 animate-pulse rounded-full bg-blueish-grey-600/80" />
              <div className="h-3 w-3 animate-pulse rounded-full bg-blueish-grey-600/80" />
            </div>
          </div>
          <div className="inline-flex h-[17px] w-[135px] animate-pulse rounded bg-blueish-grey-600/80" />
        </div>
      </div>
      <DeleteAccountButton disabled={true} />
    </Box>
  );
};

interface IAccountWithUserCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  account: DiscordAccount | StoredAccount;
  onDeleted: () => void;
}

const AccountWithUserCard: React.FC<IAccountWithUserCardProps> = ({
  account,
  className,
  onDeleted,
  ...props
}) => {
  const user = "user" in account ? account.user : account;
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
      <DeleteAccountButton onDeleted={onDeleted} />
    </Box>
  );
};

export default AccountWithUserCard;
