import { BoardView as View, BoardViewType as ViewType, UnitMoving, TileSize, PathPosition, PathSize, PathPositionVector, SidePathOffest } from "./board.view"
import { Game } from "../../game";
import * as Action from "../../actions";
import * as Event from '../../events';
import Vector from "../../../flappy/linear/vector";

export function handle(view: View, game: Game, event: Event.Event): Action.Action | null {
    switch (event.type) {
        case Event.EventType.Click:
            return click(view, game, event);
        case Event.EventType.Move:
            return move(view, game, event);
        default:
            return null;
    }
}

function click(view: View, game: Game, event: Event.Click): Action.Action | null {
    const selectedCell = getboardCell(event.data);
    const unit = game.board.get(selectedCell)!.unit;

    switch (view.type) {
        case ViewType.None:
            return unit ? Action.BoardUnitSelected(selectedCell) : null;
        case ViewType.UnitMoving:
            return view.moveablePositions.some(x => Vector.equal(x, selectedCell)) ? null : Action.BoardUnitMoveCancel;
    }
}

function move(view: View, game: Game, event: Event.Move): Action.Action | null {
    switch (view.type) {
        case ViewType.None:
            return null;
        case ViewType.UnitMoving:
            return unitMoving(view, game, event);
    }
    const selectedCell = getboardCell(event.data);
    const unit = game.board.get(selectedCell)!.unit;
}

function unitMoving(view: UnitMoving, game: Game, event: Event.Move): Action.Action | null {
    const selectedCell = getboardCell(event.data);
    return view.moveablePositions.some(x => Vector.equal(x, selectedCell)) ?
        Action.BoardUnitMoveDestinationSelected(selectedCell)
        : null;
}

function getboardCell(pos: Vector): Vector {
    const floatBoardPost = Vector.scale(pos, 1 / TileSize);
    return new Vector(Math.trunc(floatBoardPost.x), Math.trunc(floatBoardPost.y));
}
