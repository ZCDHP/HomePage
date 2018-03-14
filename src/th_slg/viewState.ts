import immer from 'immer'
import { State as GameState, Tile, TerrainType, Unit } from './state';
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
    return immer(oldState, draft => {
        draft.boardScale = Math.max(0.1, oldState.boardScale - scaleDelta / 1000)
    });
}

export function dragStart(oldState: ViewState, pos: Vector): ViewState {
    return immer(oldState, draft => {
        draft.dragging = {
            startBoardOffset: oldState.boardOffset,
            startPisotion: pos
        }
    });
}

export function move(oldState: ViewState, pos: Vector): ViewState {
    if (oldState.dragging) {
        const drag = oldState.dragging;
        return immer(oldState, draft => {
            draft.boardOffset = Vector.add(
                drag.startBoardOffset,
                Vector.subtracion(
                    pos,
                    drag.startPisotion));
        });
    }

    const boardPos = getBoardPos(oldState, pos);
    const boardSize = getBoardSize(oldState, pos);
    if (boardPos.x < 0 || boardPos.y < 0 || boardPos.x > boardSize.x || boardPos.y > boardSize.y)
        return oldState;
    return immer(oldState, draft => {
        draft.boardView = BoardView.move(oldState.boardView, boardPos, oldState.gameState);
    });
}

export function drop(oldState: ViewState, pos: Vector): ViewState {
    return immer(oldState, draft => draft.dragging = undefined);
}

export function click(oldState: ViewState, pos: Vector): ViewState {
    const boardPos = getBoardPos(oldState, pos);
    const boardSize = getBoardSize(oldState, pos);

    if (boardPos.x < 0 || boardPos.y < 0 || boardPos.x > boardSize.x || boardPos.y > boardSize.y)
        return oldState;
    return immer(oldState, draft => {
        draft.boardView = BoardView.click(oldState.boardView, boardPos, oldState.gameState)
    });
}

function getBoardPos(state: ViewState, pos: Vector) {
    return Vector.scale(Vector.subtracion(pos, state.boardOffset), state.boardScale);
}
function getBoardSize(state: ViewState, pos: Vector) {
    return Vector.scale(
        new Vector(state.gameState.board.length, state.gameState.board[0].length),
        TileSize * state.boardScale);
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
