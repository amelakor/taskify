import { z } from "zod";
import { List } from "@prisma/client";
import { ActionState } from "@/lib/create-safe-action";
import { UpdateListOder } from "./schema";

export type InputType = z.infer<typeof UpdateListOder>;
export type ReturnType = ActionState<InputType, List[]>;
