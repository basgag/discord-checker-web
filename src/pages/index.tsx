import Container from "~/components/Container";
import Header from "~/components/Header";
import { FiFilePlus, FiRefreshCcw } from "react-icons/fi";
import { useSettingsStore, useTokenStore } from "~/lib/store";
import { type ChangeEvent, useRef } from "react";
import { TOKEN_REGEX, TOKEN_REGEX_LEGACY } from "~/lib/utils";
import { useRouter } from "next/router";
import BackgroundGrid from "~/components/BackgroundGrid";
import OptionSwitch from "~/components/common/OptionSwitch";
import ChromeExtensionBanner from "~/components/common/ChromeExtensionBanner";

const SettingsSection: React.FC = () => {
  const { settings, setValue } = useSettingsStore();
  const { filterByRegex } = useTokenStore();

  const handleIncludeLegacyChange = () => {
    const newValue = !settings.includeLegacy;
    setValue("includeLegacy", newValue);

    if (!newValue) {
      filterByRegex(TOKEN_REGEX);
    }
  };

  return (
    <div className="pt-5">
      <div className="mb-4 leading-[15px]">
        <h2 className="text-lg font-bold">Settings</h2>
        <span className="text-sm text-neutral-300">
          Configure the behavior of the checker
        </span>
      </div>

      <OptionSwitch
        name="Support Old Token Format"
        description="Tokens with a HMAC length of 27 are considered legacy tokens"
        condition={settings.includeLegacy}
        stateSetter={handleIncludeLegacyChange}
      />
    </div>
  );
};

export default function Home() {
  const { tokens, addTokens, setTokens } = useTokenStore();
  const { settings } = useSettingsStore();
  const router = useRouter();
  const fileUpload = useRef<HTMLInputElement>(null);

  const getMatchesForString = (str: string) => {
    const regex = settings.includeLegacy ? TOKEN_REGEX_LEGACY : TOKEN_REGEX;
    return str.match(regex) ?? [];
  };

  const importFromFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    for (const file of event.target.files) {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (!event.target?.result) {
          return;
        }

        const result = event.target.result as string;
        const matches = getMatchesForString(result);
        addTokens(matches);
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <Header />
      <main>
        <BackgroundGrid />
        <Container className="relative pt-5">
          <ChromeExtensionBanner />

          <div className="justify-between pb-2 md:flex md:items-center">
            <div className="leading-[15px]">
              <h1 className="text-xl font-bold">Token Import</h1>
              <span className="text-sm text-neutral-300">
                You can import as many tokens as you wish
              </span>
            </div>

            <input
              type="file"
              accept="text/*"
              onClick={(e) => (e.currentTarget.value = "")}
              onChange={importFromFile}
              ref={fileUpload}
              className="hidden"
              multiple={true}
            />
            <button
              className="mt-2 rounded bg-blurple p-2 transition duration-150 hover:bg-blurple-dark md:mt-0"
              onClick={() => fileUpload.current && fileUpload.current.click()}
            >
              <FiFilePlus size={20} />
            </button>
          </div>

          <textarea
            className="slim-scrollbar w-full resize-none rounded border-2 border-blurple bg-gray-800 p-2 font-mono leading-tight caret-blurple outline-none focus:border-blurple-dark"
            spellCheck={false}
            placeholder={"Paste your tokens here, one per line."}
            rows={15}
            value={tokens.join("\n")}
            onChange={(e) => setTokens(getMatchesForString(e.target.value))}
          />

          <div className="flex items-center justify-between">
            <button
              className="flex items-center rounded bg-blurple px-2 py-1.5 font-medium transition duration-150 hover:bg-blurple-dark disabled:opacity-50"
              disabled={tokens.length === 0}
              onClick={() => void router.push("/check")}
            >
              <FiRefreshCcw size={20} className="mr-2" />
              Check Tokens
            </button>

            <span className="text-sm">
              <b>{tokens.length}</b> Tokens to Check
            </span>
          </div>

          <SettingsSection />
        </Container>
      </main>
    </>
  );
}
