import { z } from "zod";
import {
  ALLOWED_SEX_IDS,
  calculateAge,
  FULL_NAME_MAX_LENGTH,
  FULL_NAME_MIN_LENGTH,
  MAX_CHILD_AGE_YEARS,
  NICK_NAME_MAX_LENGTH,
} from "@/features/profile/constants/children.constants";

function validateDob(value: string): boolean {
  if (!value) return false;
  const dobDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dobDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dobDate > today) return false;

  const age = calculateAge(dobDate, today);
  return age <= MAX_CHILD_AGE_YEARS;
}

function dobErrorMessage(value: string): string {
  if (!value) return "Date of birth is required.";
  const dobDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dobDate.getTime())) return "Date of birth is invalid.";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dobDate > today) return "Date of birth must be a valid past date.";

  const age = calculateAge(dobDate, today);
  if (age > MAX_CHILD_AGE_YEARS) return "Child age must be 25 or younger.";
  return "Date of birth is invalid.";
}

const sexIdSchema = z
  .number({ message: "Gender is required." })
  .refine((value) => ALLOWED_SEX_IDS.includes(value as (typeof ALLOWED_SEX_IDS)[number]), {
    message: "Please select a valid gender.",
  });

export const createChildFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .min(FULL_NAME_MIN_LENGTH, "Full name must be at least 2 characters.")
    .max(FULL_NAME_MAX_LENGTH, "Full name must not exceed 100 characters."),
  nickName: z
    .string()
    .max(NICK_NAME_MAX_LENGTH, "Nick name must not exceed 50 characters.")
    .optional()
    .or(z.literal("")),
  dob: z.string().min(1, "Date of birth is required.").refine(validateDob, {
    message: "Child age must be 25 or younger.",
  }),
  sexId: sexIdSchema,
});

export const updateChildFormSchema = createChildFormSchema;

export type ChildFormValues = z.infer<typeof createChildFormSchema>;

export function validateChildForm(
  values: ChildFormValues,
  isEdit: boolean,
): { success: true; data: ChildFormValues } | { success: false; fieldErrors: Partial<Record<keyof ChildFormValues, string>> } {
  const schema = isEdit ? updateChildFormSchema : createChildFormSchema;
  const result = schema.safeParse(values);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const fieldErrors: Partial<Record<keyof ChildFormValues, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ChildFormValues | undefined;
    if (field && !fieldErrors[field]) {
      if (field === "dob") {
        fieldErrors.dob = dobErrorMessage(values.dob);
      } else {
        fieldErrors[field] = issue.message;
      }
    }
  }

  return { success: false, fieldErrors };
}
