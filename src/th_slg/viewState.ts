import { State as GameState, Tile, TileType } from './state';
import { Array2, assertUnreachable } from '../util';
import Vector from '../flappy/linear/vector';

const TileSize = 120;

export interface ViewState {
    gameState: GameState
    boardScale: number
    boardOffset: Vector
    draging?: BoardDragingState
}

export interface BoardDragingState {
    startBoardOffset: Vector
    startPisotion: Vector
}

export function scale(oldState: ViewState, pos: Vector, scaleDelta: number): ViewState {
    return {
        gameState: oldState.gameState,
        boardScale: Math.max(0.1, oldState.boardScale + scaleDelta / 1000),
        boardOffset: oldState.boardOffset
    }
}

export function dragStart(oldState: ViewState, pos: Vector): ViewState {
    return {
        gameState: oldState.gameState,
        boardScale: oldState.boardScale,
        boardOffset: oldState.boardOffset,
        draging: {
            startBoardOffset: oldState.boardOffset,
            startPisotion: pos
        }
    };
}

export function move(oldState: ViewState, pos: Vector): ViewState {
    if (!oldState.draging)
        return oldState;
    return {
        gameState: oldState.gameState,
        boardScale: oldState.boardScale,
        boardOffset: Vector.add(oldState.draging.startBoardOffset, Vector.subtracion(pos, oldState.draging.startPisotion)),
        draging: oldState.draging
    }
}

export function drop(oldState: ViewState, pos: Vector): ViewState {
    return {
        gameState: oldState.gameState,
        boardScale: oldState.boardScale,
        boardOffset: oldState.boardOffset,
    };
}

export function render(context: CanvasRenderingContext2D, viewState: ViewState) {
    context.clearRect(0, 0, 1600, 900);

    context.save();
    context.translate(viewState.boardOffset.x, viewState.boardOffset.y);
    context.scale(viewState.boardScale, viewState.boardScale);
    Array2.expand(viewState.gameState.board)
        .forEach(tile => {
            context.save();
            context.translate(tile.corrdinate.x * TileSize, tile.corrdinate.y * TileSize);
            renderTile(context, tile.value)
            context.restore();
        })
    context.restore();
}

function renderTile(context: CanvasRenderingContext2D, tile: Tile) {
    switch (tile.type) {
        case TileType.Plain:
            context.fillStyle = "#82E0AA";
            context.fillRect(0, 0, TileSize, TileSize);
            return;
        case TileType.Mountain:
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
        case TileType.Sea:
            context.fillStyle = "#5DADE2";
            context.fillRect(0, 0, TileSize, TileSize);
            return;
    }

    assertUnreachable(tile.type);
}