import Header from "~/components/common/Header";
import { NextSeo } from "next-seo";
import BackgroundGrid from "~/components/BackgroundGrid";
import Container from "~/components/common/Container";
import Sidebar from "~/components/admin/Sidebar";
import { type IDefaultLayoutProps } from "~/layouts/DefaultLayout";

const AdminLayout: React.FC<IDefaultLayoutProps> = ({ children, ...props }) => {
  return (
    <>
      <Header />
      <Sidebar />
      <NextSeo {...props.seo} />
      <main className="relative py-12 lg:pt-16">
        <BackgroundGrid />
        <Container className="relative">{children}</Container>
      </main>
    </>
  );
};

export default AdminLayout;
