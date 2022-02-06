import { PrismaClient } from "@prisma/client";
import { SYSTEM_USER_ID } from "../seed/user.seed";
/**
 * This patch is to back-fill the relevant user ID's into any to_do records, 
 * so the user ID columns can then be made required rather than optional.
 * @param prisma 
 */
export const patch = async (prisma: PrismaClient): Promise<void> => {
    await prisma.to_do.updateMany({
        where: {
            created_by_id: null
        },
        data: {
            created_by_id: SYSTEM_USER_ID
        }
    });
    await prisma.to_do.updateMany({
        where: {
            assigned_to_id: null
        },
        data: {
            assigned_to_id: SYSTEM_USER_ID
        }
    });
}