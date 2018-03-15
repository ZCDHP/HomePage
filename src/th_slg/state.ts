import { strEnum, assertUnreachable, Array2 } from "../util"
import Vector from "../flappy/linear/vector";
import Map2d from "./map2d";

function Tile(terrain: TerrainType, unit?: Unit): Tile { return { terrain, unit }; }

export type State = {
    board: Map2d<Tile>
    boardSize: Vector
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

const Tile_Pain = (unit?: Unit) => Tile(TerrainType.Plain, unit);
const Tile_Mountain = (unit?: Unit) => Tile(TerrainType.Mountain, unit);
const Tile_Sea = (unit?: Unit) => Tile(TerrainType.Sea, unit);

export const InitialState: State = {
    board: new Map2d([
        [Tile_Sea(), Tile_Sea(), Tile_Sea(), Tile_Sea(), Tile_Sea(), Tile_Sea()],
        [Tile_Sea(), Tile_Pain({ name: "UU", movement: 4, movementType: MovementType.foot }), Tile_Pain(), Tile_Pain(), Tile_Pain(), Tile_Sea()],
        [Tile_Sea(), Tile_Pain(), Tile_Mountain(), Tile_Mountain(), Tile_Pain(), Tile_Sea()],
        [Tile_Sea(), Tile_Pain(), Tile_Pain(), Tile_Pain(), Tile_Pain(), Tile_Sea()],
        [Tile_Sea(), Tile_Sea(), Tile_Sea(), Tile_Sea(), Tile_Sea(), Tile_Sea()],
    ]),
    boardSize: new Vector(5, 6)
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
