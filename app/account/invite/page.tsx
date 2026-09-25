import type { Metadata } from "next";
import { Suspense } from "react";
import { InviteView } from "@/components/account/InviteView";

export const metadata: Metadata = {
  title: "Invitation",
  robots: { index: false },
  alternates: { canonical: "/account/invite" },
};

export default function Page() {
  return (
    <Suspense>
      <InviteView />
    </Suspense>
  );
}
