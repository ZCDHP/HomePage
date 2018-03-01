import * as React from "react";
import { gameStart, GameState, move, MoveDirections, Cell } from "./state";
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
            <div className="_2048 container-fluid row text-center my-5">
                <div className="col-xs-12 col-sm-8 offset-sm-2 col-md-6 offset-md-3">

                    <div className="above-game container-fluid d-flex align-items-end flex-row-reverse">
                        <div className="score-container px-3">
                            {this.state.scoreAddition &&
                                <div key={this.state.score} className="score-addition text-center">
                                    <p>+{this.state.scoreAddition}</p>
                                </div>}
                            <p className="score-label mt-1 mb-0">SCORE</p>
                            <p className="score-value my-0">{this.state.score}</p>
                        </div>
                        <button type="button" className="new-game btn btn-light mx-3"
                            onClick={() => {
                                this.setState({ score: 0 });
                                this.viewState = CreateViewState(gameStart());
                            }} >
                            New Game
                        </button>
                    </div>

                    <canvas
                        id={this.props.id}
                        className="game-2048 my-3 w-100"
                        onMouseDown={ev => {
                            ev.preventDefault();
                            this.startDrag(new Vector(ev.clientX, ev.clientY));
                        }}
                        onTouchStart={ev => {
                            ev.preventDefault();
                            this.startDrag(new Vector(ev.touches[0].clientX, ev.touches[0].clientY));
                        }}
                        onMouseUp={ev => {
                            ev.preventDefault();
                            this.endDrag(new Vector(ev.clientX, ev.clientY));
                        }}
                        onTouchEnd={ev => {
                            ev.preventDefault();
                            this.endDrag(new Vector(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY));
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

        document.addEventListener("keydown", this.onKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyDown);
    }

    startDrag = (point: Vector) => this.drag = point;
    endDrag = (point: Vector) => {
        if (this.drag == null)
            return;

        const offset = Vector.subtracion(point, this.drag);
        if (Math.max(Math.abs(offset.x), Math.abs(offset.y)) < 50) {
            this.drag = null;
            return;
        }

        this.moveDirection(drageOffset2Direction(offset));
        this.drag = null;
    }

    onKeyDown = (ev: KeyboardEvent) => {
        if (ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey)
            return;
        const dir = key2Direction(ev.key);
        if (dir) {
            ev.preventDefault();
            this.moveDirection(dir);
        }
    }

    moveDirection = (dir: MoveDirections) => {
        const newState = move(this.viewState.gameState, dir);
        if (newState.moveNumber == this.viewState.gameState.moveNumber)
            return;
        this.viewState = {
            gameState: newState,
            startTime: window.performance.now()
        };
        this.setState(oldState => {
            return {
                score: newState.score,
                scoreAddition: newState.score == oldState.score ? undefined : newState.score - oldState.score
            };
        });
    }

    drag: Vector | null = null;
    viewState = CreateViewState(gameStart());
    /*
    viewState = CreateViewState(
        {
            board: [
                [Cell(1024), Cell(1024), Cell(1024), Cell(16)],
                [Cell(32), Cell(64), Cell(128), Cell(256)],
                [Cell(512), Cell(1024), Cell(2), Cell(4)],
                [Cell(8), Cell(16), Cell(32), null]
            ],
            score: 0,
            type: "Gaming",
            moveNumber: 0
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

function key2Direction(key: string): MoveDirections | null {
    if (key == "ArrowUp" || key == "w")
        return MoveDirections.Up;
    else if (key == "ArrowDown" || key == "s")
        return MoveDirections.Down;
    else if (key == "ArrowLeft" || key == "a")
        return MoveDirections.Left;
    else if (key == "ArrowRight" || key == "d")
        return MoveDirections.Right;

    return null;
}

/*
function Cell(value: number | null): Cell | null {
    if (value)
        return { value, source: { type: "Generate" } }
    else
        return null;

}*/
