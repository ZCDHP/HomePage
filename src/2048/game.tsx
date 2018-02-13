import * as React from "react";
import { gameStart, forEach, GameState, Cell } from "./state";
import { scaleCanvas } from "../util";

const Gap = 20;
const CellWidth = (900 - Gap * 5) / 4;

export class Game extends React.Component<{ id: string }>{
    render() {
        return (
            <div className="container-fluid text-center my-5">
                <div className="row">
                    <canvas
                        id={this.props.id}
                        className="col-xs-12 col-sm-8 offset-sm-2 col-md-6 offset-md-3"
                    />
                </div>
            </div >);
    }

    componentDidMount() {
        const canvas = document.getElementById(this.props.id) as HTMLCanvasElement;
        canvas.onselectstart = _ => false;
        const context = canvas.getContext("2d") as CanvasRenderingContext2D;
        window.onresize = _ => scaleCanvas(context, 900, 900);
        scaleCanvas(context, 900, 900);

        const onFrame = (currentMS: number, lastMS: number) => {
            //this.gameState = frame(currentMS - lastMS, this.gameState);

            renderState(context, this.gameState);
            requestAnimationFrame(nextMS => onFrame(nextMS, currentMS));
        };

        const startTime = window.performance.now();
        requestAnimationFrame(nextMS => onFrame(nextMS, startTime));
    }

    gameState = {
        cells: [
            [2, 4, 8, 16],
            [32, 64, 128, 256],
            [512, 1024, 2048, null],
            [null, null, null, null]
        ]
    } //= gameStart();
}

function renderState(context: CanvasRenderingContext2D, state: GameState) {
    context.clearRect(0, 0, 900, 900);
    context.fillStyle = "rgb(187, 173, 160)";
    context.fillRect(0, 0, 900, 900);
    forEach(state.cells, (x, y, cell) => renderCell(context, x, y, cell));
}

function renderCell(context: CanvasRenderingContext2D, x: number, y: number, cell: Cell) {
    const left = x * (Gap + CellWidth) + Gap;
    const top = y * (Gap + CellWidth) + Gap;

    context.fillStyle = cellBackgroundColor(cell);
    context.fillRect(left, top, CellWidth, CellWidth);

    if (cell == null)
        return;
    if (cell <= 4)
        context.fillStyle = "rgb(119, 110, 101)";
    else
        context.fillStyle = "rgb(249, 246, 242)";
    context.font = '40pt Calibri';
    context.textAlign = "center"
    context.textBaseline = "middle";
    context.fillText(
        cell.toString(),
        left + CellWidth / 2,
        top + CellWidth / 2);
}

function cellBackgroundColor(cell: Cell): string {
    switch (cell) {
        case null: return "rgba(238, 228, 218, 0.35)";
        case 2: return "#eee4da";
        case 4: return "#ede0c8";
        case 8: return "#f2b179";
        case 16: return "#f59563";
        case 32: return "#f67c5f";
        case 64: return "#f65e3b";
        case 128: return "#edcf72";
        case 256: return "#edcc61";
        case 512: return "#edc850";
        case 1024: return "#edc53f";
        case 2048: return "#edc22e";
        default: throw new Error(`Invalid cell :${cell}`);
    }
}