"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { signupAction } from "../actions/signup-action";
import {
  signupSchema,
  type SignupInput,
  initialActionState,
} from "../types/schemas";
import { useSyncFormErrors } from "@/shared/hooks/use-sync-form-errors";
import { FormErrorAlert } from "@/components/form-error-alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Signup form component with Zod validation and server action integration.
 * Displays inline validation errors and API error messages.
 * Mobile-first responsive design with full keyboard accessibility.
 */
export function SignupForm() {
  const t = useTranslations("auth.signup");
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialActionState
  );

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Sync server-side errors with form state
  useSyncFormErrors(form, state.errors);

  return (
    <Form {...form}>
      <form action={formAction} className="grid gap-4">
        {/* Display API-level error message */}
        {!state.success && <FormErrorAlert message={state.message} />}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder={t("namePlaceholder")}
                  autoComplete="name"
                  aria-label={t("name")}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  aria-label={t("email")}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("password")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  autoComplete="new-password"
                  aria-label={t("password")}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="mt-2 w-full"
          disabled={isPending}
          aria-label={t("submit")}
        >
          {isPending ? t("submitting") : t("submit")}
        </Button>
      </form>
    </Form>
  );
}
