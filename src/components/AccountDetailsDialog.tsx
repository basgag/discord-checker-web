import { type MouseEvent, type PropsWithChildren, useState } from "react";
import { Dialog } from "@headlessui/react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiLogIn,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import { type Account } from "~/lib/store";
import clsx from "clsx";
import { poppins } from "~/pages/_app";
import { snowflakeToMilliseconds } from "~/lib/dapi";
import DiscordAvatar from "~/components/DiscordAvatar";
import BadgeList from "~/components/BadgeList";
import { isMigratedUser, usernameOrTag } from "~/lib/utils";

interface ExportDialogProps {
  account: Account;
}

const AccountDetailsDialog: React.FC<PropsWithChildren<ExportDialogProps>> = ({
  account,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChildClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;

    if (target instanceof HTMLButtonElement || target instanceof SVGElement) {
      return;
    }

    setIsOpen(true);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className={clsx(poppins.variable, "relative font-sans")}
      >
        <div className="fixed inset-0 bg-black/60" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-lg rounded border border-gray-800 bg-gray-900 px-3 py-4">
            <Dialog.Title className="flex items-center text-xl font-bold">
              <FiUser className="mr-2" />
              Account Details
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-sm text-gray-300">
              View the important details of this account
            </Dialog.Description>

            <div className="py-5">
              <div className="flex items-center space-x-4">
                <DiscordAvatar user={account.user} size={64} />
                <div className="mb-2 text-lg">
                  {isMigratedUser(account.user) ? (
                    <h2 className="font-bold">{usernameOrTag(account.user)}</h2>
                  ) : (
                    <div>
                      <span className="font-bold">{account.user.username}</span>
                      <span className="text-xs text-gray-300">
                        #{account.user.discriminator}
                      </span>
                    </div>
                  )}

                  <BadgeList user={account.user} />
                </div>
              </div>
            </div>

            <div className="py-2">
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <tbody>
                    <tr className="border border-gray-600 text-left">
                      <th className="border-r border-gray-600 px-2 py-1">ID</th>
                      <td className="px-2 py-1">{account.user.id}</td>
                    </tr>
                    <tr className="border border-gray-600 text-left">
                      <th className="border-r border-gray-600 px-2 py-1">
                        Verified
                      </th>
                      <td className="px-2 py-1">
                        {account.user.verified ? (
                          <FiCheckCircle className="text-green-500" />
                        ) : (
                          <FiXCircle className="text-red-500" />
                        )}
                      </td>
                    </tr>
                    <tr className="border border-gray-600 text-left">
                      <th className="border-r border-gray-600 px-2 py-1">
                        Email
                      </th>
                      <td className="px-2 py-1">{account.user.email ?? "-"}</td>
                    </tr>
                    <tr className="border border-gray-600 text-left">
                      <th className="border-r border-gray-600 px-2 py-1">
                        Phone
                      </th>
                      <td className="px-2 py-1">{account.user.phone ?? "-"}</td>
                    </tr>
                    <tr className="border border-gray-600 text-left">
                      <th className="border-r border-gray-600 px-2 py-1">
                        MFA
                      </th>
                      <td className="px-2 py-1">
                        {account.user.mfa_enabled ? (
                          <FiCheckCircle className="text-green-500" />
                        ) : (
                          <FiAlertTriangle className="text-yellow-500" />
                        )}
                      </td>
                    </tr>
                    <tr className="border border-gray-600 text-left">
                      <th className="border-r border-gray-600 px-2 py-1">
                        Account Creation
                      </th>
                      <td className="px-2 py-1">
                        {new Date(
                          snowflakeToMilliseconds(account.user.id),
                        ).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="py-2">
              <h2 className="mb-1 font-medium">
                Tokens ({account.tokens.length})
              </h2>

              <div className="overflow-hidden text-ellipsis rounded border border-gray-700 bg-gray-800 p-1 text-sm">
                {account.tokens.map((token, index) => (
                  <div key={`${account.user.id}-token-${index}`}>
                    <input name="token" type="hidden" value={token} />
                    <span className="mb-1">{token}</span>
                  </div>
                ))}
              </div>

              <hr className="my-6 border-gray-700" />

              <p className="mt-2 text-sm text-gray-200">
                Use the Chrome extension to directly login.
              </p>
              <button
                name="fast-login"
                className="mt-2 inline-flex items-center rounded bg-blurple px-2 py-1 transition duration-150 hover:bg-blurple-dark"
              >
                <FiLogIn className="mr-2" />
                Fast Login
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      <div onClick={handleChildClick} className="cursor-pointer">
        {children}
      </div>
    </>
  );
};

export default AccountDetailsDialog;
