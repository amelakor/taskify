"use server";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateListOder } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return {
            error: "Unauthorized",
        };
    }

    const { items, boardId } = data;
    let lists;

    try {
        const transaction: any = items.map((list) =>
            db.list.update({
                where: {
                    id: list.id,
                    board: {
                        orgId,
                    },
                },
                data: {
                    order: list.order,
                },
            })
        );

        lists = await db.$transaction(transaction);
    } catch (error) {
        return {
            error: "Failed to reoder.",
        };
    }
    revalidatePath(`/board/${boardId}`);

    return {
        data: lists,
    };
};

export const updateListOrder = createSafeAction(UpdateListOder, handler);
