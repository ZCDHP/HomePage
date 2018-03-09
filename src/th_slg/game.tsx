import * as React from "react";

import { State as GameState, InitialState as InitialGameState } from './state';
import { ViewState, render as renderState } from './viewState';
import { scaleCanvas } from "../util";


export class Game extends React.Component<{ id: string }>{
    render() {
        return <canvas
            id={this.props.id}
            className="col-md-12 col-xl-10 offset-xl-1"
        />
    }

    componentDidMount() {
        const canvas = document.getElementById(this.props.id) as HTMLCanvasElement;
        canvas.onselectstart = _ => false;
        const context = canvas.getContext("2d") as CanvasRenderingContext2D;
        window.onresize = _ => scaleCanvas(context, 1600, 900);
        scaleCanvas(context, 1600, 900);


        const onFrame = (currentMS: number, lastMS: number) => {
            //this.gameState = frame(currentMS - lastMS, this.gameState);

            renderState(context, this.viewState);
            requestAnimationFrame(nextMS => onFrame(nextMS, currentMS));
        };

        const startTime = window.performance.now();
        requestAnimationFrame(nextMS => onFrame(nextMS, startTime));

    }

    viewState: ViewState = { gameState: InitialGameState }
}