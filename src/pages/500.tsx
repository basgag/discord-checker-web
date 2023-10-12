import { NextSeo } from "next-seo";
import BackgroundGrid from "~/components/BackgroundGrid";
import Link from "next/link";
import Header from "~/components/common/Header";
import Container from "~/components/common/Container";

const Custom500: React.FC = () => {
  return (
    <>
      <NextSeo title="Oops! Internal Server Error" noindex={true} />
      <Header />
      <main className="flex h-[calc(100vh-300px)] items-center justify-center text-center">
        <BackgroundGrid />
        <Container className="relative">
          <span className="text-9xl font-bold">500</span>
          <h1 className="text-xl font-medium">Internal Server Error</h1>
          <p className="mt-4 text-base text-neutral-200">
            Your request could not be processed. Please try again later.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-blurple px-6 py-2 font-medium text-neutral-200 transition duration-150 hover:bg-blurple-dark hover:text-neutral-100"
          >
            Go to Home
          </Link>
        </Container>
      </main>
    </>
  );
};

export default Custom500;
