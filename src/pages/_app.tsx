import "~/styles/globals.css";

import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import clsx from "clsx";
import { Poppins } from "next/font/google";
import { DefaultSeo } from "next-seo";
import SEO from "next-seo.config";
import Script from "next/script";

export const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <Script
        async={true}
        crossOrigin="anonymous"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2388068147536440"
        strategy="afterInteractive"
      />
      <SessionProvider session={session}>
        <div className={clsx(poppins.variable, "min-h-screen font-sans")}>
          <DefaultSeo {...SEO} />
          <Component {...pageProps} />
        </div>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
