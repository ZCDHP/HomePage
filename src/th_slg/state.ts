import { strEnum, assertUnreachable, Array2 } from "../util"
import Vector from "../flappy/linear/vector";

function Tile(terrain: TerrainType, unit?: Unit): Tile { return { terrain, unit }; }

export type State = {
    board: Tile[][]
}

export interface Tile {
    terrain: TerrainType
    unit?: Unit
}

export const TerrainType = strEnum(["Plain", "Mountain", "Sea"]);
export type TerrainType = keyof typeof TerrainType;

export interface Unit {
    name: string,
    movement: number,
    movementType: MovementType
}

export const MovementType = strEnum(["foot", "fly"]);
export type MovementType = keyof typeof MovementType;

const Tile_Pain = Tile(TerrainType.Plain);
const Tile_Mountain = Tile(TerrainType.Mountain);
const Tile_Sea = Tile(TerrainType.Sea);

export const InitialState: State = {
    board: [
        [Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea],
        [Tile_Sea, { terrain: TerrainType.Plain, unit: { name: "UU", movement: 4, movementType: MovementType.foot } }, Tile_Pain, Tile_Pain, Tile_Pain, Tile_Sea],
        [Tile_Sea, Tile_Pain, Tile_Mountain, Tile_Mountain, Tile_Pain, Tile_Sea],
        [Tile_Sea, Tile_Pain, Tile_Pain, Tile_Pain, Tile_Pain, Tile_Sea],
        [Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea],
    ]
}

export function getMovementCost(movementType: MovementType, terrain: TerrainType) {
    switch (movementType) {
        case MovementType.fly:
            return 1;
        case MovementType.foot:
            return footMovementCost(terrain);
    }
    assertUnreachable(movementType);
}

function footMovementCost(terrain: TerrainType) {
    switch (terrain) {
        case TerrainType.Sea:
            return Number.POSITIVE_INFINITY;
        case TerrainType.Plain:
            return 1;
        case TerrainType.Mountain:
            return 2;
    }
    assertUnreachable(terrain);
}
