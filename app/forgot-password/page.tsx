import type { Metadata } from "next";
import { ForgotPassword } from "@/components/account/PasswordReset";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false },
  alternates: { canonical: "/forgot-password" },
};

export default function Page() {
  return <ForgotPassword />;
}
