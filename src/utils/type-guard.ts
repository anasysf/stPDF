export const isNotNull = (target: unknown): target is NonNullable<typeof target> => Boolean(target);
