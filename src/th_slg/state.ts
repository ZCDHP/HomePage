import { strEnum, assertUnreachable, Array2 } from "../util"
import Vector from "../flappy/linear/vector";
import Map2d from "./map2d";
import { List } from "immutable";
import immer from "immer";

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

export function moveUnit(from: Vector, path: List<Vector>, oldState: State): State {
    const unit = oldState.board.get(from)!.unit!;
    return moveUnitStep(from, from, unit.movement, path, oldState);
}

export function moveUnitStep(from: Vector, position: Vector, movement: number, path: List<Vector>, oldState: State): State {
    const unit = oldState.board.get(from)!.unit!;

    if (path.count() == 0)
        return immer(oldState, draft => {
            oldState.board = oldState.board
                .set(from, immer(oldState.board.get(from)!, draft => draft.unit = undefined))
                .set(position, immer(oldState.board.get(position)!, draft => draft.unit = unit));
        });

    const nextPosition = Vector.add(position, path.first());
    const nextMovement = movement - getMovementCost(unit.movementType, oldState.board.get(nextPosition)!.terrain);
    if (nextMovement < 0)
        throw new Error("Not reachable");
    return moveUnitStep(from, nextPosition, nextMovement, path.shift(), oldState);
}
