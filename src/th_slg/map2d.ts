import immer from 'immer';
import Vector from "../flappy/linear/vector";

type MapObject<T> = { [x: number]: { [y: number]: T } };
interface Coordinated<T> {
    corrdinate: Vector,
    value: T
};
function Coordinated<T>(x: number, y: number, value: T): Coordinated<T> {
    return { corrdinate: new Vector(x, y), value };
}

export default class Map2d<T> implements Iterable<Coordinated<T>> {
    constructor(map: MapObject<T> = {}) {
        this.map = map;
    }

    public get(pos: Vector): T | null {
        return this.map[pos.x] ?
            this.map[pos.x][pos.y]
            : null;
    }

    public set(pos: Vector, value: T): Map2d<T> {
        return new Map2d(immer(this.map, draft => {
            if (!draft[pos.x])
                draft[pos.x] = {};
            draft[pos.x][pos.y] = value
            return;
        }));
    }

    public *[Symbol.iterator](): Iterator<Coordinated<T>> {
        for (const { key: x, value: xValue } of expand(this.map))
            for (const { key: y, value } of expand(xValue))
                yield Coordinated(x, y, value);
    }

    private map: MapObject<T>;
}

function* expand<T>(obj: { [y: number]: T }): IterableIterator<{ key: number, value: T }> {
    for (const [key, value] of Object.entries(obj))
        yield { key: Number(key), value };
}