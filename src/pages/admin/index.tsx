import { type GetServerSidePropsContext, type NextPage } from "next";
import { getServerAuthSession } from "~/server/auth";
import {
  type ClientSafeProvider,
  getCsrfToken,
  getProviders,
  type LiteralUnion,
  signIn,
} from "next-auth/react";
import { type BuiltInProviderType } from "next-auth/providers";
import { SiDiscord, SiGithub, SiGoogle } from "react-icons/si";
import clsx from "clsx";
import Header from "~/components/Header";
import Container from "~/components/Container";
import BackgroundGrid from "~/components/BackgroundGrid";
import BoxComponent from "~/components/BoxComponent";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { z } from "zod";
import AlertMessage from "~/components/AlertMessage";
import { useRouter } from "next/router";

interface PageProps {
  csrfToken: string | undefined;
  providers: Record<
    LiteralUnion<BuiltInProviderType>,
    ClientSafeProvider
  > | null;
}

const ProviderList: React.FC<{ providers: PageProps["providers"] }> = ({
  providers,
}) => {
  const providerStyles = {
    discord: {
      icon: <SiDiscord />,
      style: "bg-blurple hover:bg-blurple-dark",
    },
    google: {
      icon: <SiGoogle />,
      style: "bg-[#F65314] hover:bg-[#EA4335]",
    },
    github: {
      icon: <SiGithub />,
      style: "bg-white hover:bg-gray-200 text-black",
    },
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {Object.entries(providerStyles).map(([key, provider]) => {
        return (
          <button
            key={key}
            className={clsx(
              "inline-flex h-8 w-8 items-center justify-center rounded-full transition duration-150 disabled:opacity-50",
              provider.style,
            )}
            onClick={() => void signIn(key)}
            disabled={!providers || !(key in providers)}
          >
            {provider.icon}
          </button>
        );
      })}
    </div>
  );
};

const AdminLogin: NextPage<PageProps> = ({ csrfToken, providers }) => {
  const router = useRouter();
  const { error } = router.query;

  return (
    <>
      <Header />
      <main className="flex h-[calc(100vh-300px)] items-center justify-center text-center">
        <BackgroundGrid />
        <Container className="relative pt-5">
          <h1
            className={clsx("text-center text-2xl font-bold", !error && "mb-5")}
          >
            Admin Login
          </h1>

          {error && (
            <AlertMessage
              className="mb-2"
              type="error"
              message="Something went wrong. Please try again."
            />
          )}

          <BoxComponent className="mx-auto max-w-sm text-left">
            <Formik
              initialValues={{ email: "" }}
              validationSchema={toFormikValidationSchema(
                z.object({
                  email: z.string().email(),
                }),
              )}
              onSubmit={({ email }) => signIn("email", { email, csrfToken })}
            >
              {({ errors, isValid }) => (
                <Form>
                  <label htmlFor="email" className="font-medium">
                    E-Mail
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    className={clsx(
                      "mb-1 mt-1 block w-full rounded border-2 border-blurple bg-gray-700 p-2 font-mono placeholder-gray-300 caret-blurple outline-none focus:border-blurple-dark",
                      "email" in errors &&
                        "border-red-500 focus:border-red-500",
                    )}
                    placeholder="admin@janic.dev"
                  />
                  <ErrorMessage
                    className="mb-2 text-right text-xs text-red-500"
                    component="p"
                    name="email"
                  />

                  <button
                    className="w-full rounded bg-blurple px-2 py-1.5 text-center font-medium transition duration-150 hover:bg-blurple-dark disabled:opacity-50"
                    disabled={!isValid}
                    type="submit"
                  >
                    Sign In
                  </button>
                </Form>
              )}
            </Formik>

            <div className="my-4 text-center">
              <span className="font-semibold text-gray-200">
                &#9135;&nbsp; OR &#9135;
              </span>
            </div>

            <ProviderList providers={providers} />

            <p className="mt-4 text-center text-xs text-neutral-300">
              This area is only accessible for the owner of this project.
            </p>
          </BoxComponent>

          <footer className="mt-4 text-center text-xs text-gray-300">
            <p>Coded with ❤️ by masterjanic</p>
          </footer>
        </Container>
      </main>
    </>
  );
};

export default AdminLogin;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context);
  if (session) {
    return {
      redirect: {
        destination: "/admin/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
      csrfToken: await getCsrfToken(context),
      providers: await getProviders(),
    },
  };
}
