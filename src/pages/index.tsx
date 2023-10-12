import { FiFilePlus, FiRefreshCcw } from "react-icons/fi";
import { useSettingsStore, useTokenStore } from "~/lib/store";
import { type ChangeEvent, useRef } from "react";
import { TOKEN_REGEX, TOKEN_REGEX_LEGACY } from "~/lib/utils";
import { useRouter } from "next/router";
import BackgroundGrid from "~/components/BackgroundGrid";
import Header from "~/components/common/Header";
import Container from "~/components/common/Container";
import ChromeExtensionBanner from "~/components/home/ChromeExtensionBanner";
import Button from "~/components/common/Button";
import CheckerSettings from "~/components/home/CheckerSettings";

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

          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <div className="leading-[15px]">
              <h1 className="text-xl font-bold">Token Import</h1>
              <span className="text-base text-neutral-300">
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
            <Button
              className="!p-2"
              onClick={() => fileUpload.current && fileUpload.current.click()}
              aria-label="Import Tokens from File"
            >
              <FiFilePlus className="h-6 w-6" />
            </Button>
          </div>

          <textarea
            className="mt-4 w-full resize-none rounded-lg border border-blurple bg-blueish-grey-700/50 p-2 font-mono font-light leading-tight text-neutral-200 caret-blurple outline-none backdrop-blur scrollbar-thin focus:border-blurple-dark"
            spellCheck={false}
            placeholder="Paste your tokens here, one per line."
            rows={15}
            value={tokens.join("\n")}
            onChange={(e) => setTokens(getMatchesForString(e.target.value))}
          />

          <div className="mt-2 flex items-center justify-between">
            <Button
              disabled={tokens.length === 0}
              onClick={() => void router.push("/check")}
            >
              <FiRefreshCcw className="h-5 w-5" />
              <span>Check Tokens</span>
            </Button>

            <p className="text-sm text-neutral-200">
              <b>{tokens.length}</b> Tokens to Check
            </p>
          </div>

          <CheckerSettings />
        </Container>
      </main>
    </>
  );
}
