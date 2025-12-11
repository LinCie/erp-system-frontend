"use client";

import { useEffect, useRef, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { signinAction } from "../actions/signin-action";
import {
  signinSchema,
  type SigninInput,
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
 * Signin form component with Zod validation and server action integration.
 * Auto-focuses email input on mount for immediate entry.
 * Displays inline validation errors and API error messages.
 * Mobile-first responsive design with full keyboard accessibility.
 */
export function SigninForm() {
  const t = useTranslations("auth.signin");
  const [state, formAction, isPending] = useActionState(
    signinAction,
    initialActionState
  );
  const emailInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SigninInput>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Auto-focus email input on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Sync server-side errors with form state
  useSyncFormErrors(form, state.errors);

  return (
    <Form {...form}>
      <form action={formAction} className="grid gap-4">
        {/* Display API-level error message */}
        {!state.success && <FormErrorAlert message={state.message} />}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  ref={(e) => {
                    field.ref(e);
                    (
                      emailInputRef as React.MutableRefObject<HTMLInputElement | null>
                    ).current = e;
                  }}
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
                  autoComplete="current-password"
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
