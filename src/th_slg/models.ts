import Vector from "../flappy/linear/vector";

export interface BoardDragState {
    startPosition: Vector
    startBoardOffset: Vector
}
export function BoardDragState(startPosition: Vector, startBoardOffset: Vector): BoardDragState {
    return {
        startPosition,
        startBoardOffset
    }
}