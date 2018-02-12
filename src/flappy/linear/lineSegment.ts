import Vector from './vector'

export default class LineSegment {
    constructor(point1: Vector, point2: Vector) {
        this.point1 = point1;
        this.point2 = point2;
    }

    public readonly point1: Vector
    public readonly point2: Vector

    public static intersects(line1: LineSegment, line2: LineSegment): boolean {
        const a = line1.point1, b = line1.point2, c = line2.point1, d = line2.point2;
        const denominator = ((b.x - a.x) * (d.y - c.y)) - ((b.y - a.y) * (d.x - c.x));
        const numerator1 = ((a.y - c.y) * (d.x - c.x)) - ((a.x - c.x) * (d.y - c.y));
        const numerator2 = ((a.y - c.y) * (b.x - a.x)) - ((a.x - c.x) * (b.y - a.y));
        if (denominator == 0)
            return numerator1 == 0 && numerator2 == 0;

        const r = numerator1 / denominator;
        const s = numerator2 / denominator;

        return r >= 0
            && r <= 1
            && s >= 0
            && s <= 1;
    }
}


