import { CreateConversationInputSchema, z } from "@repo/shared";
import type { Resolver } from "react-hook-form";

export const directConversationFormSchema =
  CreateConversationInputSchema.extend({
    isGroup: z.literal(false),
    participants: z
      .array(z.string())
      .length(1, "Vui lòng chọn 1 người để bắt đầu trò chuyện."),
    directQuery: z.string(),
  });

export const groupConversationFormSchema = CreateConversationInputSchema.extend(
  {
    isGroup: z.literal(true),
    participants: z
      .array(z.string())
      .min(2, "Vui lòng chọn ít nhất 2 người để tạo nhóm chat."),
    groupName: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập tên nhóm.")
      .max(100, "Tên nhóm không được vượt quá 100 ký tự."),
    groupQuery: z.string(),
  },
);

export type DirectConversationFormValues = z.infer<
  typeof directConversationFormSchema
>;
export type GroupConversationFormValues = z.infer<
  typeof groupConversationFormSchema
>;

export function createSchemaResolver<TValues extends Record<string, unknown>>(
  schema: z.ZodType<TValues>,
): Resolver<TValues> {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    const errors: Record<string, { type: string; message: string }> = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (typeof field !== "string" || errors[field]) {
        continue;
      }

      errors[field] = {
        type: issue.code,
        message: issue.message,
      };
    }

    return {
      values: {},
      errors: errors as never,
    };
  };
}
