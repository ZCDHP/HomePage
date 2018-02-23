import { strEnum, assertUnreachable } from "../util"
import Vector from "../flappy/linear/vector";
import { List } from "immutable"

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

type Located<T> = Vector & T;
export type LocatedCell = Located<{ cell: Cell }>
export type LocatedNumber = Located<{ cell: number }>

export interface MoveResult {
    gameState: GameState
    moved: List<MovePath>
    generated: List<LocatedNumber>
}

export function gameStart(): GameState {
    const cell1 = tryGenerateNewCell(EmptyBoard);
    const cells1 = set(EmptyBoard, cell1 as LocatedNumber);
    const cell2 = tryGenerateNewCell(cells1);
    const cells2 = set(cells1, cell2 as LocatedNumber);
    return { cells: cells2 };
}

export function move(oldState: GameState, dir: MoveDirections): MoveResult {
    const vector = moveVector(dir);
    const moveResult = locatedNumbers(oldState.cells)
        .sort((a, b) => b.x * vector.x + b.y * vector.y - (a.x * vector.x + a.y * vector.y))
        .reduce<MoveResult>((result, cell) => {
            const { cells, path, generated } = moveCellStep(result!.gameState.cells, cell!, vector, result!.generated);
            return {
                gameState: { cells },
                moved: path ?
                    result!.moved.push(path) : result!.moved,
                generated: generated ?
                    result!.generated.push(generated) : result!.generated
            };
        }, { gameState: oldState, moved: List(), generated: List() });

    if (moveResult.moved.count() > 0) {
        const newCell = tryGenerateNewCell(moveResult.gameState.cells);
        if (newCell == false)
            throw new Error("Never");
        return {
            gameState: { cells: set(moveResult.gameState.cells, newCell) },
            moved: moveResult.moved,
            generated: moveResult.generated.push(newCell)
        };
    }
    else
        return moveResult;
}

function moveCellStep(cells: Cell[][], cell: LocatedNumber, moveVector: Vector, doNotMerge: List<LocatedNumber>, path?: MovePath)
    : { cells: Cell[][], path?: MovePath, generated?: LocatedNumber } {
    const currentPath = path == null ? {
        from: cell,
        to: Vector.add(cell, moveVector),
        number: cell.cell
    } : {
            from: path.from,
            to: Vector.add(path.to, moveVector),
            number: cell.cell
        };

    if (outOfBoard(currentPath.to))
        return {
            cells: path == null ? cells : mapPath(cells, path),
            path
        };

    const hittedCell = cells[currentPath.to.x][currentPath.to.y];
    if (hittedCell == null)
        return moveCellStep(cells, cell, moveVector, doNotMerge, currentPath)
    else {
        if (hittedCell != cell.cell || doNotMerge.some(x => Vector.equal(x!, currentPath.to)))
            return {
                cells: path == null ? cells : mapPath(cells, path),
                path
            };
        else
            return {
                cells: set(mapPath(cells, currentPath), {
                    x: currentPath.to.x,
                    y: currentPath.to.y,
                    cell: cell.cell * 2
                }),
                path: currentPath,
                generated: { x: currentPath.to.x, y: currentPath.to.y, cell: cell.cell * 2 }
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

function tryGenerateNewCell(cells: Cell[][]): (LocatedNumber | false) {
    const empty = locatedCells(cells)
        .filter(x => x!.cell == null)
        .toArray();
    if (empty.length == 0)
        return false;
    else {
        const selected = randomPick(empty);
        return {
            x: selected.x,
            y: selected.y,
            cell: Math.random() < 0.9 ? 2 : 4
        };
    }
}

function randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function map(cells: Cell[][], mapper: (lc: LocatedCell) => Cell) {
    return cells.map((row, x) => row.map((cell, y) => mapper({ x, y, cell })));
}

export function reduce<T>(cells: Cell[][], init: T, reducer: (lc: LocatedCell, value: T) => T) {
    return cells.reduce((rowv, row, x) => row.reduce((cellv, cell, y) => reducer({ x, y, cell }, cellv), rowv), init)
}

export function forEach(cells: Cell[][], func: (x: number, y: number, cell: Cell) => void) {
    return cells.forEach((row, x) => row.forEach((cell, y) => func(x, y, cell)))
}

function set(cells: Cell[][], toSet: LocatedCell) {
    return map(cells, lc => Vector.equal(lc, toSet) ? toSet.cell : lc.cell);
}

function locatedCells(cells: Cell[][]): List<LocatedCell> {
    return reduce<List<LocatedCell>>(
        cells,
        List(),
        (lc, list) => list.push(lc));
}

function locatedNumbers(cells: Cell[][]): List<LocatedNumber> {
    return reduce<List<LocatedNumber>>(
        cells,
        List(),
        (lc, list) => lc.cell == null ? list : list.push({ x: lc.x, y: lc.y, cell: lc.cell }));
}

function mapPath(cells: Cell[][], path: MovePath) {
    return set(
        set(cells,
            {
                x: path.from.x,
                y: path.from.y,
                cell: null
            },
        ), {
            x: path.to.x,
            y: path.to.y,
            cell: path.number
        });
}