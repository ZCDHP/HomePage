import * as React from "react";
import { gameStart, forEach, GameState, Cell, move, MoveDirections } from "./state";
import { ViewState, render, init as CreateViewState } from './viewState'
import { scaleCanvas } from "../util";
import Vector from "../flappy/linear/vector";

export class Game extends React.Component<{ id: string }, { score: number, scoreAddition?: number }>{
    constructor(prop: { id: string }) {
        super(prop);
        this.state = { score: 0 };
    }

    render() {
        return (
            <div className="container-fluid text-center my-5">
                <style>
                    {` 
                    @keyframes move-up {
                        0% {
                          top: 25px;
                          opacity: 1; }
                      
                        100% {
                          top: -50px;
                          opacity: 0; } 
                    }
                    
                    .score-addition{
                        position: absolute;
                        font-size: 25px;
                        line-height: 25px;
                        font-weight: bold;
                        z-index: 100;
                        color: rgba(119, 110, 101, 0.9);
                        animation: move-up 600ms ease-in;
                        animation-fill-mode: both;
                    }`}
                </style>
                <div className="row">
                    <div className="container-fluid d-flex align-items-end flex-row-reverse col-xs-12 col-sm-8 offset-sm-2 col-md-6 offset-md-3">
                        <div className="px-3"
                            style={{ backgroundColor: "rgb(187, 173, 160)", borderRadius: "3px", fontWeight: 700, fontFamily: '"Clear Sans", "Helvetica Neue", Arial, sans-serif' }}>
                            {this.state.scoreAddition &&
                                <div key={this.state.score} className="score-addition text-center">
                                    <p>+{this.state.scoreAddition}</p>
                                </div>}
                            <p className="mt-1 mb-0" style={{ fontSize: "0.9em", color: "rgb(238, 228, 218)" }}>SCORE</p>
                            <p className="my-0" style={{ fontSize: "1.5em", color: "rgb(255, 255, 255)" }}>
                                {this.state.score}
                            </p>
                        </div>
                        <div className="px-3" >
                            <button type="button" className="btn btn-light"
                                style={{ backgroundColor: "rgb(143, 122, 102)", color: "rgb(249, 246, 242)", borderRadius: "3px", fontWeight: 700, fontFamily: '"Clear Sans", "Helvetica Neue", Arial, sans-serif' }}
                                onClick={() => {
                                    this.setState({ score: 0 });
                                    this.viewState = CreateViewState(gameStart());
                                }} >
                                New Game
                            </button>
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
                            this.setState(oldState => {
                                return {
                                    score: gameState.score,
                                    scoreAddition: gameState.score == oldState.score ? undefined : gameState.score - oldState.score
                                };
                            });
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

    /*
    viewState = CreateViewState(
        {
            cells: [
                [1024, 1024, 8, 16],
                [32, 64, 128, 256],
                [512, 1024, 2, 4],
                [8, 16, 32, null]
            ],
            score: 0,
            type: "Gaming"
        }
    )*/
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
