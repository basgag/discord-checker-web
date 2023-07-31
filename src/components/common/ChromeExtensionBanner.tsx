import { FiInfo } from "react-icons/fi";
import Link from "next/link";

const ChromeExtensionBanner: React.FC = () => {
  return (
    <Link
      href="https://chrome.google.com/webstore/detail/discord-token-sync/ccekbfgamknaaidkdbbdmmbcioajaacl"
      className="mb-6 flex items-center rounded bg-blurple px-3 py-2 transition duration-150 hover:bg-blurple-dark"
      target="_blank"
    >
      <FiInfo className="h-5 w-5" />
      <span className="ml-2 text-neutral-100">
        Click here to check out the new Chrome extension to fast login into
        accounts.
      </span>
    </Link>
  );
};

export default ChromeExtensionBanner;
