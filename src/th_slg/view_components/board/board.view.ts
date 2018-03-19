import Vector from "../../../flappy/linear/vector";
import { strEnum } from "../../../util";
import { Stack } from "immutable";

export const TileSize = 120;
export const PathSize = TileSize / 8;
export const PathPosition = (TileSize - PathSize) / 2;
export const PathPositionVector = new Vector(PathPosition, PathPosition);
export const SidePathOffest = TileSize - PathSize - PathPosition;
export const Dirs = [new Vector(0, 1), new Vector(0, -1), new Vector(1, 0), new Vector(-1, 0)];

export type BoardView =
    | BoardView_None
    | UnitMoving

export const BoardViewType = strEnum(["None", "UnitMoving"]);
export type BoardViewType = keyof typeof BoardViewType;

export type BoardView_None = { type: typeof BoardViewType.None }
export const BoardView_None: BoardView_None = { type: BoardViewType.None }

export interface UnitMoving {
    type: typeof BoardViewType.UnitMoving
    unitPosition: Vector
    moveablePositions: Vector[]
    path: Stack<Step>
}

export interface Step {
    direction: Vector
    restMovePoint: number
    position: Vector
}