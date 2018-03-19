import { GameView } from './view_components/game/game.view';
import { handle as HandleEvent } from './view_components/game/game.event';
import { handle as HandleAction } from './view_components/game/game.action';
import { Event } from './events';
import * as Action from "./actions";

export function handle(view: GameView, event: Event): GameView {
    const action = HandleEvent(view, event);
    return action ?
        HandleAction(view, action)
        : view;
}