"use server";

import db from "@/db/db";
import { z } from "zod";

const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
  // if file size is 0, ignore this check completely, if file size is not 0, must start with image/
  (file) => file.size === 0 || file.type.startsWith("image/")
);
// zod is a form validation library
const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine((file) => file.size > 0, "Required"),
  image: imageSchema.refine((file) => file.size > 0, "Required"),
});
export async function AddProduct(formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  //   db.product.create({ data: {
  //     name: data.name,
  //     description: data.description,
  //     priceInCents: data.priceInCents,
  //     filePath:
  //   } });
}
