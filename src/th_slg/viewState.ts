import {
    State as GameState, Tile, TerrainType, Unit,
    getMoveablePositions
} from './state';
import * as BoardView from './viewState.board';
import { Array2, strEnum, assertUnreachable } from '../util';
import Vector from '../flappy/linear/vector';

const TileSize = 120;

export interface ViewState {
    gameState: GameState
    boardScale: number
    boardOffset: Vector
    boardView: BoardView.BoardViewState
    dragging?: BoardDragging
}

interface BoardDragging {
    startBoardOffset: Vector
    startPisotion: Vector
}

// Interactions

export function scale(oldState: ViewState, pos: Vector, scaleDelta: number): ViewState {
    return {
        gameState: oldState.gameState,
        boardScale: Math.max(0.1, oldState.boardScale - scaleDelta / 1000),
        boardOffset: oldState.boardOffset,
        boardView: oldState.boardView,
        dragging: oldState.dragging
    }
}

export function dragStart(oldState: ViewState, pos: Vector): ViewState {
    return {
        gameState: oldState.gameState,
        boardScale: oldState.boardScale,
        boardOffset: oldState.boardOffset,
        boardView: oldState.boardView,
        dragging: {
            startBoardOffset: oldState.boardOffset,
            startPisotion: pos
        }
    };
}

export function move(oldState: ViewState, pos: Vector): ViewState {
    if (!oldState.dragging)
        return oldState;

    return {
        gameState: oldState.gameState,
        boardScale: oldState.boardScale,
        boardOffset: Vector.add(oldState.dragging.startBoardOffset, Vector.subtracion(pos, oldState.dragging.startPisotion)),
        boardView: oldState.boardView,
        dragging: oldState.dragging
    };
}

export function drop(oldState: ViewState, pos: Vector): ViewState {
    return {
        gameState: oldState.gameState,
        boardScale: oldState.boardScale,
        boardOffset: oldState.boardOffset,
        boardView: oldState.boardView,
    };
}

export function click(oldState: ViewState, pos: Vector): ViewState {
    const boardPos = Vector.scale(Vector.subtracion(pos, oldState.boardOffset), oldState.boardScale);
    const boardSize = Vector.scale(
        new Vector(oldState.gameState.board.length, oldState.gameState.board[0].length),
        TileSize * oldState.boardScale);

    if (boardPos.x < 0 || boardPos.y < 0 || boardPos.x > boardSize.x || boardPos.y > boardSize.y)
        return oldState;
    return {
        gameState: oldState.gameState,
        boardScale: oldState.boardScale,
        boardOffset: oldState.boardOffset,
        boardView: BoardView.click(oldState.boardView, boardPos, oldState.gameState),
        dragging: oldState.dragging
    }
}

// rendering
export function render(context: CanvasRenderingContext2D, viewState: ViewState) {
    context.clearRect(0, 0, 1600, 900);
    context.fillStyle = "white";
    context.fillRect(0, 0, 1600, 900);

    context.save();
    context.translate(viewState.boardOffset.x, viewState.boardOffset.y);
    context.scale(viewState.boardScale, viewState.boardScale);

    BoardView.render(context, viewState.boardView, viewState.gameState);

    context.restore();
}
