export function assertUnreachable(x: never): never {
    throw new Error("Didn't expect to get here");
}

export function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
    return o.reduce((res, key) => {
        res[key] = key;
        return res;
    }, Object.create(null));
}
