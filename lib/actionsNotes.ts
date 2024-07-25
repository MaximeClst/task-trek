"use server";

import { redirect } from "next/navigation";
import { getUser } from "./actionsUsers";
import { prisma } from "./db";
import { revalidatePath } from "next/cache";

export const getAllNotes = async (userId: string) => {
  const data = await prisma.notes.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return data;
};

export const createNote = async (formData: FormData) => {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const completed = formData.get("completed");
  const user = await getUser();
  const userId = user?.id as string;

  await prisma.notes.create({
    data: {
      userId: userId,
      title: title,
      description: description,
      completed: completed === "on",
    },
  });
  redirect("/dashboard/notes");
};

export const deleteNote = async (formData: FormData) => {
  const id = formData.get("id") as string;
  await prisma.notes.delete({
    where: { id },
  });
  revalidatePath("/");
};

export const getNote = async (id: string) => {
  const note = prisma.notes.findUnique({
    where: { id: id },
  });
  return note;
};

export const updateNote = async (formData: FormData) => {
  try {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const descrption = formData.get("descrption") as string;
    const completed = formData.get("completed");

    if (title !== null || descrption !== null) {
      await prisma.notes.update({
        where: { id },
        data: {
          title: title,
          description: descrption,
          completed: completed === "on",
        },
      });
    }
  } catch (error) {
    console.error("Erreur lors de la modification de la note", error);
  } finally {
    redirect("/");
  }
};