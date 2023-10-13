import { useSession } from "next-auth/react";
import { FiChevronDown, FiHome, FiSettings, FiUsers } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/router";
import clsx from "clsx";
import { type IconType } from "react-icons";
import { useState } from "react";
import Box from "~/components/common/BoxComponent";
import UserAvatar from "~/components/admin/common/UserAvatar";
import { SiDiscord } from "react-icons/si";

interface SidebarItem {
  name: string;
  icon: IconType;
  href: string;
  subItems?: {
    name: string;
    href: string;
  }[];
}

type SidebarItemList = SidebarItem[];

const adminItems: SidebarItemList = [
  {
    name: "Dashboard",
    icon: FiHome,
    href: "/admin/dashboard",
  },
  {
    name: "Discord Accounts",
    icon: SiDiscord,
    href: "/admin/accounts",
  },
  {
    name: "Users",
    icon: FiUsers,
    href: "/admin/users",
  },
  {
    name: "Settings",
    icon: FiSettings,
    href: "/admin/settings",
    subItems: [
      {
        name: "General",
        href: "/admin/settings/general",
      },
      {
        name: "Checker Settings",
        href: "/admin/settings/checker",
      },
    ],
  },
];

const sections = [
  {
    name: "Management",
    items: adminItems,
  },
];

const SubmenuItem: React.FC<SidebarItem> = ({
  name,
  icon: Icon,
  subItems,
  href,
}) => {
  const router = useRouter();
  const isActive = router.pathname.startsWith(href);
  const [isOpened, setOpened] = useState(isActive);

  return (
    <>
      <button
        className={clsx(
          "group inline-flex w-full items-center space-x-3 border-l-2 border-transparent px-4 py-2 transition duration-200 hover:bg-blueish-grey-600 focus:outline-none",
          (isActive || isOpened) && "!border-blurple bg-blueish-grey-600/60",
        )}
        onClick={() => setOpened(!isOpened)}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="h-auto w-5 flex-shrink-0 text-blurple" />
            <span
              className={clsx(
                "truncate font-normal text-neutral-200 transition duration-200 group-hover:text-neutral-100",
                isActive && "!text-neutral-100",
              )}
            >
              {name}
            </span>
          </div>

          <FiChevronDown
            className={clsx(
              "h-5 w-5 transition duration-200",
              isOpened && "rotate-180 text-blurple",
            )}
          />
        </div>
      </button>
      {isOpened && (
        <div className="!mt-0 flex flex-col space-y-1.5 border-l-2 border-blurple bg-blueish-grey-600/60 pb-1.5 pl-12 pr-4 pt-1">
          {subItems?.map(({ name, href }) => {
            return (
              <Link
                href={href}
                key={`sub-cpl-${name.toLowerCase()}`}
                className="text-base font-light text-neutral-200 transition duration-200 hover:text-neutral-100"
              >
                {name}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
};

const SkeletonProfile: React.FC = () => {
  return (
    <div className="flex items-center space-x-3 p-4">
      <div className="inline-flex">
        <div className="pointer-events-none inline-block h-10 w-10 select-none">
          <div className="h-full w-full flex-shrink-0 animate-pulse rounded-full bg-blueish-grey-600/80"></div>
        </div>
      </div>
      <div className="truncate">
        <div className="h-4 w-36 animate-pulse rounded bg-blueish-grey-600/80"></div>
        <div className="mt-1 h-3 w-44 animate-pulse rounded bg-blueish-grey-600/80"></div>
      </div>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <div className="gap-6 md:sticky md:top-24 md:col-span-3 lg:col-span-2 xl:col-span-1">
      <Box className="divide-y divide-blueish-grey-600/80 !p-0">
        {status === "loading" ? (
          <SkeletonProfile />
        ) : (
          <div className="flex items-center space-x-3 p-4">
            <div className="inline-flex">
              <div className="pointer-events-none inline-block h-10 w-10 select-none">
                <UserAvatar />
              </div>
            </div>
            <div className="truncate">
              <h3 className="truncate text-base font-medium">
                {session?.user?.name ?? "Kein Anzeigename"}
              </h3>
              <p className="truncate text-xs font-light text-neutral-200">
                ID: {session?.user.id}
              </p>
            </div>
          </div>
        )}
        <div className="space-y-3 py-3">
          {sections.map(({ name, items }, index) => {
            return (
              <div key={`sidebar-section-${index}`}>
                <p className="px-4 text-xs font-light uppercase text-neutral-200">
                  {name}
                </p>
                <div className="space-y-1 pt-3">
                  {items.map((item, index) => {
                    if ("subItems" in item) {
                      return (
                        <SubmenuItem
                          key={`sidebar-submenu-${index}`}
                          {...item}
                        />
                      );
                    }

                    const { name, icon: Icon, href } = item;
                    const isActive = router.pathname.startsWith(href);
                    return (
                      <Link
                        href={href}
                        key={`cpl-${name.toLowerCase()}`}
                        className={clsx(
                          "group inline-flex w-full items-center space-x-3 border-l-2 border-transparent px-4 py-2 transition duration-200 hover:bg-blueish-grey-600 focus:outline-none",
                          isActive && "!border-blurple bg-blueish-grey-600/60",
                        )}
                      >
                        <Icon className="h-auto w-5 flex-shrink-0 text-blurple" />
                        <span className="truncate font-normal text-neutral-200 transition duration-200 group-hover:text-neutral-100">
                          {name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <p className="px-4 text-xs font-light text-neutral-300">
            Coded by masterjanic
          </p>
        </div>
      </Box>
    </div>
  );
};

export default Sidebar;
