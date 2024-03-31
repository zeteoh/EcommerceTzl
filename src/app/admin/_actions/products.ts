"use server";

import db from "@/db/db";
import { z } from "zod";
import fs from "fs/promises";
import { redirect } from "next/navigation";

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
export async function AddProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  // create the directory
  await fs.mkdir("products", { recursive: true });
  // create the unique path to ensure no conflicts
  const filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
  // buffer will await and create a buffer to the file path
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

  // create the directory
  await fs.mkdir("public/products", { recursive: true });
  // create the unique path to ensure no conflicts
  const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
  // buffer will await and create a buffer to the file path
  await fs.writeFile(
    `public${imagePath}`,
    Buffer.from(await data.image.arrayBuffer())
  );

  try {
    await db.product.create({
      data: {
        isAvailableForPurchase: false,
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        filePath,
        imagePath,
      },
    });
    console.log("Product added successfully");
  } catch (error) {
    console.error("Error adding product to the database:", error);
  }

  console.log("test");

  redirect("/admin/products");
}
