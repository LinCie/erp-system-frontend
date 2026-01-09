"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import {
  updateTrade,
  getOneTrade,
  createTradeDetail,
  updateTradeDetail,
  deleteTradeDetail,
} from "../services";
import {
  updateTradeSchema,
  type Trade,
  type TradeDetailInput,
  type CreateTradeDetailInput,
  type UpdateTradeDetailInput,
} from "../schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";
import { mapZodErrors } from "@/shared/lib";

/**
 * Compares two detail objects to check if editable fields changed.
 */
function hasDetailChanged(
  existing: TradeDetailInput,
  updated: TradeDetailInput
): boolean {
  return (
    existing.model_type !== updated.model_type ||
    existing.quantity !== updated.quantity ||
    existing.price !== updated.price ||
    (existing.discount ?? 0) !== (updated.discount ?? 0) ||
    (existing.weight ?? 0) !== (updated.weight ?? 0) ||
    (existing.sku ?? "") !== (updated.sku ?? "") ||
    (existing.name ?? "") !== (updated.name ?? "") ||
    (existing.notes ?? "") !== (updated.notes ?? "")
  );
}

/**
 * Server action for updating a trade and syncing its details.
 * Orchestrates:
 * 1. PATCH /trades/{id} - Update trade transaction fields only
 * 2. POST /trades/{id}/details - Create new details
 * 3. PATCH /trades/{id}/details/{detailId} - Update existing details
 * 4. DELETE /trades/{id}/details/{detailId} - Delete removed details
 *
 * @param id - Trade ID to update
 * @param initialDetails - Original details from the trade (for diffing)
 * @param _prevState - Previous action state (required for useActionState)
 * @param formData - The form data
 * @returns ActionResult with updated trade or validation errors
 */
export async function updateTradeAction(
  id: number,
  initialDetails: TradeDetailInput[],
  _prevState: ActionResult<Trade>,
  formData: FormData
): Promise<ActionResult<Trade>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  // Parse JSON fields
  const filesJson = formData.get("files");
  let files = undefined;
  if (filesJson && typeof filesJson === "string") {
    try {
      files = JSON.parse(filesJson);
    } catch {
      // Invalid JSON, skip files
    }
  }

  const tagsJson = formData.get("tags");
  let tags = undefined;
  if (tagsJson && typeof tagsJson === "string") {
    try {
      tags = JSON.parse(tagsJson);
    } catch {
      // Invalid JSON, skip tags
    }
  }

  const linksJson = formData.get("links");
  let links = undefined;
  if (linksJson && typeof linksJson === "string") {
    try {
      links = JSON.parse(linksJson);
    } catch {
      // Invalid JSON, skip links
    }
  }

  const detailsJson = formData.get("details");
  let details: TradeDetailInput[] = [];
  if (detailsJson && typeof detailsJson === "string") {
    try {
      details = JSON.parse(detailsJson);
    } catch {
      // Invalid JSON, skip details
    }
  }

  const handlerIdValue = formData.get("handler_id");
  const receiverIdValue = formData.get("receiver_id");
  const parentIdValue = formData.get("parent_id");

  // Build trade-only update payload (NO details field)
  const rawData = {
    handler_id: handlerIdValue ? Number(handlerIdValue) : null,
    sent_time: formData.get("sent_time") || undefined,
    received_time: formData.get("received_time") || undefined,
    receiver_id: receiverIdValue ? Number(receiverIdValue) : undefined,
    receiver_notes: formData.get("receiver_notes") || undefined,
    handler_notes: formData.get("handler_notes") || undefined,
    description: formData.get("description") || undefined,
    status: formData.get("status") || undefined,
    parent_id: parentIdValue ? Number(parentIdValue) : undefined,
    files,
    tags,
    links,
  };

  const parsed = updateTradeSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: mapZodErrors(parsed.error),
    };
  }

  try {
    // Step 1: Update trade transaction (PATCH /trades/{id})
    await updateTrade({
      token: accessToken,
      id,
      data: parsed.data,
    });

    // Step 2: Sync details
    // Build maps for diffing
    const existingById = new Map<number, TradeDetailInput>();
    for (const detail of initialDetails) {
      if (detail.id) {
        existingById.set(detail.id, detail);
      }
    }

    const nextById = new Map<number, TradeDetailInput>();
    const creates: CreateTradeDetailInput[] = [];
    for (const detail of details) {
      if (detail.id) {
        nextById.set(detail.id, detail);
      } else if (detail.item_id !== null) {
        // New detail without id and with required fields
        creates.push({
          item_id: detail.item_id,
          model_type: detail.model_type,
          quantity: detail.quantity,
          price: detail.price,
          discount: detail.discount,
          weight: detail.weight,
          sku: detail.sku,
          name: detail.name,
          notes: detail.notes,
        });
      }
    }

    // Determine operations
    const deletes: number[] = [];
    const updates: Array<{ id: number; data: UpdateTradeDetailInput }> = [];

    // Find deletes: in existing but not in next
    for (const [detailId] of existingById) {
      if (!nextById.has(detailId)) {
        deletes.push(detailId);
      }
    }

    // Find updates: in both, but fields changed
    for (const [detailId, nextDetail] of nextById) {
      const existingDetail = existingById.get(detailId);
      if (existingDetail && hasDetailChanged(existingDetail, nextDetail)) {
        updates.push({
          id: detailId,
          data: {
            model_type: nextDetail.model_type,
            quantity: nextDetail.quantity,
            price: nextDetail.price,
            discount: nextDetail.discount,
            weight: nextDetail.weight,
            sku: nextDetail.sku,
            name: nextDetail.name,
            notes: nextDetail.notes,
          },
        });
      }
    }

    // Execute detail operations
    const detailOps = [
      ...creates.map((data) =>
        createTradeDetail({ token: accessToken, tradeId: id, data })
      ),
      ...updates.map(({ id: detailId, data }) =>
        updateTradeDetail({ token: accessToken, tradeId: id, detailId, data })
      ),
      ...deletes.map((detailId) =>
        deleteTradeDetail({ token: accessToken, tradeId: id, detailId })
      ),
    ];

    const results = await Promise.allSettled(detailOps);

    // Check for detail operation failures
    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      const firstError = failures[0] as PromiseRejectedResult;
      if (isHttpError(firstError.reason)) {
        const apiError = firstError.reason as ApiError;
        return {
          success: false,
          message:
            apiError.apiMessage ??
            `Failed to sync details (${failures.length} operation(s) failed)`,
        };
      }
      return {
        success: false,
        message: `Failed to sync details (${failures.length} operation(s) failed)`,
      };
    }

    // Step 3: Refetch updated trade with details
    const data = await getOneTrade({
      token: accessToken,
      id,
    });
    return { success: true, data };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to update trade",
      };
    }
    if (error instanceof z.ZodError) {
      console.error("Response validation error:", error.issues);
      return {
        success: false,
        message: "Invalid response from server",
      };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
