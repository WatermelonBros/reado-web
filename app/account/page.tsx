import type { Metadata } from "next";
import { AccountView } from "@/components/account/AccountView";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false },
  alternates: { canonical: "/account" },
};

export default function Page() {
  return <AccountView />;
}
