import { expand, move, GameState, GameStateTypes, CellSourceType, LocatedCell, MoveDirections, map } from "./state";
import Vector from "../flappy/linear/vector";
import { Bazier, assertUnreachable } from "../util";

const Gap = 20;
const CellWidth = (900 - Gap * 5) / 4;
const moveDur = 100;
const mergeDur = moveDur * 2;
const generateDur = mergeDur;
const mergeStart = moveDur;
const generateStart = mergeStart;
const endGameScreenStart = mergeStart + mergeDur;

export interface ViewState {
    gameState: GameState
    startTime: number
}

export function init(gameState: GameState): ViewState {
    return {
        gameState,
        startTime: window.performance.now()
    };
}

export function render(context: CanvasRenderingContext2D, state: ViewState) {
    const passed = window.performance.now() - state.startTime;

    context.clearRect(0, 0, 900, 900);
    context.fillStyle = "rgb(187, 173, 160)";
    renderRoundRect(context, new Vector(900, 900), 11);

    const pMoving = moveAnimatePercentage(passed);
    const pGenerating = generateAnimatePercentage(passed);
    const pMerge = mergeAnimatePercentage(passed);
    const mergeScale = percentage2MergingScale(pMerge);

    const renderMove = (value: number, from: Vector, to: Vector) => {
        const fromPx = grid2Pos(from);
        const toPx = grid2Pos(to);
        const pos_m = Vector.add(Vector.scale(Vector.subtracion(toPx, fromPx), pMoving), fromPx);
        renderCell(context, value, pos_m);
    }

    expand(state.gameState.board)
        .sort((x, y) => renderPriority(x) - renderPriority(y))
        .forEach(x => {
            if (!x.cell) {
                renderCell(context, null, grid2Pos(x.position));
                return;
            }
            switch (x.cell.source.type) {
                case CellSourceType.Static:
                    renderCell(context, x.cell.value, grid2Pos(x.position));
                    return;
                case CellSourceType.Move:
                    renderMove(x.cell.value, x.cell.source.from, x.position);
                    return;
                case CellSourceType.Generate:
                    const offset_g = (1 - pGenerating) * CellWidth / 2;
                    const pos_g = Vector.add(grid2Pos(x.position), new Vector(offset_g, offset_g));
                    renderCell(context, x.cell.value, pos_g, pGenerating);
                    return;
                case CellSourceType.Merge:
                    const moveValue = x.cell.value / 2;
                    const offset_m = (1 - mergeScale) * CellWidth / 2;
                    x.cell.source.from.forEach(_from => renderMove(moveValue, _from, x.position));
                    const pos_m = Vector.add(grid2Pos(x.position), new Vector(offset_m, offset_m));
                    renderCell(context, x.cell.value, pos_m, mergeScale);
                    return;
            }
            assertUnreachable(x.cell.source);
        });

    if (passed > endGameScreenStart) {
        if (state.gameState.type == GameStateTypes.GameOver)
            renderGameOver(context);
        else if (state.gameState.type == GameStateTypes.Win)
            renderWin(context);
    }
}

function moveAnimatePercentage(passed: number) {
    const tMoving = passed > moveDur ? 1 : (passed / moveDur);
    return tMoving == 1 ? 1 : Bazier.ease_in_out(tMoving);
}

function generateAnimatePercentage(passed: number) {
    if (passed <= generateStart)
        return 0;
    const generatePassed = passed - generateStart;
    const tGenerating = generatePassed > generateDur ? 1 : (generatePassed / generateDur);
    return tGenerating == 1 ? 1 : Bazier.ease_in_out(tGenerating);
}

function mergeAnimatePercentage(passed: number) {
    if (passed <= mergeStart)
        return 0;
    const mergePassed = passed - mergeStart;
    const tMerging = mergePassed > mergeDur ? 1 : (mergePassed / mergeDur);
    return tMerging == 1 ? 1 : Bazier.ease(tMerging);
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

function renderCell(context: CanvasRenderingContext2D, value: number | null, pos: Vector, scale: number = 1) {
    const cellWidth = CellWidth * scale;
    context.save();
    context.translate(pos.x, pos.y);
    context.fillStyle = cellBackgroundColor(value);

    renderRoundRect(context, new Vector(cellWidth, cellWidth), cellWidth / 32);
    renderCellNumber(context, value, pos, cellWidth, scale);

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

function renderCellNumber(context: CanvasRenderingContext2D, value: number | null, pos: Vector, cellWidth: number, scale: number) {
    if (value == null)
        return;
    if (value <= 4)
        context.fillStyle = "rgb(119, 110, 101)";
    else
        context.fillStyle = "rgb(249, 246, 242)";
    context.font = `${700 * scale} ${scale * 90}px sans-serif`;
    context.textAlign = "center"
    context.textBaseline = "middle";
    context.fillText(
        value.toString(),
        cellWidth / 2,
        cellWidth / 2);
}

function renderGameOver(context: CanvasRenderingContext2D) {
    context.fillStyle = "rgba(238, 228, 218, 0.73)";
    context.fillRect(0, 0, 900, 900);

    context.fillStyle = "rgb(119, 110, 101)";
    context.font = "700 120px sans-serif";
    context.textAlign = "center"
    context.fillText("Game Over", 450, 450);
}

function renderWin(context: CanvasRenderingContext2D) {
    context.fillStyle = "rgba(237, 194, 46, 0.5)";
    context.fillRect(0, 0, 900, 900);

    context.fillStyle = "#f9f6f2";
    context.font = "700 120px sans-serif";
    context.textAlign = "center"
    context.fillText("You Win", 450, 450);
}

function cellBackgroundColor(value: number | null): string {
    switch (value) {
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
        default: throw new Error(`Invalid cell :${value}`);
    }
}

function renderPriority(locatedCell: LocatedCell) {
    if (!locatedCell.cell)
        return 0;
    switch (locatedCell.cell.source.type) {
        case CellSourceType.Static: return 1;
        case CellSourceType.Move: return 2;
        case CellSourceType.Generate: return 3;
        case CellSourceType.Merge: return 4;
    }
    assertUnreachable(locatedCell.cell.source);
}