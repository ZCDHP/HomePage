import { List } from 'immutable';
import { forEach, GameState, Cell, MovePath, LocatedNumber, MoveDirections } from "./state";
import Vector from "../flappy/linear/vector";

const Gap = 20;
const CellWidth = (900 - Gap * 5) / 4;

type Moving = MovePath & { startTime: number };
type Generating = LocatedNumber & { startTime: number };

export interface ViewState {
    gameState: GameState
    movings: List<Moving>
    generatings: List<Generating>
}

export function init(gameState: GameState): ViewState {
    return {
        gameState,
        movings: List(),
        generatings: List()
    };
}

export function render(context: CanvasRenderingContext2D, state: ViewState) {
    context.clearRect(0, 0, 900, 900);
    context.fillStyle = "rgb(187, 173, 160)";
    context.fillRect(0, 0, 900, 900);
    forEach(state.gameState.cells, (x, y, cell) => renderCell(context, x, y, cell));
}

function renderCell(context: CanvasRenderingContext2D, x: number, y: number, cell: Cell) {
    const left = x * (Gap + CellWidth) + Gap;
    const top = y * (Gap + CellWidth) + Gap;

    context.fillStyle = cellBackgroundColor(cell);
    context.fillRect(left, top, CellWidth, CellWidth);

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
        left + CellWidth / 2,
        top + CellWidth / 2);
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