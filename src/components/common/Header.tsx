import Link from "next/link";
import { SiDiscord, SiGithub } from "react-icons/si";
import Container from "~/components/common/Container";

const Header: React.FC = () => {
  return (
    <header className="py-5">
      <Container className="flex items-center">
        <SiDiscord className="mr-4 mt-1 h-12 w-12" />
        <div className="flex flex-col">
          <Link href="/" className="text-2xl font-bold">
            Discord Token Checker
          </Link>
          <span className="-mt-1 text-xs text-neutral-200">by masterjanic</span>
        </div>
        <div className="ml-auto">
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/masterjanic/discord-checker-web"
            className="ml-auto mt-1 transition duration-150 hover:text-neutral-300"
          >
            <span className="sr-only">GitHub Repository</span>
            <SiGithub className="h-7 w-7" />
          </Link>
        </div>
      </Container>
    </header>
  );
};

export default Header;
