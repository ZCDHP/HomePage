import * as React from "react";
import { gameStart, forEach, GameState, Cell, move, MoveDirections } from "./state";
import { ViewState, render, init as CreateViewState } from './viewState'
import { scaleCanvas } from "../util";
import Vector from "../flappy/linear/vector";

export class Game extends React.Component<{ id: string }>{
    render() {
        return (
            <div className="container-fluid text-center my-5">
                <div className="row">
                    <canvas
                        id={this.props.id}
                        className="col-xs-12 col-sm-8 offset-sm-2 col-md-6 offset-md-3"
                        onMouseDown={ev => {
                            ev.preventDefault();
                            this.drag = {
                                x: ev.clientX,
                                y: ev.clientY
                            };
                        }}
                        onMouseUp={ev => {
                            ev.preventDefault();
                            if (this.drag == null)
                                return;

                            const offset = Vector.subtracion({
                                x: ev.clientX,
                                y: ev.clientY
                            }, this.drag);
                            if (Math.max(Math.abs(offset.x), Math.abs(offset.y)) < 50)
                                return;
                            const currentTime = window.performance.now();
                            const { gameState, moved, merged, generated } = move(this.viewState.gameState, drageOffset2Direction(offset));
                            this.viewState = {
                                gameState,
                                movings: moved.toArray(),
                                mergings: merged.toArray(),
                                generatings: generated.toArray(),
                                startTime: window.performance.now()
                            };
                            this.drag = null;
                        }}
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
            render(context, this.viewState);
            requestAnimationFrame(nextMS => onFrame(nextMS, currentMS));
        };

        const startTime = window.performance.now();
        requestAnimationFrame(nextMS => onFrame(nextMS, startTime));
    }

    drag: Vector | null = null;

    viewState = CreateViewState(gameStart());
}

function drageOffset2Direction(offset: Vector) {
    if (Math.abs(offset.x) > Math.abs(offset.y))
        if (offset.x >= 0)
            return MoveDirections.Right;
        else
            return MoveDirections.Left;
    else
        if (offset.y >= 0)
            return MoveDirections.Down;
        else
            return MoveDirections.Up;
}
