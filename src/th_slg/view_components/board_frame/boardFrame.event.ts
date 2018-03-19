import { BoardFrameView as View } from './boardFrame.view';
import { handle as BoardHandle } from '../board/board.event';
import * as Action from "../../actions";
import * as Event from '../../events';
import { Game } from '../../game'
import { assertUnreachable, transform } from '../../../util';
import Vector from '../../../flappy/linear/vector';
import { TileSize } from '../board/board.view';

export function handle(view: View, game: Game, event: Event.Event): Action.Action | null {
    switch (event.type) {
        case Event.EventType.Scale:
            return Action.BoardScale(event.data.delta);
        case Event.EventType.DragStart:
            return Action.BoardDragStart(event.data);
        case Event.EventType.DragEnd:
            return Action.BoardDragEnd;
        case Event.EventType.Move:
            return move(view, game, event);
        case Event.EventType.Click:
            return click(view, game, event);
    }
    assertUnreachable(event);
}

function move(view: View, game: Game, event: Event.Move): Action.Action | null {
    if (view.dragging) {
        const drag = view.dragging;
        return Action.BoardDragMove(
            Vector.add(
                drag.startBoardOffset,
                Vector.subtracion(
                    event.data,
                    drag.startPosition)))
    }

    const boardPos = transform(view.boardScale, view.boardOffset, event.data)
    return onBoard(game, boardPos) ?
        BoardHandle(view.board, game, Event.Move(boardPos))
        : null;
}

function click(view: View, game: Game, event: Event.Click): Action.Action | null {
    const boardPos = transform(view.boardScale, view.boardOffset, event.data)
    return onBoard(game, boardPos) ?
        BoardHandle(view.board, game, Event.Click(boardPos))
        : null;
}

function onBoard(game: Game, pos: Vector) {
    const boardSize = getBoardSize(game);
    return pos.x >= 0 && pos.y >= 0 && pos.x <= boardSize.x && pos.y <= boardSize.y
}

function getBoardSize(game: Game) {
    return Vector.scale(
        game.boardSize,
        TileSize);
}