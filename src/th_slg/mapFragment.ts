export type MapFragment<T> = { [x: number]: { [y: number]: T } };
export function create<T>(): MapFragment<T> {
    return {};
}

export function get<T>(x: number, y: number, map: MapFragment<T>): T | null {
    return map[x] ?
        map[x][y]
        : null;
}

export function set<T>(x: number, y: number, map: MapFragment<T>, value: T) {
    if (!map[x])
        map[x] = {};
    map[x][y] = value;
}

export function map<T, TOut>(func: (x: number, y: number, v: T) => TOut, map: MapFragment<T>): TOut[] {
    const result: TOut[] = [];
    for (const [xs, r] of Object.entries(map)) {
        const x = Number(xs);
        for (const [ys, v] of Object.entries(r))
            result.push(func(x, Number(ys), v));
    }

    return result
}

export function contains<T>(x: number, y: number, map: MapFragment<T>): boolean {
    return Boolean(map[x] && map[x][y]);
}