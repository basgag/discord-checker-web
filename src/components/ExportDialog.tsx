import { type ChangeEvent, useMemo, useState } from "react";
import { Dialog, Switch } from "@headlessui/react";
import { FiDownload, FiExternalLink } from "react-icons/fi";
import { type Account } from "~/lib/store";
import clsx from "clsx";
import { poppins } from "~/pages/_app";
import { UserPremiumType } from "discord-api-types/v10";
import OptionSwitch from "~/components/common/OptionSwitch";

interface ExportDialogProps {
  accounts: Account[];
}

const ExportDialog: React.FC<ExportDialogProps> = ({ accounts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);
  const [isVerifiedOnly, setVerifiedOnly] = useState(false);
  const [isNitroOnly, setNitroOnly] = useState(false);

  const verifiedFilter = (account: Account) => {
    if (!isVerifiedOnly) {
      return true;
    }

    return account.user.verified;
  };

  const nitroFilter = (account: Account) => {
    if (!isNitroOnly) {
      return true;
    }

    return (
      account.user.premium_type !== UserPremiumType.None &&
      account.user.premium_type !== undefined
    );
  };

  const combinedFilter = (account: Account) => {
    return verifiedFilter(account) && nitroFilter(account);
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter(combinedFilter);
  }, [accounts, isVerifiedOnly, isNitroOnly]);

  const handleSelectOption = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(Number(event.target.value));
  };

  const handleGenerate = () => {
    const option = options[selectedOption];
    if (!option) {
      return;
    }

    const content = encodeURIComponent(option.generator(filteredAccounts));
    const filename = `tokens-${Date.now()}.${option.extension}`;

    const href = `data:text/plain;charset=utf-8,${content}`;
    const link = document.createElement("a");

    link.setAttribute("href", href);
    link.setAttribute("download", filename);
    link.click();
    link.remove();
  };

  const options = [
    {
      index: 0,
      name: "Plain Text",
      extension: "txt",
      generator: (accounts: Account[]) => {
        return accounts.map((account) => account.tokens.join("\n")).join("\n");
      },
    },
    {
      index: 1,
      name: "JSON",
      extension: "json",
      generator: (accounts: Account[]) => {
        return JSON.stringify(accounts, null, 2);
      },
    },
    {
      index: 2,
      name: "CSV",
      extension: "csv",
      generator: (accounts: Account[]) => {
        const header = [
          "Username",
          "Discriminator",
          "ID",
          "Email",
          "Phone",
          "Nitro",
          "Tokens",
        ];
        const rows = accounts.map((account) => [
          account.user.username,
          account.user.discriminator,
          account.user.id,
          account.user.email,
          account.user.phone,
          ["None", "Classic", "Full", "Basic"][account.user.premium_type ?? 0],
          account.tokens.join("\n"),
        ]);
        return [header, ...rows].map((row) => row.join(",")).join("\n");
      },
    },
  ];

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
              <FiExternalLink className="mr-2" />
              Export Tokens
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-sm text-gray-300">
              Download all checked tokens in one of the supported formats:
            </Dialog.Description>

            <div className="py-5">
              <label className="font-medium" htmlFor="file-type">
                File Type
              </label>
              <select
                name="file-type"
                id="file-type"
                className="mt-1 block w-full rounded border-2 border-blurple bg-gray-800 p-2 outline-none focus:border-blurple-dark"
                onChange={handleSelectOption}
              >
                {options.map((option) => (
                  <option key={option.name} value={option.index}>
                    {option.name} (.{option.extension})
                  </option>
                ))}
              </select>
            </div>

            <div className="py-2">
              <h2 className="mb-1 font-medium">Preview</h2>
              <pre className="slim-scrollbar max-h-96 overflow-y-auto overflow-x-hidden text-ellipsis rounded border border-gray-700 bg-gray-800 p-2 text-xs">
                {options[selectedOption]!.generator(
                  filteredAccounts.slice(0, 5),
                ) || "No preview available."}
              </pre>
            </div>

            <hr className="my-2 border-gray-700" />

            <div className="my-6 space-y-4">
              <OptionSwitch
                name="Verified Accounts"
                description="Filter out unverified accounts"
                condition={isVerifiedOnly}
                stateSetter={() => setVerifiedOnly(!isVerifiedOnly)}
              />
              <OptionSwitch
                name="Nitro Accounts"
                description="Filter out accounts without Discord Nitro"
                condition={isNitroOnly}
                stateSetter={() => setNitroOnly(!isNitroOnly)}
              />
            </div>

            <button
              className="flex items-center rounded bg-blurple px-2 py-1.5 font-medium outline-none transition duration-150 hover:bg-blurple-dark disabled:opacity-50"
              onClick={handleGenerate}
              disabled={filteredAccounts.length === 0}
            >
              <FiDownload className="mr-2" size={20} />
              Download
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
      <button
        className="flex items-center rounded bg-blurple px-2 py-1.5 font-medium outline-none transition duration-150 hover:bg-blurple-dark disabled:opacity-50"
        disabled={accounts.length === 0}
        onClick={() => setIsOpen(true)}
      >
        <FiExternalLink size={20} className="mr-2" />
        Export
      </button>
    </>
  );
};

export default ExportDialog;
