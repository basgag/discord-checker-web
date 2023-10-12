import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import { getServerAuthSession } from "~/server/auth";
import { getCsrfToken, getProviders, signIn } from "next-auth/react";
import { SiDiscord, SiGithub, SiGoogle } from "react-icons/si";
import clsx from "clsx";
import BoxComponent from "~/components/common/BoxComponent";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Field, Form, Formik } from "formik";
import { z } from "zod";
import AlertMessage from "~/components/common/AlertMessage";
import { useRouter } from "next/router";
import DefaultLayout from "~/layouts/DefaultLayout";
import { FiLogIn } from "react-icons/fi";
import Button from "~/components/common/Button";
import InputField from "~/components/common/InputField";

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

type TProviderListProps = Pick<TAdminLoginProps, "providers">;

const ProviderList: React.FC<TProviderListProps> = ({ providers }) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      {Object.entries(providerStyles).map(([key, provider]) => {
        return (
          <button
            key={key}
            className={clsx(
              "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 disabled:opacity-50",
              provider.style,
            )}
            onClick={() => void signIn(key)}
            disabled={!providers || !(key in providers)}
          >
            <span className="sr-only">Sign in with {key.toUpperCase()}</span>
            {provider.icon}
          </button>
        );
      })}
    </div>
  );
};

type TAdminLoginProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const AdminLogin: NextPage<TAdminLoginProps> = ({ csrfToken, providers }) => {
  const router = useRouter();
  const { error } = router.query;

  return (
    <DefaultLayout
      seo={{ nofollow: true, noindex: true }}
      className="flex h-[calc(100vh-200px)] items-center justify-center"
    >
      {error && (
        <AlertMessage
          className="mb-2"
          type="error"
          message="Something went wrong. Please try again."
        />
      )}

      <BoxComponent className="mx-auto mt-12 max-w-md bg-opacity-70 lg:mt-16">
        <h2 className="text-xl font-semibold">Sign In</h2>
        <p className="mt-[0.15rem] text-neutral-200">to manage this project</p>

        <Formik
          initialValues={{ email: "" }}
          validationSchema={toFormikValidationSchema(
            z.object({
              email: z.string().email(),
            }),
          )}
          onSubmit={({ email }) => signIn("email", { email })}
        >
          {({ isValid }) => (
            <Form className="mt-6">
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <Field
                component={InputField}
                name="email"
                type="email"
                placeholder="E-Mail"
              />

              <Button disabled={!isValid} className="mt-3 w-full text-base">
                <FiLogIn className="h-5 w-5" />
                <span className="font-normal">Sign in with E-Mail</span>
              </Button>
            </Form>
          )}
        </Formik>

        <hr className="my-8 border-blueish-grey-600" />

        <ProviderList providers={providers} />

        <p className="mt-8 text-center text-xs font-light text-neutral-300">
          This area is only accessible for the maintainer of this project.
        </p>
      </BoxComponent>

      <footer className="mt-8 text-center text-xs text-neutral-300">
        <p>Coded with ❤️ by masterjanic</p>
      </footer>
    </DefaultLayout>
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
