import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const hashString = async (value: string): Promise<string> =>
    await bcrypt.hash(value, await bcrypt.genSalt(12));

export const hashStringSync = (value: string): string =>
    bcrypt.hashSync(value, bcrypt.genSaltSync(12));

export const compare = async (one: string, two: string): Promise<boolean> =>
    await bcrypt.compare(one, two);

export const createRandomString = (length = 128): string =>
    crypto
        .randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);

export default {
    hashString,
    hashStringSync,
    compare,
    createRandomString,
};
