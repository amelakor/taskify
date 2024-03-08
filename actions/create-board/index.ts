"use server";

import { db } from "@/lib/db";
import { InputType, RetunType } from "./types";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateBoard } from "./schema";

const handler = async (data: InputType): Promise<RetunType> => {
    const { userId } = auth();

    if (!userId)
        return {
            error: "Unauthorized",
        };

    const { title } = data;
    let board;

    try {
        board = await db.board.create({
            data: { title },
        });
    } catch (error) {
        return {
            error: "Something went wrong.",
        };
    }

    revalidatePath(`/board/${board.id}`);
    return { data: board };
};

export const createBoard = createSafeAction(CreateBoard, handler);
