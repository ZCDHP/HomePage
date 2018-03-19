import immer from 'immer';
import { Game } from '../../game'
import { BoardFrameView as View } from './boardFrame.view';
import { handle as BoardHandle } from '../board/board.action';
import * as Action from '../../actions';
import { assertUnreachable, transform } from '../../../util';

export function handle(view: View, game: Game, action: Action.Action): View {
    switch (action.type) {
        case Action.ActionType.Board_Scale:
            return BoardScale(view, game, action);
        case Action.ActionType.Board_Drag_Start:
            return BoardDragStart(view, game, action);
        case Action.ActionType.Board_Drag_End:
            return BoardDragEnd(view, game, action);
        case Action.ActionType.Board_Drag_Move:
            return BoardDragMove(view, game, action);
        case Action.ActionType.Board_Unit_Selected:
        case Action.ActionType.Board_Unit_Move_Destination_Selected:
        case Action.ActionType.Board_Unit_Move_Cancel:
            return UpdateBoard(view, game, action);
    }

    assertUnreachable(action);
}

function BoardScale(view: View, game: Game, action: Action.BoardScale): View {
    return immer(view, draft => {
        view.boardScale = Math.max(0.1, view.boardScale - action.data / 1000);
    });
}

function BoardDragStart(view: View, game: Game, action: Action.BoardDragStart): View {
    return immer(view, draft => {
        draft.dragging = {
            startBoardOffset: draft.boardOffset,
            startPosition: action.data
        }
    });
}

function BoardDragEnd(view: View, game: Game, action: Action.BoardDragEnd): View {
    return immer(view, draft => {
        draft.dragging = undefined;
    });
}

function BoardDragMove(view: View, game: Game, action: Action.BoardDragMove): View {
    return immer(view, draft => {
        draft.boardOffset = action.data;
    })
}

function UpdateBoard(view: View, game: Game, action: Action.Action): View {
    return immer(view, draft => {
        draft.board = BoardHandle(draft.board, game, action);
    });
}
