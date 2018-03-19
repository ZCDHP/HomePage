import * as View from './game.view';
import * as Action from "../../actions";
import * as Event from '../../events';
import { handle as BoardFrameHandle } from '../board_frame/boardFrame.event';

export function handle(view: View.GameView, event: Event.Event): Action.Action | null {
    return BoardFrameHandle(view.boardFrame, view.game, event);
}
