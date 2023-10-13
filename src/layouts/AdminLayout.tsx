import Header from "~/components/common/Header";
import { NextSeo } from "next-seo";
import BackgroundGrid from "~/components/BackgroundGrid";
import Container from "~/components/common/Container";
import Sidebar from "~/components/admin/Sidebar";
import { type IDefaultLayoutProps } from "~/layouts/DefaultLayout";

interface IAminLayoutProps extends IDefaultLayoutProps {
  heading: string;
}

const AdminLayout: React.FC<IAminLayoutProps> = ({
  children,
  heading,
  ...props
}) => {
  return (
    <>
      <Header />
      <NextSeo {...props.seo} />
      <main className="relative py-12 lg:pt-16">
        <BackgroundGrid />
        <Container className="relative max-w-screen-2xl">
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12 lg:grid-cols-10 xl:grid-cols-5">
            <Sidebar />
            <div className="grid grid-cols-1 gap-6 md:col-span-9 lg:col-span-8 xl:col-span-4">
              <div className="space-y-4">
                <div className="space-y-4 lg:flex lg:items-center lg:justify-between lg:space-x-4 lg:space-y-0">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-3xl font-bold leading-tight">
                      {heading}
                    </h2>
                  </div>
                </div>
                {children}
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
};

export default AdminLayout;
