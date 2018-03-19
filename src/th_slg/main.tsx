import * as React from "react";

import { Game, InitialState as InitialGameState } from './game';
import { GameView, InitialView } from './view_components/game/game.view';
import { render as renderGame } from './view_components/game/game.render'
import { handle as HandleEvent } from './eventPipline';
import * as Event from './events';
import { scaleCanvas, transform } from "../util";
import Vector from "../flappy/linear/vector";

export class Main extends React.Component<{ id: string }>{
    render() {
        return <canvas
            id={this.props.id}
            className="col-md-12 col-xl-10 offset-xl-1 p-0"
            onWheel={e => {
                e.preventDefault();
                this.view = HandleEvent(this.view, Event.Scale(this.mousePosition(e), e.deltaY));
            }}
            onMouseDown={e => {
                e.preventDefault();
                this.view = HandleEvent(this.view, Event.DragStart(this.mousePosition(e)));
            }}
            onMouseMove={e => {
                e.preventDefault();
                this.view = HandleEvent(this.view, Event.Move(this.mousePosition(e)));
            }}
            onMouseUp={e => {
                e.preventDefault();
                this.view = HandleEvent(this.view, Event.DragEnd(this.mousePosition(e)));
            }}
            onClick={e => {
                e.preventDefault();
                this.view = HandleEvent(this.view, Event.Click(this.mousePosition(e)));
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

            renderGame(context, this.view);
            requestAnimationFrame(nextMS => onFrame(nextMS, currentMS));
        };

        const startTime = window.performance.now();
        requestAnimationFrame(nextMS => onFrame(nextMS, startTime));

    }

    mousePosition(e: React.MouseEvent<HTMLCanvasElement>): Vector {
        const rect = this.canvas!.getBoundingClientRect();

        return transform(this.scale, new Vector(rect.left, rect.top), new Vector(e.clientX, e.clientY));
    }

    view: GameView = InitialView(InitialGameState);
    scale: number = 0;
    canvas: HTMLCanvasElement | null = null;
}