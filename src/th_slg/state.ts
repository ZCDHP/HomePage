import { strEnum, assertUnreachable, Array2 } from "../util"
import Vector from "../flappy/linear/vector";

function Tile(terrain: TerrainType, unit?: Unit): Tile { return { terrain, unit }; }

export type State = {
    board: Tile[][]
}

export const TerrainType = strEnum(["Plain", "Mountain", "Sea"]);
export type TerrainType = keyof typeof TerrainType;
export interface Tile {
    terrain: TerrainType
    unit?: Unit
}
export interface Unit {
    name: string,
    movement: number
}

const Tile_Pain = Tile(TerrainType.Plain);
const Tile_Mountain = Tile(TerrainType.Mountain);
const Tile_Sea = Tile(TerrainType.Sea);

export const InitialState: State = {
    board: [
        [Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea],
        [Tile_Sea, { terrain: TerrainType.Plain, unit: { name: "UU", movement: 3 } }, Tile_Pain, Tile_Pain, Tile_Pain, Tile_Sea],
        [Tile_Sea, Tile_Pain, Tile_Mountain, Tile_Mountain, Tile_Pain, Tile_Sea],
        [Tile_Sea, Tile_Pain, Tile_Pain, Tile_Pain, Tile_Pain, Tile_Sea],
        [Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea],
    ]
}

export function getMoveablePositions(state: State, unitAt: Vector): Vector[] {
    const unit = state.board[unitAt.x][unitAt.y].unit as Unit;
    return Array2.expand(state.board)
        .map(x => x.corrdinate)
        .filter(x => {
            const offset = Vector.subtracion(unitAt, x);
            const tileCount = Math.abs(offset.x) + Math.abs(offset.y);
            return tileCount <= unit.movement;
        });
}