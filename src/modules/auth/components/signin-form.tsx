"use client";

import { useEffect, useRef, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { signinAction } from "../actions/signin-action";
import {
  signinSchema,
  type SigninInput,
  type ActionResult,
} from "../types/schemas";
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

const initialState: ActionResult = {
  success: false,
  message: undefined,
  errors: undefined,
};

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
    initialState
  );
  const emailInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SigninInput>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Auto-focus email input on mount (Requirement 2.4)
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Sync server-side errors with form state
  useEffect(() => {
    if (state.errors) {
      Object.entries(state.errors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          form.setError(field as keyof SigninInput, {
            type: "server",
            message: messages[0],
          });
        }
      });
    }
  }, [state.errors, form]);

  return (
    <Form {...form}>
      <form action={formAction} className="grid gap-4">
        {/* Display API-level error message */}
        {state.message && !state.success && (
          <div
            role="alert"
            aria-live="polite"
            className="bg-destructive/10 text-destructive rounded-md p-3 text-sm"
          >
            {state.message}
          </div>
        )}

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
