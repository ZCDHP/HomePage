import { GameView } from './game.view';
import * as Action from "../../actions";
import immer from 'immer';
import { handle as BoardFrameHandle } from '../board_frame/boardFrame.action';

export function handle(view: GameView, action: Action.Action): GameView {
    return immer(view, draft => {
        draft.boardFrame = BoardFrameHandle(view.boardFrame, view.game, action);
    });
}