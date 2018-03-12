import {
    State as GameState, Tile, TerrainType, Unit,
    getMoveablePositions
} from './state';
import { Array2, strEnum, assertUnreachable } from '../util';
import Vector from '../flappy/linear/vector';

const TileSize = 120;

export interface ViewState {
    gameState: GameState
    boardScale: number
    boardOffset: Vector
    operation?: Operation
}

// Operation
export const OperationType = strEnum(["BoardDragging", "UnitMoving"]);
export type OperationType = keyof typeof OperationType;

interface BoardDragging {
    type: typeof OperationType.BoardDragging
    startBoardOffset: Vector
    startPisotion: Vector
}

interface UnitMoving {
    type: typeof OperationType.UnitMoving
    unitPosition: Vector
    moveablePositions: Vector[]
}

type Operation =
    | BoardDragging
    | UnitMoving

// Interactions

export function scale(oldState: ViewState, pos: Vector, scaleDelta: number): ViewState {
    return {
        gameState: oldState.gameState,
        boardScale: Math.max(0.1, oldState.boardScale - scaleDelta / 1000),
        boardOffset: oldState.boardOffset,
        operation: oldState.operation
    }
}

export function dragStart(oldState: ViewState, pos: Vector): ViewState {
    return {
        gameState: oldState.gameState,
        boardScale: oldState.boardScale,
        boardOffset: oldState.boardOffset,
        operation: {
            type: OperationType.BoardDragging,
            startBoardOffset: oldState.boardOffset,
            startPisotion: pos
        }
    };
}

export function move(oldState: ViewState, pos: Vector): ViewState {
    if (!oldState.operation)
        return oldState;

    switch (oldState.operation.type) {
        case OperationType.BoardDragging:
            return {
                gameState: oldState.gameState,
                boardScale: oldState.boardScale,
                boardOffset: Vector.add(oldState.operation.startBoardOffset, Vector.subtracion(pos, oldState.operation.startPisotion)),
                operation: oldState.operation
            };
        case OperationType.UnitMoving:
            return oldState;
    }

    assertUnreachable(oldState.operation);
}

export function drop(oldState: ViewState, pos: Vector): ViewState {
    return {
        gameState: oldState.gameState,
        boardScale: oldState.boardScale,
        boardOffset: oldState.boardOffset,
    };
}

export function click(oldState: ViewState, pos: Vector): ViewState {
    const boardPos = viewPos2boardPos(oldState, pos);
    if (!boardPos || !oldState.gameState.board[boardPos.x][boardPos.y].unit)
        return oldState;
    return {
        gameState: oldState.gameState,
        boardScale: oldState.boardScale,
        boardOffset: oldState.boardOffset,
        operation: {
            type: OperationType.UnitMoving,
            unitPosition: boardPos,
            moveablePositions: getMoveablePositions(oldState.gameState, boardPos)
        }
    }
}

function viewPos2boardPos(state: ViewState, pos: Vector): Vector | null {
    const relativeToBoard = Vector.subtracion(pos, state.boardOffset);
    const tileSize = TileSize * state.boardScale;
    const floatBoardPost = Vector.scale(relativeToBoard, 1 / tileSize);
    const boardPos = new Vector(Math.trunc(floatBoardPost.x), Math.trunc(floatBoardPost.y));

    if (boardPos.x < 0 ||
        boardPos.y < 0 ||
        boardPos.x >= state.gameState.board.length ||
        boardPos.y >= state.gameState.board[boardPos.x].length)
        return null;
    else
        return boardPos;
}

// rendering
export function render(context: CanvasRenderingContext2D, viewState: ViewState) {
    context.clearRect(0, 0, 1600, 900);
    context.fillStyle = "white";
    context.fillRect(0, 0, 1600, 900);

    context.save();
    context.translate(viewState.boardOffset.x, viewState.boardOffset.y);
    context.scale(viewState.boardScale, viewState.boardScale);
    Array2.expand(viewState.gameState.board)
        .forEach(tile => {
            context.save();
            context.translate(tile.corrdinate.x * TileSize, tile.corrdinate.y * TileSize);
            renderTile(context, tile.value)
            if (viewState.operation &&
                viewState.operation.type == OperationType.UnitMoving &&
                viewState.operation.moveablePositions.some(x => Vector.equal(x, tile.corrdinate))) {
                context.fillStyle = "rgba(192,192,192,0.3)";
                context.fillRect(0, 0, TileSize, TileSize);
            }

            context.restore();
        })
    context.restore();
}

function renderTile(context: CanvasRenderingContext2D, tile: Tile) {
    renderTerrain(context, tile.terrain);
    if (tile.unit)
        renderUnit(context, tile.unit);
}

function renderTerrain(context: CanvasRenderingContext2D, terrain: TerrainType) {
    switch (terrain) {
        case TerrainType.Plain:
            context.fillStyle = "#82E0AA";
            context.fillRect(0, 0, TileSize, TileSize);
            return;
        case TerrainType.Mountain:
            context.fillStyle = "#82E0AA";
            context.fillRect(0, 0, TileSize, TileSize);
            context.strokeStyle = "black";
            context.beginPath();
            context.moveTo(0.375 * TileSize, 0.75 * TileSize);
            context.lineTo(0.5 * TileSize, 0.25 * TileSize);
            context.lineTo(0.625 * TileSize, 0.75 * TileSize);
            context.closePath();
            context.stroke();
            return;
        case TerrainType.Sea:
            context.fillStyle = "#5DADE2";
            context.fillRect(0, 0, TileSize, TileSize);
            return;
    }

    assertUnreachable(terrain);
}

function renderUnit(context: CanvasRenderingContext2D, unit: Unit) {
    context.fillStyle = 'black';
    context.font = "40px Arial";
    context.textBaseline = "top";
    context.fillText(unit.name, 0, 0, TileSize);
}