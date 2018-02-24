import { forEach, map, GameState, Cell, MovePath, LocatedNumber, MoveDirections, move } from "./state";
import Vector from "../flappy/linear/vector";

const Gap = 20;
const CellWidth = (900 - Gap * 5) / 4;
const animeDur = 100;

export interface ViewState {
    gameState: GameState
    movings: MovePath[]
    generatings: LocatedNumber[]
    startTime: number
}

export function init(gameState: GameState): ViewState {
    return {
        gameState,
        movings: [],
        generatings: [],
        startTime: window.performance.now()
    };
}

export function render(context: CanvasRenderingContext2D, state: ViewState) {
    const passed = window.performance.now() - state.startTime;
    const t = passed / animeDur;

    context.clearRect(0, 0, 900, 900);
    context.fillStyle = "rgb(187, 173, 160)";
    context.fillRect(0, 0, 900, 900);

    const notInAnime = map(state.gameState.cells, lc => {
        if (t < 1 &&
            (state.movings.some(moving => Vector.equal(moving.to, lc)) || state.generatings.some(generating => Vector.equal(generating, lc))))
            return null;
        else
            return lc.cell;
    });

    forEach(notInAnime, lc => renderCell(context, lc.cell, grid2Pos(lc)));

    if (t < 1) {
        state.movings.forEach(moving => {
            const from = grid2Pos(moving.from);
            const to = grid2Pos(moving.to);
            const pos = Vector.add(Vector.scale(Vector.subtracion(to, from), t), from);
            renderCell(context, moving.number, pos);
        });
        state.generatings.forEach(generating => {
            const offset = (1 - t) * CellWidth / 2;
            const pos = Vector.add(grid2Pos(generating), new Vector(offset, offset));
            renderCell(context, generating.cell, pos, t * CellWidth);
        });
    }
}

function grid2Pos(gird: Vector) {
    return Vector.add(Vector.scale(gird, Gap + CellWidth), new Vector(Gap, Gap));
}

function renderCell(context: CanvasRenderingContext2D, cell: Cell, pos: Vector, cellWidth: number = CellWidth) {
    context.save();
    context.translate(pos.x, pos.y);

    context.fillStyle = cellBackgroundColor(cell);
    context.fillRect(0, 0, cellWidth, cellWidth);

    renderCellNumber(context, cell, pos, cellWidth);

    context.restore();
}

function renderCellNumber(context: CanvasRenderingContext2D, cell: Cell, pos: Vector, cellWidth: number) {
    if (cell == null)
        return;
    if (cell <= 4)
        context.fillStyle = "rgb(119, 110, 101)";
    else
        context.fillStyle = "rgb(249, 246, 242)";
    context.font = '40pt Calibri';
    context.textAlign = "center"
    context.textBaseline = "middle";
    context.fillText(
        cell.toString(),
        cellWidth / 2,
        cellWidth / 2);
}

function cellBackgroundColor(cell: Cell): string {
    switch (cell) {
        case null: return "rgba(238, 228, 218, 0.35)";
        case 2: return "#eee4da";
        case 4: return "#ede0c8";
        case 8: return "#f2b179";
        case 16: return "#f59563";
        case 32: return "#f67c5f";
        case 64: return "#f65e3b";
        case 128: return "#edcf72";
        case 256: return "#edcc61";
        case 512: return "#edc850";
        case 1024: return "#edc53f";
        case 2048: return "#edc22e";
        default: throw new Error(`Invalid cell :${cell}`);
    }
}