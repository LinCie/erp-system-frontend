"use client";

import { useEffect, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { signupAction } from "../actions/signup-action";
import {
  signupSchema,
  type SignupInput,
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
 * Signup form component with Zod validation and server action integration.
 * Displays inline validation errors and API error messages.
 * Mobile-first responsive design with full keyboard accessibility.
 */
export function SignupForm() {
  const t = useTranslations("auth.signup");
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState
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
  useEffect(() => {
    if (state.errors) {
      Object.entries(state.errors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          form.setError(field as keyof SignupInput, {
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
