import * as BezierEasing from 'bezier-easing'
import { List } from "immutable"

export function assertUnreachable(x: never): never {
    throw new Error("Didn't expect to get here");
}

export function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
    return o.reduce((res, key) => {
        res[key] = key;
        return res;
    }, Object.create(null));
}

export function scaleCanvas(context: CanvasRenderingContext2D, expectedWidth: number, expectedHeight: number): number {
    context.canvas.width = context.canvas.clientWidth;
    context.canvas.height = context.canvas.clientWidth / expectedWidth * expectedHeight;
    context.canvas.style.height = `${context.canvas.height}px`;
    const scale = context.canvas.clientWidth / expectedWidth;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    return scale;
}

export class Bazier {
    public static ease_in_out = BezierEasing(0.42, 0, 0.58, 1);
    public static ease = BezierEasing(0.25, 0.1, 0.25, 1);
}


interface Coordinated2<T> {
    corrdinate: { x: number, y: number },
    value: T
};
export class Array2 {

    public static reduce<TArr, TOut>(array2: TArr[][], init: TOut, reducer: (lc: Coordinated2<TArr>, value: TOut) => TOut) {
        return array2.reduce((rowv, row, x) => row.reduce((cellv, cell, y) => reducer({ corrdinate: { x, y }, value: cell }, cellv), rowv), init)
    }

    public static expand<TArr>(array2: TArr[][]): Coordinated2<TArr>[] {
        return Array2.reduce<TArr, List<Coordinated2<TArr>>>(
            array2,
            List(),
            (lc, list) => list.push(lc))
            .toArray();
    }

    public static map<TArr>(array2: TArr[][], mapper: (lc: Coordinated2<TArr>) => TArr): TArr[][] {
        return array2.map((row, x) => row.map((cell, y) => mapper({ corrdinate: { x, y }, value: cell })));
    }
}