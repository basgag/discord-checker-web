import { type Account, useAccountStore, useTokenStore } from "~/lib/store";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { FiExternalLink, FiStopCircle } from "react-icons/fi";
import { fetchBillingCountry, fetchUser, isValidSnowflake } from "~/lib/dapi";
import { api } from "~/utils/api";
import pMap from "p-map";
import Button from "~/components/common/Button";
import PaginatedAccounts from "~/components/home/checker/PaginatedAccounts";
import DefaultLayout from "~/layouts/DefaultLayout";
import ExportDialog from "~/components/home/checker/ExportDialog";

export default function Check() {
  const [isExportOpen, setIsExportOpen] = useState(false);

  const { tokens, removeToken } = useTokenStore();
  const { accounts, addAccount, existsByUserId, addTokenByUserId } =
    useAccountStore();

  const utils = api.useContext();

  const accountMutation = api.accounts.createOrUpdate.useMutation();
  const pendingCancellation = useRef(false);

  const router = useRouter();

  const checkTokens = () => {
    return pMap(
      tokens,
      async (token) => {
        if (pendingCancellation.current) {
          return;
        }

        removeToken(token);

        const cachedAccount =
          await utils.accounts.getCachedByToken.fetch(token);
        if (cachedAccount) {
          addAccount({
            user: cachedAccount,
            tokens: [token],
          } as unknown as Account);
          return;
        }

        const base64Id = token.split(".")[0];
        if (!base64Id) {
          return;
        }

        const decodedId = atob(base64Id);
        if (!isValidSnowflake(decodedId)) {
          return;
        }

        if (existsByUserId(decodedId)) {
          const response = await fetchBillingCountry({ token });
          if (response) {
            addTokenByUserId(decodedId, token);
          }

          return;
        }

        const userResponse = await fetchUser("@me", { token });
        if (!userResponse) {
          return;
        }

        const { data: user } = userResponse;
        if (user.verified) {
          // Check if the user is "really" verified, since Discord sometimes returns verified = true for unverified users
          const billingCountryResponse = await fetchBillingCountry({ token });
          user.verified = billingCountryResponse !== null;
        }

        if (user.verified) {
          accountMutation.mutate({
            user,
            tokens: [token],
            origin: "DTC Web",
          });
        }
        addAccount({ user, tokens: [token] });
      },
      { concurrency: 5, stopOnError: false },
    );
  };

  useEffect(() => {
    if (tokens.length === 0 && accounts.length === 0) {
      return void router.push("/");
    }

    checkTokens().catch(console.error);
  }, []);

  return (
    <DefaultLayout seo={{ nofollow: true, noindex: true }}>
      <ExportDialog
        accounts={accounts}
        onClose={() => setIsExportOpen(false)}
        isOpen={isExportOpen}
      />

      <div className="flex items-center justify-between">
        <div className="leading-[15px]">
          <h1 className="text-xl font-bold">
            {tokens.length > 0 ? "Checking" : "Checked"} Tokens
          </h1>
          <span className="text-base text-neutral-300">
            {tokens.length > 0
              ? "Your tokens are being processed, please wait..."
              : "View your results below"}
          </span>
        </div>
        <p className="text-sm">
          Remaining Tokens: <b>{tokens.length}</b>
        </p>
      </div>
      <div className="mt-4 flex space-x-2">
        <Button
          className="!bg-red-600 hover:!bg-red-700"
          disabled={pendingCancellation.current || tokens.length === 0}
          onClick={() => (pendingCancellation.current = true)}
        >
          <FiStopCircle className="h-5 w-5" />
          <span>Stop</span>
        </Button>
        <Button
          disabled={accounts.length === 0}
          onClick={() => setIsExportOpen(true)}
        >
          <FiExternalLink className="h-5 w-5" />
          <span>Export</span>
        </Button>
      </div>

      <PaginatedAccounts className="mb-8 mt-4" />
    </DefaultLayout>
  );
}
