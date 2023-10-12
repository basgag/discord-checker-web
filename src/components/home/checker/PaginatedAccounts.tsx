import { Tab, type TabProps } from "@headlessui/react";
import PaginationButtons from "~/components/home/checker/PaginationButtons";
import { type Account, useAccountStore } from "~/lib/store";
import { UserPremiumType } from "discord-api-types/v10";
import { usePagination } from "~/hooks/usePagination";
import { type ElementType, useMemo, useState } from "react";
import Box from "~/components/common/BoxComponent";
import AccountWithUserCard from "~/components/home/checker/AccountWithUserCard";
import AccountDetailsDialog from "~/components/home/checker/AccountDetailsDialog";

const categories = [
  {
    name: "Verified Accounts",
    filter: ({ user }: Account) => user.verified,
  },
  {
    name: "Unverified Accounts",
    filter: ({ user }: Account) => !user.verified,
  },
  {
    name: "Nitro Accounts",
    filter: ({ user }: Account) =>
      user.verified &&
      user.premium_type &&
      user.premium_type > UserPremiumType.None,
  },
] as const;

interface NothingPlaceholderProps {
  categoryName: string;
}

const NothingPlaceholder: React.FC<NothingPlaceholderProps> = ({
  categoryName,
}) => {
  return (
    <Box className="w-full text-center">
      <span className="text-neutral-200">
        There are no {categoryName} so far...
      </span>
    </Box>
  );
};

type TPaginatedAccountsProps = React.HTMLAttributes<HTMLDivElement> &
  TabProps<ElementType>;

const PaginatedAccounts: React.FC<TPaginatedAccountsProps> = ({ ...props }) => {
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const { pageIndex, nextPage, previousPage, resetPage } = usePagination();
  const { accounts } = useAccountStore();

  const filteredAccounts = useMemo(() => {
    const currentCategory = categories[selectedCategory];
    return accounts.filter(currentCategory!.filter);
  }, [accounts, selectedCategory]);

  return (
    <>
      {selectedAccount && (
        <AccountDetailsDialog
          account={selectedAccount}
          isOpen={true}
          onClose={() => setSelectedAccount(null)}
        />
      )}

      <Tab.Group
        selectedIndex={selectedCategory}
        onChange={(index) => {
          resetPage();
          setSelectedCategory(index);
        }}
        as="div"
        {...props}
      >
        <Tab.List className="flex justify-between rounded-lg border border-blueish-grey-600/80 bg-blueish-grey-700 p-1 font-medium">
          {categories.map((category, index) => {
            const entriesCount = accounts.filter(category.filter).length;
            return (
              <Tab
                className="w-full rounded p-2 ui-selected:bg-blurple"
                key={`tab-${index}`}
              >
                {category.name} ({entriesCount})
              </Tab>
            );
          })}
        </Tab.List>
        <Tab.Panels className="mt-5">
          {categories.map((category, panelIndex) => {
            const isPanelSelected = panelIndex === selectedCategory;
            if (!isPanelSelected) {
              return <Tab.Panel key={`panel-${panelIndex}`} />;
            }

            if (filteredAccounts.length === 0) {
              return (
                <Tab.Panel key={`panel-${panelIndex}`}>
                  <NothingPlaceholder
                    categoryName={category.name.toLowerCase()}
                  />
                </Tab.Panel>
              );
            }

            return (
              <Tab.Panel
                key={`panel-${panelIndex}`}
                className="grid grid-cols-12 gap-3"
              >
                {filteredAccounts
                  .slice(pageIndex, pageIndex + 21)
                  .map((account, index) => (
                    <AccountWithUserCard
                      className="col-span-full cursor-pointer overflow-hidden lg:col-span-4"
                      account={account}
                      key={`t-${panelIndex}-${index}-${account.user.id}`}
                      onClick={() => setSelectedAccount(account)}
                    />
                  ))}
              </Tab.Panel>
            );
          })}
        </Tab.Panels>
      </Tab.Group>

      <PaginationButtons
        onNext={nextPage}
        onPrevious={previousPage}
        isNextDisabled={pageIndex + 21 >= filteredAccounts.length}
        isPreviousDisabled={pageIndex === 0}
      />
    </>
  );
};

export default PaginatedAccounts;
