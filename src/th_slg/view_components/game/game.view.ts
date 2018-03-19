import { Game } from "../../game";
import { BoardFrameView, InitialBoardFrame } from '../board_frame/boardFrame.view';

export interface GameView {
    game: Game
    boardFrame: BoardFrameView
}

export function InitialView(game: Game): GameView {
    return {
        game,
        boardFrame: InitialBoardFrame
    }
}