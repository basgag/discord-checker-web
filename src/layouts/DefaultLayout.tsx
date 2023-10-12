import Header from "~/components/common/Header";
import { NextSeo, type NextSeoProps } from "next-seo";
import BackgroundGrid from "~/components/BackgroundGrid";
import { type PropsWithChildren } from "react";
import Container from "~/components/common/Container";
import clsx from "clsx";

export interface IDefaultLayoutProps
  extends PropsWithChildren,
    React.HTMLAttributes<HTMLElement> {
  seo?: NextSeoProps;
}

const DefaultLayout: React.FC<IDefaultLayoutProps> = ({
  children,
  seo,
  className,
  ...props
}) => {
  return (
    <>
      <Header />
      <NextSeo {...seo} />
      <main className={clsx("relative py-12 lg:pt-16", className)} {...props}>
        <BackgroundGrid />
        <Container className="relative">{children}</Container>
      </main>
    </>
  );
};

export default DefaultLayout;
