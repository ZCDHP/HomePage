import { strEnum, assertUnreachable, Array2 } from "../util"
import Vector from "../flappy/linear/vector";
import * as MapFragment from './mapFragment';

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
    MovementType: MovementType
}

export const MovementType = strEnum(["foot", "fly"]);
export type MovementType = keyof typeof MovementType;

const Tile_Pain = Tile(TerrainType.Plain);
const Tile_Mountain = Tile(TerrainType.Mountain);
const Tile_Sea = Tile(TerrainType.Sea);

export const InitialState: State = {
    board: [
        [Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea, Tile_Sea],
        [Tile_Sea, { terrain: TerrainType.Plain, unit: { name: "UU", movement: 3, MovementType: MovementType.foot } }, Tile_Pain, Tile_Pain, Tile_Pain, Tile_Sea],
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

const dirs = [new Vector(0, 1), new Vector(0, -1), new Vector(1, 0), new Vector(-1, 0)];
export function getMoveablePositions(state: State, unitAt: Vector): Vector[] {
    const map = MapFragment.create<number>();
    const unit = state.board[unitAt.x][unitAt.y].unit as Unit;

    function from(movePoint: number, position: Vector) {
        dirs.map(x => Vector.add(x, position))
            .forEach(p => {
                if (p.x < 0 || p.y < 0 || p.x >= state.board.length || p.y >= state.board[0].length)
                    return;
                const onMap = MapFragment.get(p.x, p.y, map);
                const restMovePoint = movePoint - getMovementCost(unit.MovementType, state.board[p.x][p.y].terrain);
                if (restMovePoint >= 0 &&
                    (!onMap || onMap < restMovePoint)) {
                    MapFragment.set(p.x, p.y, map, restMovePoint);
                    from(restMovePoint, p);
                }
            });
    }

    MapFragment.set(unitAt.x, unitAt.y, map, unit.movement);

    from(unit.movement, unitAt);
    return MapFragment.map((x, y, _) => new Vector(x, y), map);
}

