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

export function gameStart(): GameState {
    const cells = tryAddNewCell(tryAddNewCell(EmptyBoard) as Cell[][]) as Cell[][];
    return { cells };
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