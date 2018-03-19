import Vector from "../flappy/linear/vector";
import { strEnum } from "../util";
import { BoardDragState } from "./models";

export type Action =
    | BoardDragStart
    | BoardScale
    | BoardDragEnd
    | BoardDragMove
    | BoardUnitSelected
    | BoardUnitMoveDestinationSelected
    | BoardUnitMoveCancel;

export const ActionType = strEnum([
    "Board_Scale",
    "Board_Drag_Start",
    "Board_Drag_End",
    "Board_Drag_Move",
    "Board_Unit_Selected",
    "Board_Unit_Move_Destination_Selected",
    "Board_Unit_Move_Cancel"
]);
export type ActionType = keyof typeof ActionType;

function Create<T extends ActionType, D>(type: T, data: D) {
    return {
        type,
        data
    }
}


export interface BoardScale {
    type: typeof ActionType.Board_Scale
    data: number
}
export function BoardScale(position: number): BoardScale {
    return Create(ActionType.Board_Scale, position);
}


export interface BoardDragStart {
    type: typeof ActionType.Board_Drag_Start
    data: Vector
}
export function BoardDragStart(position: Vector): BoardDragStart {
    return Create(ActionType.Board_Drag_Start, position);
}


export interface BoardDragEnd {
    type: typeof ActionType.Board_Drag_End
}
export const BoardDragEnd: BoardDragEnd = Create(ActionType.Board_Drag_End, undefined);


export interface BoardDragMove {
    type: typeof ActionType.Board_Drag_Move
    // new position
    data: Vector
}
export function BoardDragMove(newPosition: Vector): BoardDragMove {
    return Create(ActionType.Board_Drag_Move, newPosition)
}


export interface BoardUnitSelected {
    type: typeof ActionType.Board_Unit_Selected
    // selected unit position
    data: Vector
}
export function BoardUnitSelected(position: Vector): BoardUnitSelected {
    return Create(ActionType.Board_Unit_Selected, position);
}

export interface BoardUnitMoveDestinationSelected {
    type: typeof ActionType.Board_Unit_Move_Destination_Selected
    // Destination
    data: Vector
}
export function BoardUnitMoveDestinationSelected(destination: Vector): BoardUnitMoveDestinationSelected {
    return Create(ActionType.Board_Unit_Move_Destination_Selected, destination);
}

export interface BoardUnitMoveCancel {
    type: typeof ActionType.Board_Unit_Move_Cancel
}
export const BoardUnitMoveCancel: BoardUnitMoveCancel = Create(ActionType.Board_Unit_Move_Cancel, undefined);