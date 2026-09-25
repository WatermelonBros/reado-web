import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/account/SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
  alternates: { canonical: "/sign-in" },
};

export default function Page() {
  // useSearchParams (the desktop app's ?flow=) needs a Suspense boundary in a static export.
  return (
    <Suspense>
      <SignInForm mode="sign-in" />
    </Suspense>
  );
}
