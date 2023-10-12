import { useMemo, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { type Account } from "~/lib/store";
import { UserPremiumType } from "discord-api-types/v10";
import SwitchCategory from "~/components/common/SwitchCategory";
import Modal, { type IModalProps } from "~/components/common/Modal";
import Button from "~/components/common/Button";

interface IExportDialogProps extends IModalProps {
  accounts: Account[];
}

const ExportDialog: React.FC<IExportDialogProps> = ({ accounts, ...props }) => {
  const [selectedOption, setSelectedOption] = useState(0);
  const [isVerifiedOnly, setVerifiedOnly] = useState(false);
  const [isNitroOnly, setNitroOnly] = useState(false);

  const filteredAccounts = useMemo(() => {
    return accounts
      .filter((acc) => !isVerifiedOnly || acc.user.verified)
      .filter(
        (acc) =>
          !isNitroOnly ||
          (acc.user.premium_type !== UserPremiumType.None &&
            acc.user.premium_type !== undefined),
      );
  }, [accounts, isVerifiedOnly, isNitroOnly]);

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
      name: "Plain Text",
      extension: "txt",
      generator: (accounts: Account[]) => {
        return accounts.map((account) => account.tokens.join("\n")).join("\n");
      },
    },
    {
      name: "JSON",
      extension: "json",
      generator: (accounts: Account[]) => {
        return JSON.stringify(accounts, null, 2);
      },
    },
    {
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
    <Modal {...props}>
      <Modal.Head
        title="Export Tokens"
        description="Download all checked tokens in one of the supported formats"
      />

      <div className="my-4">
        <label className="ml-2 font-medium" htmlFor="file-type">
          File Type
        </label>
        <select
          name="file-type"
          id="file-type"
          className="mt-1 block w-full rounded-lg border border-blueish-grey-600/80 bg-blueish-grey-700 p-2 outline-none focus:border-blurple"
          onChange={(e) => setSelectedOption(Number(e.target.value))}
        >
          {options.map((option, index) => (
            <option key={option.name} value={index}>
              {option.name} (.{option.extension})
            </option>
          ))}
        </select>
      </div>

      <div className="my-2">
        <h2 className="mb-1 ml-2 font-medium">Preview</h2>
        <pre className="max-h-96 overflow-y-auto overflow-x-hidden text-ellipsis rounded-lg border border-blueish-grey-600/80 bg-blueish-grey-700 p-2 text-xs text-neutral-200 scrollbar-thin">
          {options[selectedOption]!.generator(filteredAccounts.slice(0, 5)) ||
            "No preview available."}
        </pre>
      </div>

      <div className="my-6 space-y-4">
        <SwitchCategory
          name="Verified Accounts"
          description="Filter out unverified accounts"
          checked={isVerifiedOnly}
          onChange={() => setVerifiedOnly(!isVerifiedOnly)}
        />
        <SwitchCategory
          name="Nitro Accounts"
          description="Filter out accounts without Discord Nitro"
          checked={isNitroOnly}
          onChange={() => setNitroOnly(!isNitroOnly)}
        />
      </div>

      <Modal.ActionRow>
        <Button
          onClick={handleGenerate}
          disabled={filteredAccounts.length === 0}
          className="mt-6"
        >
          <FiDownload className="h-5 w-5" />
          <span>Download</span>
        </Button>
      </Modal.ActionRow>
    </Modal>
  );
};

export default ExportDialog;
