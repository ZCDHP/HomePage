import * as React from "react";

import { State as GameState, InitialState as InitialGameState } from './state';
import * as View from './viewState';
import { scaleCanvas } from "../util";
import Vector from "../flappy/linear/vector";


export class Game extends React.Component<{ id: string }>{
    render() {
        return <canvas
            id={this.props.id}
            className="col-md-12 col-xl-10 offset-xl-1 p-0"
            onWheel={e => {
                this.viewState = View.scale(this.viewState, this.mousePosition(e), e.deltaY);
                e.preventDefault();
            }}
            onMouseDown={e => {
                e.preventDefault();
                this.viewState = View.dragStart(this.viewState, this.mousePosition(e));
            }}
            onMouseMove={e => {
                e.preventDefault();
                this.viewState = View.move(this.viewState, this.mousePosition(e));
            }}
            onMouseUp={e => {
                e.preventDefault();
                this.viewState = View.drop(this.viewState, this.mousePosition(e));
            }}
            onClick={e => {
                e.preventDefault();
                this.viewState = View.click(this.viewState, this.mousePosition(e));
            }}
        />
    }

    componentDidMount() {
        this.canvas = document.getElementById(this.props.id) as HTMLCanvasElement;
        this.canvas.onselectstart = _ => false;
        const context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        window.onresize = _ => this.scale = scaleCanvas(context, 1600, 900);
        this.scale = scaleCanvas(context, 1600, 900);

        const onFrame = (currentMS: number, lastMS: number) => {
            //this.gameState = frame(currentMS - lastMS, this.gameState);

            View.render(context, this.viewState);
            requestAnimationFrame(nextMS => onFrame(nextMS, currentMS));
        };

        const startTime = window.performance.now();
        requestAnimationFrame(nextMS => onFrame(nextMS, startTime));

    }

    mousePosition(e: React.MouseEvent<HTMLCanvasElement>): Vector {
        const rect = this.canvas!.getBoundingClientRect();
        return Vector.scale(
            Vector.subtracion(
                new Vector(e.clientX, e.clientY),
                new Vector(rect.left, rect.top)),
            1 / this.scale
        );
    }

    viewState: View.ViewState = {
        gameState: InitialGameState,
        boardScale: 1,
        boardOffset: new Vector(0, 0),
        boardView: { type: "None" }
    }
    scale: number = 0;
    canvas: HTMLCanvasElement | null = null;
}