/**
 * Standard result type for server actions.
 * Provides consistent error handling across all modules.
 */
export interface ActionResult<T = undefined> {
  /** Whether the action completed successfully */
  success: boolean;
  /** Optional message describing the result */
  message?: string;
  /** Field-specific validation errors */
  errors?: Record<string, string[]>;
  /** Optional data payload for successful actions */
  data?: T;
}

/**
 * Initial state for useActionState hook.
 * Use this as the default state when initializing form actions.
 */
export const initialActionState: ActionResult = {
  success: false,
  message: undefined,
  errors: undefined,
};
