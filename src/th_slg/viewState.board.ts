import {
    State as GameState, Tile, TerrainType, Unit,
    getMoveablePositions,
} from './state';
import { Array2, strEnum, assertUnreachable } from '../util';
import Vector from '../flappy/linear/vector';

const TileSize = 120;

export type BoardViewState =
    | { type: typeof BoardViewStateType.None }
    | UnitMoving

export const BoardViewStateType = strEnum(["None", "UnitMoving"]);
export type BoardViewStateType = keyof typeof BoardViewStateType;

export const None = { type: BoardViewStateType.None }

export interface UnitMoving {
    type: typeof BoardViewStateType.UnitMoving
    unitPosition: Vector
    moveablePositions: Vector[]
}


// interaction
export function click(oldState: BoardViewState, pos: Vector, gameState: GameState): BoardViewState {
    const cell = getboardCell(pos);
    if (!gameState.board[cell.x][cell.y].unit)
        return oldState;
    return {
        type: BoardViewStateType.UnitMoving,
        unitPosition: cell,
        moveablePositions: getMoveablePositions(gameState, cell)
    }
}

function getboardCell(pos: Vector): Vector {
    const floatBoardPost = Vector.scale(pos, 1 / TileSize);
    return new Vector(Math.trunc(floatBoardPost.x), Math.trunc(floatBoardPost.y));
}

// rendering

export function render(context: CanvasRenderingContext2D, boardViewVtate: BoardViewState, gameState: GameState) {
    Array2.expand(gameState.board)
        .forEach(tile => {
            context.save();
            context.translate(tile.corrdinate.x * TileSize, tile.corrdinate.y * TileSize);
            renderTile(context, tile.value)
            if (boardViewVtate.type == BoardViewStateType.UnitMoving &&
                boardViewVtate.moveablePositions.some(x => Vector.equal(x, tile.corrdinate))) {
                context.fillStyle = "rgba(255,255,255,0.3)";
                context.fillRect(0, 0, TileSize, TileSize);
            }

            context.restore();
        })
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