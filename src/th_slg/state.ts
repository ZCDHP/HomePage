import { strEnum, assertUnreachable } from "../util"

function Tile(type: TileType): Tile { return { type }; }

export type State = {
    board: Tile[][]
}

export const TileType = strEnum(["Plain", "Mountain", "Sea"]);
export type TileType = keyof typeof TileType;
export type Tile = {
    type: TileType
}

const Tile_Pain = Tile(TileType.Plain);
const Tile_Mountain = Tile(TileType.Mountain);
const Tile_Sea = Tile(TileType.Sea);

export const InitialState: State = {
    board: [
        [Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea],
        [Tile_Sea, Tile_Pain, Tile_Pain, Tile_Pain, Tile_Pain, Tile_Sea],
        [Tile_Sea, Tile_Pain, Tile_Mountain, Tile_Mountain, Tile_Pain, Tile_Sea],
        [Tile_Sea, Tile_Pain, Tile_Pain, Tile_Pain, Tile_Pain, Tile_Sea],
        [Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea],
    ]
}