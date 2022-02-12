import { z } from 'zod';
import { zDate, zRouteNumericId } from '@to-do/api-schemas/common';
import { validator } from '@to-do/validators/user-validator';
import { userSessionDetailSchema } from '@to-do/api-schemas/user-session-schema';

const id = z.number().int();
const createdOn = zDate();
const updatedOn = zDate().optional().nullable();
const username = z.string().max(64); // TODO: need to refind this to make sure it's a "sluggish" value
const emailAddress = z.string().email().max(64);
const emailAddressConfirmed = z.boolean().default(false);
const password = z
    .string()
    .min(8)
    .max(64)
    .regex(/\d/, { message: 'At least one number required' })
    .regex(/[a-z]/, { message: 'At least one lower case letter required' })
    .regex(/[A-Z]/, { message: 'At least one upper case letter required' })
    .regex(/\W/, { message: 'At least one special character required' });

export const userCreateSchema = z.object({
    // prettier-ignore
    username: username.refine(async value => {
        const valid = await validator.usernameAvailable(value);
        return valid.success;
    }, { message: 'Username already exists', }
    ),
    // prettier-ignore
    emailAddress: emailAddress.refine(async value => {
        const valid = await validator.emailAddressAvailable(value);
        return valid.success;
    }, { message: 'Email address already registered', }
    ),
    password,
    emailAddressConfirmed, // for dev/testing only
});

export const userDetailSchema = z.object({
    id,
    createdOn,
    updatedOn,
    username,
    emailAddress,
    passwordHash: z.string(),
    emailAddressConfirmed,
});

export const userGetSchema = z.object({
    id: zRouteNumericId(),
    session: userSessionDetailSchema,
});

export const userLoginSchema = z.object({
    password: z.string(),
    emailAddressOrUsername: username.or(emailAddress),
});

export type UserCreateType = z.infer<typeof userCreateSchema>;
export type UserDetailType = z.infer<typeof userDetailSchema>;
export type UserGetType = z.infer<typeof userGetSchema>;