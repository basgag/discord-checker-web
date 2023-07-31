import { type PropsWithChildren } from "react";
import Header from "~/components/Header";
import Sidebar from "~/components/Sidebar";
import BackgroundGrid from "~/components/BackgroundGrid";
import Container from "~/components/Container";
import { NextSeo } from "next-seo";

const AdminLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <NextSeo noindex={true} nofollow={true} />
      <Header />
      <Sidebar />

      <main>
        <BackgroundGrid />
        <Container className="relative pt-5">{children}</Container>
      </main>
    </>
  );
};

export default AdminLayout;
