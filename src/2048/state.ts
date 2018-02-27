import { strEnum, assertUnreachable } from "../util"
import Vector from "../flappy/linear/vector";
import { List } from "immutable"

// Cell
export const CellSourceType = strEnum(["Static", "Move", "Merge", "Generate"]);
export type CellSourceType = keyof typeof CellSourceType;
interface CellSource_Static {
    type: typeof CellSourceType.Static
}
const CellSource_Static: CellSource_Static = { type: CellSourceType.Static };
interface CellSource_Move {
    type: typeof CellSourceType.Move
    from: Vector
}
function CellSource_Move(from: Vector): CellSource_Move { return { type: CellSourceType.Move, from }; }
interface CellSource_Merge {
    type: typeof CellSourceType.Merge
    from: Vector[]
    mergeMoveNumber: number
}
function CellSource_Merge(from: Vector[], mergeMoveNumber: number): CellSource_Merge { return { type: CellSourceType.Merge, from, mergeMoveNumber }; }
interface CellSource_Generate {
    type: typeof CellSourceType.Generate
}
const CellSource_Generate: CellSource_Generate = { type: CellSourceType.Generate };
export type CellSource =
    | CellSource_Static
    | CellSource_Move
    | CellSource_Merge
    | CellSource_Generate;
export interface Cell {
    value: number
    source: CellSource
}

function GeneratedCell(value: number): Cell { return { value, source: CellSource_Generate }; };
function MovedCell(value: number, from: Vector): Cell { return { value, source: CellSource_Move(from) }; }
function MergedCell(value: number, from: Vector[], mergeMoveNumber: number): Cell { return { value, source: CellSource_Merge(from, mergeMoveNumber) }; }
function StaticCell(value: number): Cell { return { value, source: CellSource_Static }; }

export type Nullable<T> = T | null;
export type Board = Nullable<Cell>[][];
const EmptyBoard: Board = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
];
export interface LocatedCell {
    position: Vector
    cell: Nullable<Cell>
}

// Game
export const GameStateTypes = strEnum(["Gaming", "GameOver", "Win"]);
export type GameStateTypes = keyof typeof GameStateTypes;
export interface GameState {
    type: GameStateTypes
    board: Board
    score: number
    moveNumber: number
}

const NewValue = () => Math.random() < 0.9 ? 2 : 4;

export function gameStart(): GameState {
    const empty1 = renderEmptyPosition(EmptyBoard);
    const board1 = setGenerate(EmptyBoard, NewValue(), empty1);
    const empty2 = renderEmptyPosition(board1);
    const board2 = setGenerate(board1, NewValue(), empty2);
    return { board: board2, score: 0, type: GameStateTypes.Gaming, moveNumber: 0 };
}

export const MoveDirections = strEnum(["Up", "Down", "Left", "Right"]);
export type MoveDirections = keyof typeof MoveDirections;

export function move(oldState: GameState, dir: MoveDirections): GameState {
    if (oldState.type != GameStateTypes.Gaming)
        return oldState;

    const moveNumber = oldState.moveNumber + 1;
    const movedBoard = moveBoard(oldState.board, moveNumber, dir);

    if (!isVaildMovedBoard(movedBoard))
        return oldState;

    const newCellGeneratedBoard = setGenerate(movedBoard, NewValue(), renderEmptyPosition(movedBoard));
    const gameOver = !([MoveDirections.Up, MoveDirections.Down, MoveDirections.Left, MoveDirections.Right] as MoveDirections[])
        .some(_dir => isVaildMovedBoard(moveBoard(newCellGeneratedBoard, moveNumber + 1, _dir)));
    const win = expand(newCellGeneratedBoard).some(x => x.cell != null && x.cell.value == 2048);

    return {
        type: gameOver ? GameStateTypes.GameOver :
            win ? GameStateTypes.Win : GameStateTypes.Gaming,
        board: newCellGeneratedBoard,
        score: oldState.score + expand(newCellGeneratedBoard).filter(x => x.cell && x.cell.source.type == CellSourceType.Merge).reduce((_scoure, lc) => _scoure + lc.cell!.value, 0),
        moveNumber
    };
}

function moveBoard(board: Board, moveNumber: number, dir: MoveDirections): Board {
    const vector = moveVector(dir);
    return expand(board)
        .filter(x => x.cell)
        .sort((a, b) => b.position.x * vector.x + b.position.y * vector.y - (a.position.x * vector.x + a.position.y * vector.y))
        .reduce(
            (_board, _locatedCell) => moveCell(_board, vector, moveNumber, _locatedCell.cell!.value, _locatedCell.position),
            board);
}

function moveCell(board: Board, moveVector: Vector, moveNumber: number, value: number, originPosition: Vector, currentPosition?: Vector): Board {
    const nextPosition = Vector.add(moveVector, currentPosition ? currentPosition : originPosition);
    const outOfBoard = isOutOfBoard(nextPosition);
    const hittedCell = outOfBoard ? null : board[nextPosition.x][nextPosition.y];
    const merge = hittedCell != null &&
        hittedCell.value == value &&
        (hittedCell.source.type != CellSourceType.Merge || hittedCell.source.mergeMoveNumber != moveNumber);
    const stopMove = outOfBoard || (hittedCell && !merge);
    if (stopMove)
        return currentPosition && !Vector.equal(originPosition, currentPosition) ?
            setMove(board, value, originPosition, currentPosition) :
            setStatic(board, value, originPosition);

    if (merge) {
        const from = [
            hittedCell!.source.type == CellSourceType.Move ? (hittedCell!.source as CellSource_Move).from : nextPosition,
            originPosition
        ]
        return setMerge(board, value * 2, from, moveNumber, nextPosition);
    }

    return moveCell(board, moveVector, moveNumber, value, originPosition, nextPosition);
}

function isVaildMovedBoard(board: Board) { return expand(board).some(x => x.cell != null && (x.cell.source.type == CellSourceType.Move || x.cell.source.type == CellSourceType.Merge)); }

function isOutOfBoard(position: Vector) { return position.x < 0 || position.x > 3 || position.y < 0 || position.y > 3; }

function moveVector(dir: MoveDirections) {
    switch (dir) {
        case MoveDirections.Up: return { x: 0, y: -1 };
        case MoveDirections.Down: return { x: 0, y: 1 };
        case MoveDirections.Left: return { x: -1, y: 0 };
        case MoveDirections.Right: return { x: 1, y: 0 };
    }
    assertUnreachable(dir);
}

// Board Operations
function renderEmptyPosition(board: Board): Vector {
    const emptyPositions = expand(board).filter(x => x.cell == null).map(x => x.position);
    return randomPick(emptyPositions);
}

function setGenerate(board: Board, value: number, position: Vector): Board {
    return set(board, GeneratedCell(value), position)
}
function setMove(board: Board, value: number, from: Vector, to: Vector): Board {
    return set(set(board, MovedCell(value, from), to), null, from);
}
function setMerge(board: Board, value: number, from: Vector[], mergeMoveNumber: number, position: Vector): Board {
    const fromRemovde = from.reduce<Board>(
        (_board, _from) => set(_board, null, _from)
        , board);
    return set(fromRemovde, MergedCell(value, from, mergeMoveNumber), position);
}
function setStatic(board: Board, value: number, position: Vector): Board {
    return set(board, StaticCell(value), position);
}
function set(board: Board, cell: Nullable<Cell>, position: Vector): Board {
    return map(board, old => Vector.equal(old.position, position) ? cell : old.cell);
}

export function expand(board: Board): (LocatedCell)[] {
    return reduce<List<LocatedCell>>(
        board,
        List(),
        (lc, list) => list.push(lc))
        .toArray();
}

export function map(cells: Board, mapper: (lc: LocatedCell) => Nullable<Cell>): Board {
    return cells.map((row, x) => row.map((cell, y) => mapper({ position: new Vector(x, y), cell })));
}

export function reduce<T>(board: Board, init: T, reducer: (lc: LocatedCell, value: T) => T) {
    return board.reduce((rowv, row, x) => row.reduce((cellv, cell, y) => reducer({ position: new Vector(x, y), cell }, cellv), rowv), init)
}

function randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}