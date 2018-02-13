import * as React from "react";
import { assertUnreachable } from "./util";
import {
    PlayerHeight, PlayerWidth, PlayerLeft, CheckAreaWidth, CheckAreaHeight,
    GameState, DefaultState, GameStateTypes, CheckArea,
    frame, click
} from './state';

async function PlayerImgs() {
    return Promise.all(
        [
            "0.png",
            "1.png",
            "2.png",
            "3.png"
        ].map(n => {
            const img = new Image();
            const promise = new Promise<HTMLImageElement>((resolve, reject) => {
                img.onload = _ => resolve(img);
                img.onerror = reject;
            });
            img.src = `./flappy/${n}`;
            return promise;
        })
    );
}

export class Main extends React.Component<{ id: string }>{
    render() {
        return (
            <div className="container-fluid text-center">
                <h1>Flapping</h1>
                <div className="row">
                    <canvas
                        id={this.props.id}
                        className="col-md-12 col-lg-10 offset-lg-1 col-xl-8 offset-xl-2"
                        onClick={e => this.gameState = click(this.gameState)}
                    />
                </div>
                <button
                    type="button"
                    className="btn btn-outline-dark mt-1 mb-1"
                    onClick={_ => this.gameState = DefaultState}>New Game</button>
            </div >)
    }

    async componentDidMount() {
        const playerImgs = await PlayerImgs();
        const canvas = document.getElementById(this.props.id) as HTMLCanvasElement;
        canvas.onselectstart = _ => false;
        const context = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.renderContext = context;
        window.onresize = _ => resizeCanves(context);
        resizeCanves(context);

        const onFrame = (currentMS: number, lastMS: number) => {
            this.gameState = frame(currentMS - lastMS, this.gameState);

            renderState(playerImgs, this.renderContext as CanvasRenderingContext2D, this.gameState);
            requestAnimationFrame(nextMS => onFrame(nextMS, currentMS));
        };

        const startTime = window.performance.now();
        requestAnimationFrame(nextMS => onFrame(nextMS, startTime));
    }

    renderContext: CanvasRenderingContext2D | null = null;
    gameState = DefaultState;


}

function resizeCanves(context: CanvasRenderingContext2D) {
    context.canvas.width = context.canvas.clientWidth;
    context.canvas.height = context.canvas.clientWidth / 16 * 9;
    context.canvas.style.height = `${context.canvas.height}px`;
    const scale = context.canvas.clientWidth / 1600;
    context.setTransform(scale, 0, 0, scale, 0, 0);
}

function renderState(playerImgs: HTMLImageElement[], context: CanvasRenderingContext2D, state: GameState) {
    context.clearRect(0, 0, 1600, 900);

    switch (state.type) {
        case GameStateTypes.ClickToStart:
            context.fillStyle = "green";
            context.font = "80px Arial";
            context.fillText("Click To Start", 520, 400);
            return;
        case GameStateTypes.Flapping:
            state.checkAreas.forEach(a => renderCheckArea(context, a));
            renderPlayer(playerImgs, context, state.top);
            renderScore(context, state.score);
            return;
        case GameStateTypes.Oops:
            state.checkAreas.forEach(a => renderCheckArea(context, a));
            renderPlayer(playerImgs, context, state.top);
            context.fillStyle = "green";
            context.font = "80px Arial";
            context.fillText("Oops", 640, 400);
            context.fillText(`Your Score: ${state.score}`, 500, 500);
            return;
    }
    assertUnreachable(state);
}

function renderPlayer(playerImgs: HTMLImageElement[], context: CanvasRenderingContext2D, top: number) {
    const img = playerImgs[Math.floor((window.performance.now() / PlayerLeft) % playerImgs.length)];
    context.drawImage(img, 100, top, PlayerWidth * 0.5, PlayerHeight);
    context.save();
    context.scale(-1, 1);
    context.drawImage(img, -125, top, PlayerWidth * -0.5, PlayerHeight);
    context.restore();
}

function renderCheckArea(context: CanvasRenderingContext2D, area: CheckArea) {
    context.fillStyle = "black";
    context.fillRect(area.left, 0, CheckAreaWidth, area.top);
    context.fillRect(area.left, area.top + CheckAreaHeight, CheckAreaWidth, 1600 - area.top - CheckAreaHeight);
}

function renderScore(context: CanvasRenderingContext2D, score: number) {
    context.fillStyle = "green";
    context.font = "40px Arial";
    context.fillText(score.toString(), 60, 60);
}