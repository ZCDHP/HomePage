import { forEach, map, GameState, Cell, MovePath, LocatedNumber, MoveDirections, move } from "./state";
import Vector from "../flappy/linear/vector";
import { Bazier } from "../util";

const Gap = 20;
const CellWidth = (900 - Gap * 5) / 4;
const moveDur = 100;
const mergeDur = moveDur * 2;
const generateDur = mergeDur;
const mergeStart = moveDur;
const generateStart = mergeStart;

export interface ViewState {
    gameState: GameState
    movings: MovePath[]
    mergings: LocatedNumber[]
    generatings: LocatedNumber[]
    startTime: number
}

export function init(gameState: GameState): ViewState {
    return {
        gameState,
        movings: [],
        mergings: [],
        generatings: [],
        startTime: window.performance.now()
    };
}

export function render(context: CanvasRenderingContext2D, state: ViewState) {
    const passed = window.performance.now() - state.startTime;

    context.clearRect(0, 0, 900, 900);
    context.fillStyle = "rgb(187, 173, 160)";
    renderRoundRect(context, new Vector(900, 900), 11);

    const notInAnime = map(state.gameState.cells, lc => {
        if (
            state.movings.some(moving => Vector.equal(moving.to, lc)) ||
            state.generatings.some(generating => Vector.equal(generating, lc)) ||
            state.mergings.some(merging => Vector.equal(merging, lc)))
            return null;
        else
            return lc.cell;
    });

    forEach(notInAnime, lc => renderCell(context, lc.cell, grid2Pos(lc)));

    const tMoving = passed > moveDur ? 1 : (passed / moveDur);
    const pMoving = Bazier.ease_in_out(tMoving);
    state.movings.forEach(moving => {
        const from = grid2Pos(moving.from);
        const to = grid2Pos(moving.to);
        const pos = Vector.add(Vector.scale(Vector.subtracion(to, from), pMoving), from);
        renderCell(context, moving.number, pos);
    });

    if (passed > generateStart) {
        const generatePassed = passed - generateStart;
        const tGenerating = generatePassed > generateDur ? 1 : (generatePassed / generateDur);
        const pGenerating = Bazier.ease_in_out(tGenerating);
        state.generatings.forEach(generating => {
            const offset = (1 - tGenerating) * CellWidth / 2;
            const pos = Vector.add(grid2Pos(generating), new Vector(offset, offset));
            renderCell(context, generating.cell, pos, pGenerating);
        });
    }

    if (passed > mergeStart) {
        const mergePassed = passed - mergeStart;
        const tMerging = mergePassed > mergeDur ? 1 : (mergePassed / mergeDur);
        const scale = percentage2MergingScale(Bazier.ease(tMerging));
        state.mergings.forEach(merging => {
            const offset = (1 - scale) * CellWidth / 2;
            const pos = Vector.add(grid2Pos(merging), new Vector(offset, offset));
            renderCell(context, merging.cell, pos, scale);
        })
    }
}

function percentage2MergingScale(p: number) {
    if (p >= 1)
        return 1;

    if (p <= 0.5)
        return p * 2 * 1.2;
    else
        return 1.2 - 0.2 * (p - 0.5) * 2;
}

function grid2Pos(gird: Vector) {
    return Vector.add(Vector.scale(gird, Gap + CellWidth), new Vector(Gap, Gap));
}

function renderCell(context: CanvasRenderingContext2D, cell: Cell, pos: Vector, scale: number = 1) {
    const cellWidth = CellWidth * scale;
    context.save();
    context.translate(pos.x, pos.y);
    context.fillStyle = cellBackgroundColor(cell);

    renderRoundRect(context, new Vector(cellWidth, cellWidth), cellWidth / 32);
    renderCellNumber(context, cell, pos, cellWidth, scale);

    context.restore();
}

function renderRoundRect(context: CanvasRenderingContext2D, size: Vector, radius: number) {
    context.beginPath();
    context.moveTo(radius, 0);
    context.lineTo(size.x - radius, 0);
    context.quadraticCurveTo(size.x, 0, size.x, radius);
    context.lineTo(size.x, size.y - radius);
    context.quadraticCurveTo(size.x, size.y, size.x - radius, size.y);
    context.lineTo(radius, size.y);
    context.quadraticCurveTo(0, size.y, 0, size.y - radius);
    context.lineTo(0, radius);
    context.quadraticCurveTo(0, 0, radius, 0);
    context.closePath();
    context.fill();
}

function renderCellNumber(context: CanvasRenderingContext2D, cell: Cell, pos: Vector, cellWidth: number, scale: number) {
    if (cell == null)
        return;
    if (cell <= 4)
        context.fillStyle = "rgb(119, 110, 101)";
    else
        context.fillStyle = "rgb(249, 246, 242)";
    context.font = `${700 * scale} ${scale * 90}px sans-serif`;
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