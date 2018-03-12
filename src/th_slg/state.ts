import { strEnum, assertUnreachable } from "../util"

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