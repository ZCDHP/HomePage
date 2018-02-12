export default class Vector {
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    public readonly x: number
    public readonly y: number

    public static add = (v1: Vector, v2: Vector) => new Vector(v1.x + v2.x, v1.y + v2.y);
    public static subtracion = (v1: Vector, v2: Vector) => new Vector(v1.x - v2.x, v1.y - v2.y);
    public static dot = (v1: Vector, v2: Vector) => v1.x * v2.y - v1.y * v2.x;
}
