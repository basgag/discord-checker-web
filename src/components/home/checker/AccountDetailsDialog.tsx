import {
  FiAlertTriangle,
  FiCheckCircle,
  FiLogIn,
  FiXCircle,
} from "react-icons/fi";
import { type Account } from "~/lib/store";
import { snowflakeToMilliseconds } from "~/lib/dapi";
import DiscordAvatar from "~/components/DiscordAvatar";
import { isMigratedUser, usernameOrTag } from "~/lib/utils";
import BadgeList from "~/components/common/discord/BadgeList";
import Modal, { type IModalProps } from "~/components/common/Modal";
import Button from "~/components/common/Button";

interface IAccountDetailsDialogProps extends IModalProps {
  account: Account;
}

const AccountDetailsDialog: React.FC<IAccountDetailsDialogProps> = ({
  account,
  ...props
}) => {
  const tableValues = [
    {
      name: "ID",
      value: account.user.id,
    },
    {
      name: "Verified",
      value: account.user.verified ? (
        <FiCheckCircle className="text-green-500" />
      ) : (
        <FiXCircle className="text-red-500" />
      ),
    },
    {
      name: "Email",
      value: account.user.email ?? "-",
    },
    {
      name: "Phone",
      value: account.user.phone ?? "-",
    },
    {
      name: "MFA",
      value: account.user.mfa_enabled ? (
        <FiCheckCircle className="text-green-500" />
      ) : (
        <FiAlertTriangle className="text-yellow-500" />
      ),
    },
    {
      name: "Account Creation",
      value: new Date(
        snowflakeToMilliseconds(account.user.id),
      ).toLocaleString(),
    },
  ];

  return (
    <Modal {...props}>
      <Modal.Head
        title="Account Details"
        description="View the important details of this account"
      />

      <div className="my-4 flex items-center space-x-4">
        <DiscordAvatar user={account.user} size={64} />
        <div className="mb-2 text-lg">
          {isMigratedUser(account.user) ? (
            <h2 className="font-bold">{usernameOrTag(account.user)}</h2>
          ) : (
            <div>
              <span className="font-bold">{account.user.username}</span>
              <span className="text-xs text-neutral-300">
                #{account.user.discriminator}
              </span>
            </div>
          )}

          <BadgeList user={account.user} />
        </div>
      </div>

      <div className="my-4 overflow-x-auto">
        <table className="min-w-full table-auto">
          <tbody>
            {tableValues.map((value, index) => (
              <tr
                className="border border-blueish-grey-600/80 text-left"
                key={`details-${account.user.id}-${index}`}
              >
                <th className="border-r border-blueish-grey-600/80 px-2 py-1">
                  {value.name}
                </th>
                <td className="px-2 py-1">{value.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="py-2">
        <h2 className="mb-1 font-medium">Tokens ({account.tokens.length})</h2>

        <div className="rounded border border-blueish-grey-600 bg-blueish-grey-700/80 p-1 text-sm font-light">
          {account.tokens.map((token, index) => (
            <div key={`${account.user.id}-token-${index}`} className="truncate">
              <span className="mb-1">{token}</span>
            </div>
          ))}
        </div>
      </div>

      {account.tokens.length > 0 && (
        <Modal.ActionRow>
          <input name="token" type="hidden" value={account.tokens[0]} />
          <Button name="fast-login" className="mt-6">
            <FiLogIn className="h-5 w-5" />
            <span>Fast Login</span>
          </Button>
          <p className="mt-4 text-xs text-neutral-300">
            Requires the Chrome extension to be installed.
          </p>
        </Modal.ActionRow>
      )}
    </Modal>
  );
};

export default AccountDetailsDialog;
