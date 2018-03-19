import Vector from "../../../flappy/linear/vector";
import { BoardView, BoardView_None } from '../board/board.view';
import { BoardDragState } from "../../models";

export interface BoardFrameView {
    boardScale: number
    boardOffset: Vector
    board: BoardView
    dragging?: BoardDragState
}

export const InitialBoardFrame: BoardFrameView = {
    boardScale: 1,
    boardOffset: new Vector(0, 0),
    board: BoardView_None
}