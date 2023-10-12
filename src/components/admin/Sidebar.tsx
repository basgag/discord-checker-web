import {
  FiLogOut,
  FiMenu,
  FiPieChart,
  FiSettings,
  FiUsers,
  FiX,
} from "react-icons/fi";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/router";
import { SiDiscord } from "react-icons/si";
import Image from "next/image";

import { signOut, useSession } from "next-auth/react";

const iconStyle =
  "h-6 w-6 flex-shrink-0 text-gray-400 transition duration-75 group-hover:text-white";

const routes = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: <FiPieChart className={iconStyle} />,
  },
  {
    name: "Accounts",
    href: "/admin/accounts",
    icon: <SiDiscord className={iconStyle} />,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: <FiUsers className={iconStyle} />,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: <FiSettings className={iconStyle} />,
  },
];

const Sidebar: React.FC = () => {
  const [isOpened, setOpened] = useState(false);
  const router = useRouter();
  const { data: auth } = useSession();

  return (
    <>
      <button
        onClick={() => setOpened(!isOpened)}
        className="ml-3 mt-2 inline-flex items-center rounded-lg p-2 text-sm text-gray-400 hover:bg-gray-700 focus:outline-none focus:ring-gray-200 2xl:hidden"
      >
        <span className="sr-only">Open sidebar</span>
        <FiMenu className="h-6 w-6" />
      </button>

      <aside
        className={clsx(
          "fixed left-0 top-0 z-40 h-screen w-64 transition-transform 2xl:translate-x-0",
          !isOpened && "-translate-x-full"
        )}
        aria-label="Sidebar"
      >
        <div className="relative h-full overflow-y-auto bg-gray-800 px-3 py-4">
          <div className="flex justify-end">
            <button
              onClick={() => setOpened(!isOpened)}
              className="mb-2 inline-flex items-center rounded-lg p-2 text-sm text-gray-400 hover:bg-gray-700 focus:outline-none focus:ring-gray-200 2xl:hidden"
            >
              <span className="sr-only">Close sidebar</span>
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4 flex items-center rounded-lg border border-gray-600 bg-gray-700 px-1 py-2">
            <Image
              src={auth?.user?.image ?? "/images/default_user.png"}
              width={48}
              height={48}
              alt="User Avatar"
              className="mr-2 rounded-full border border-gray-600"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold">{auth?.user?.name}</span>
              <span className="text-xs font-light text-gray-300">
                {auth?.user.id}
              </span>
            </div>
          </div>

          <ul className="space-y-2 font-medium">
            {routes.map((route) => {
              const isActive = router.pathname.startsWith(route.href);
              return (
                <li key={`r-${route.href}`}>
                  <Link
                    href={route.href}
                    className={clsx(
                      "flex items-center rounded-lg border border-transparent p-2 text-white hover:bg-gray-700",
                      isActive && "!border-gray-600 bg-gray-700"
                    )}
                  >
                    {route.icon}
                    <span className="ml-3">{route.name}</span>
                  </Link>
                </li>
              );
            })}
            <hr className="border-gray-600" />
            <li>
              <button
                className="flex w-full items-center rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
                onClick={() => void signOut()}
              >
                <FiLogOut className="h-6 w-6" />
                <span className="ml-3">Logout</span>
              </button>
            </li>
          </ul>

          <div className="absolute bottom-2 mx-auto">
            <span className="text-xs text-gray-400">
              Coded with ❤️ by masterjanic
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
