import { GameView as View } from './game.view';
import { Game } from '../../game';
import { render as renderBoardFrame } from '../board_frame/boardFrame.render';

export function render(context: CanvasRenderingContext2D, view: View) {
    context.clearRect(0, 0, 1600, 900);
    renderBoardFrame(context, view.boardFrame, view.game);
}