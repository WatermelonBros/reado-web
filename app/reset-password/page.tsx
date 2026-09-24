import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPassword } from "@/components/account/PasswordReset";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false },
  alternates: { canonical: "/reset-password" },
};

export default function Page() {
  // useSearchParams (the emailed ?token=) needs a Suspense boundary in a static export.
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}
