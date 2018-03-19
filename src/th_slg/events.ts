import Vector from "../flappy/linear/vector";
import { strEnum } from "../util";

export type Event =
    | Scale
    | DragStart
    | DragEnd
    | Move
    | Click

export const EventType = strEnum([
    "Scale",
    "DragStart",
    "DragEnd",
    "Move",
    "Click"
]);

export type EventType = keyof typeof EventType;

function Create<T extends EventType, D>(type: T, data: D) {
    return {
        type,
        data
    }
}


export interface Scale {
    type: typeof EventType.Scale
    data: Vector & { delta: number }
}
export function Scale(position: Vector, delta: number): Scale {
    return Create(EventType.Scale, {
        x: position.x,
        y: position.y,
        delta
    });
}


export interface DragStart {
    type: typeof EventType.DragStart
    data: Vector
}
export function DragStart(position: Vector): DragStart {
    return Create(EventType.DragStart, position);
}


export interface DragEnd {
    type: typeof EventType.DragEnd
    data: Vector
}
export function DragEnd(position: Vector): DragEnd {
    return Create(EventType.DragEnd, position);
}


export interface Move {
    type: typeof EventType.Move
    data: Vector
}
export function Move(position: Vector): Move {
    return Create(EventType.Move, position);
}

export interface Click {
    type: typeof EventType.Click
    data: Vector
}
export function Click(position: Vector): Click {
    return Create(EventType.Click, position);
}