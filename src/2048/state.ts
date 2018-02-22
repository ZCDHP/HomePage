import { strEnum, assertUnreachable } from "../util"
import Vector from "../flappy/linear/vector";

export const MoveDirections = strEnum(["Up", "Down", "Left", "Right"]);
type MoveDirections = keyof typeof MoveDirections;

export type Cell = number | null;
const EmptyBoard: Cell[][] = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
];

export interface GameState {
    cells: Cell[][]
};

export interface MovePath {
    number: number
    from: Vector
    to: Vector
}

export interface MoveResult {
    gameState: GameState
    moved: MovePath[]
    generated: LocatedCell[]
}

export function gameStart(): GameState {
    const cells = tryAddNewCell(tryAddNewCell(EmptyBoard) as Cell[][]) as Cell[][];
    return { cells };
}

export function move(oldState: GameState, dir: MoveDirections) {
    const vector = moveVector(dir);
    return toArray(oldState.cells)
        .sort((a, b) => b.x * vector.x + b.y * vector.y - (a.x * vector.x + a.y * vector.y))
        .reduce<MoveResult>((result, cell) => {
            const { cells, path, generated } = moveCellStep(result.gameState.cells, cell, vector);
            result.gameState = { cells };
            if (path)
                result.moved.push(path);
            if (generated)
                result.generated.push(generated);
            return result;
        }, { gameState: oldState, moved: [], generated: [] });
}

function moveCellStep(cells: Cell[][], cell: LocatedCell, moveVector: Vector, path?: MovePath)
    : { cells: Cell[][], path?: MovePath, generated?: LocatedCell } {
    const currentPath = path == null ? {
        from: cell,
        to: Vector.add(cell, moveVector),
        number: cell.number
    } : {
            from: path.from,
            to: Vector.add(path.to, moveVector),
            number: cell.number
        };

    if (outOfBoard(currentPath.to))
        return {
            cells: path == null ? cells : mapPath(cells, path),
            path
        };

    const hittedCell = cells[currentPath.to.x][currentPath.to.y];
    if (hittedCell == null)
        return moveCellStep(cells, cell, moveVector, currentPath)
    else {
        if (hittedCell != cell.number)
            return {
                cells: path == null ? cells : mapPath(cells, path),
                path
            };
        else
            return {
                cells: map(mapPath(cells, currentPath), (x, y, c) => {
                    if (Vector.equal({ x, y }, currentPath.to))
                        return (c as number) * 2;
                    else
                        return c;
                }),
                path: path,
                generated: { x: currentPath.to.x, y: currentPath.to.y, number: cell.number * 2 }
            };
    }
}

function outOfBoard(position: Vector) { return position.x < 0 || position.x > 3 || position.y < 0 || position.y > 3; }

function moveVector(dir: MoveDirections) {
    switch (dir) {
        case MoveDirections.Up: return { x: 0, y: -1 };
        case MoveDirections.Down: return { x: 0, y: 1 };
        case MoveDirections.Left: return { x: -1, y: 0 };
        case MoveDirections.Right: return { x: 1, y: 0 };
    }
    assertUnreachable(dir);
}

function tryAddNewCell(cells: Cell[][]): (Cell[][] | false) {
    const empty = emptyCells(cells);
    if (empty.length == 0)
        return false;
    else {
        const selected = randomPick(empty);
        return map(cells, (x, y, cell) => {
            if (x == selected.x && y == selected.y)
                return Math.random() < 0.9 ? 2 : 4;
            else
                return cell;
        });
    }
}

function randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function emptyCells(cells: Cell[][]) {
    return reduce<Array<{ x: number, y: number }>>(cells, [], (x, y, arr, cell) => {
        if (cell == null)
            arr.push({ x, y });
        return arr;
    });
}

export function map(cells: Cell[][], mapper: (x: number, y: number, cell: Cell) => Cell) {
    return cells.map((row, x) => row.map((cell, y) => mapper(x, y, cell)));
}

export function reduce<T>(cells: Cell[][], init: T, reducer: (x: number, y: number, value: T, cell: Cell) => T) {
    return cells.reduce((rowv, row, x) => row.reduce((cellv, cell, y) => reducer(x, y, cellv, cell), rowv), init)
}

export function forEach(cells: Cell[][], func: (x: number, y: number, cell: Cell) => void) {
    return cells.forEach((row, x) => row.forEach((cell, y) => func(x, y, cell)))
}

type LocatedCell = Vector & { number: number };

function toArray(cells: Cell[][]) {
    return reduce<LocatedCell[]>(
        cells, [],
        (x, y, arr, cell) => {
            if (cell != null)
                arr.push({ x, y, number: cell });
            return arr;
        })
}

function mapPath(cells: Cell[][], path: MovePath) {
    return map(cells, (x, y, c) => {
        if (Vector.equal({ x, y }, path.from))
            return null;
        else if (Vector.equal({ x, y }, path.to))
            return path.number;
        else
            return c;
    })
}