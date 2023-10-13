import { create } from "zustand";
import { type APIUser } from "discord-api-types/v10";
import { createJSONStorage, persist } from "zustand/middleware";

interface TokenState {
  tokens: string[];
  addTokens: (tokens: string[], excludeDuplicates?: boolean) => void;
  removeToken: (token: string) => void;
  setTokens: (tokens: string[], excludeDuplicates?: boolean) => void;
  filterByRegex: (regex: RegExp) => void;
  removeDuplicates: () => void;
}

const removeTokenDuplicates = (tokens: string[]) => {
  const seen = new Set<string>();
  return tokens.filter((token) => {
    const [firstPart] = token.split(".");
    if (!firstPart) {
      return false;
    }

    if (seen.has(firstPart)) {
      return false;
    }
    seen.add(firstPart);
    return true;
  });
};

export const useTokenStore = create<TokenState>((set) => ({
  tokens: [],
  addTokens: (tokens: string[], excludeDuplicates = false) =>
    set((state) => ({
      tokens: !excludeDuplicates
        ? [...new Set([...state.tokens, ...tokens])]
        : removeTokenDuplicates([...new Set([...state.tokens, ...tokens])]),
    })),
  removeToken: (token: string) =>
    set((state) => ({ tokens: state.tokens.filter((t) => t !== token) })),
  setTokens: (tokens: string[], excludeDuplicates = false) =>
    set(() => ({
      tokens: !excludeDuplicates
        ? [...new Set(tokens)]
        : removeTokenDuplicates([...new Set(tokens)]),
    })),
  filterByRegex: (regex: RegExp) =>
    set((state) => ({
      tokens: state.tokens.filter((token) => !!token.match(regex)),
    })),
  removeDuplicates: () =>
    set((state) => ({
      tokens: removeTokenDuplicates(state.tokens),
    })),
}));

export interface Account {
  user: APIUser & { phone?: string };
  tokens: string[];
}

interface AccountState {
  accounts: Account[];
  existsByUserId: (id: string) => boolean;
  addTokenByUserId: (id: string, token: string) => void;
  addAccount: (account: Account) => void;
  removeAccount: (account: Account) => void;
  addAccounts: (accounts: Account[]) => void;
}

export const useAccountStore = create(
  persist<AccountState>(
    (set, get) => ({
      accounts: [],
      existsByUserId: (id) => get().accounts.some((acc) => acc.user.id === id),
      addTokenByUserId: (id, token) =>
        set((state) => ({
          accounts: state.accounts.map((acc) => {
            if (acc.user.id === id) {
              return {
                ...acc,
                tokens: [...new Set([...acc.tokens, token])],
              };
            }

            return acc;
          }),
        })),
      addAccount: (account) =>
        set((state) => {
          const existingAccount = state.accounts.find(
            (acc) => acc.user.id === account.user.id,
          );
          if (existingAccount) {
            return {
              accounts: state.accounts.map((acc) => {
                if (acc.user.id === account.user.id) {
                  return {
                    ...acc,
                    tokens: [...new Set([...acc.tokens, ...account.tokens])],
                  };
                }

                return acc;
              }),
            };
          }

          return { accounts: [...state.accounts, account] };
        }),
      removeAccount: (account) =>
        set((state) => ({
          accounts: state.accounts.filter((acc) => acc !== account),
        })),
      addAccounts: (accounts) =>
        set((state) => ({ accounts: [...state.accounts, ...accounts] })),
    }),
    {
      name: "discord-accounts",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

interface SettingsState {
  settings: {
    delay: number;
    includeLegacy: boolean;
    enableCache: boolean;
    removeDuplicates: boolean;
  };
  setSettings: (settings: SettingsState["settings"]) => void;
  setValue: (
    key: keyof SettingsState["settings"],
    value: SettingsState["settings"][keyof SettingsState["settings"]],
  ) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    delay: 0,
    includeLegacy: true,
    enableCache: true,
    removeDuplicates: true,
  },
  setSettings: (settings) => set(() => ({ settings })),
  setValue: (key, value) =>
    set({ settings: { ...get().settings, [key]: value } }),
}));
