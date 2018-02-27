import * as BezierEasing from 'bezier-easing'

export function assertUnreachable(x: never): never {
    throw new Error("Didn't expect to get here");
}

export function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
    return o.reduce((res, key) => {
        res[key] = key;
        return res;
    }, Object.create(null));
}

export function scaleCanvas(context: CanvasRenderingContext2D, expectedWidth: number, expectedHeight: number) {
    context.canvas.width = context.canvas.clientWidth;
    context.canvas.height = context.canvas.clientWidth / expectedWidth * expectedHeight;
    context.canvas.style.height = `${context.canvas.height}px`;
    const scale = context.canvas.clientWidth / expectedWidth;
    context.setTransform(scale, 0, 0, scale, 0, 0);
}

export class Bazier {
    public static ease_in_out = BezierEasing(0.42, 0, 0.58, 1);
    public static ease = BezierEasing(0.25, 0.1, 0.25, 1);
}