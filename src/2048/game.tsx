import * as React from "react";
import { gameStart, forEach, GameState, Cell, move, MoveDirections } from "./state";
import { ViewState, render, init as CreateViewState } from './viewState'
import { scaleCanvas } from "../util";
import Vector from "../flappy/linear/vector";

export class Game extends React.Component<{ id: string }, { score: number }>{
    render() {
        return (
            <div className="container-fluid text-center my-5">
                <div className="row">
                    <div className="container-fluid d-flex flex-row-reverse col-xs-12 col-sm-8 offset-sm-2 col-md-6 offset-md-3">
                        <div className="px-3" style={{ backgroundColor: "rgb(187, 173, 160)", borderRadius: "3px", fontWeight: 700, fontFamily: '"Clear Sans", "Helvetica Neue", Arial, sans-serif' }}>
                            <p className="mt-1 mb-0" style={{ fontSize: "0.9em", color: "rgb(238, 228, 218)" }}>SCORE</p>
                            <p className="my-0" style={{ fontSize: "1.5em", color: "rgb(255, 255, 255)" }}>
                                {this.state.score}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="row my-3">
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
                            this.setState({ score: gameState.score });
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

    state = { score: 0 }
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
