export const exists = (target: unknown): target is NonNullable<typeof target> => Boolean(target);
