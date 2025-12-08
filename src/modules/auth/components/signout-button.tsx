"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { signoutAction } from "../actions/signout-action";

/**
 * Signout button component for triggering user signout.
 * Client component that calls the signout server action.
 * @returns Button that triggers signout when clicked
 */
export function SignoutButton() {
  const t = useTranslations("auth");

  return (
    <form action={signoutAction}>
      <Button type="submit" variant="outline" className="w-full min-w-32">
        {t("signout")}
      </Button>
    </form>
  );
}
