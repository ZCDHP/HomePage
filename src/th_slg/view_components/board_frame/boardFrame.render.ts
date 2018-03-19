import { BoardFrameView } from './boardFrame.view'
import { render as renderBoard } from '../board/board.render'
import { Game } from '../../game'

export function render(context: CanvasRenderingContext2D, view: BoardFrameView, game: Game) {
    context.fillStyle = "white";
    context.fillRect(0, 0, 1600, 900);

    context.save();
    context.translate(view.boardOffset.x, view.boardOffset.y);
    context.scale(view.boardScale, view.boardScale);

    renderBoard(context, view.board, game);

    context.restore();
}
