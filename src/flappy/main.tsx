import * as React from "react";
import { assertUnreachable } from "./util";
import { GameState, DefaultState, GameStateTypes, frame, click } from './state';

const imgs = [
    "0.png",
    "1.png",
    "2.png",
    "3.png"
].map(n => {
    const img = new Image();
    img.src = `./flappy/${n}`;
    return img;
});

export class Main extends React.Component<{ id: string }>{
    render() {
        return <canvas id={this.props.id} onClick={() => this.gameState = click(this.gameState)}></canvas>
    }

    async componentDidMount() {
        await Promise.all(imgs.map(i => new Promise((resolve, _) => i.onload = resolve)));
        const context = (document.getElementById(this.props.id) as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
        this.renderContext = context;
        context.canvas.height = context.canvas.clientHeight;
        context.canvas.width = context.canvas.clientWidth;
        context.scale(context.canvas.width / 1600, context.canvas.height / 900)

        const onFrame = (currentMS: number, lastMS: number) => {
            this.gameState = frame(currentMS - lastMS, this.gameState);

            renderState(this.renderContext as CanvasRenderingContext2D, this.gameState);
            requestAnimationFrame(nextMS => onFrame(nextMS, currentMS));
        };

        const startTime = window.performance.now();
        requestAnimationFrame(nextMS => onFrame(nextMS, startTime));
    }

    renderContext: CanvasRenderingContext2D | null = null
    gameState = DefaultState
}

function renderState(context: CanvasRenderingContext2D, state: GameState) {
    context.clearRect(0, 0, 1600, 900);

    switch (state.type) {
        case GameStateTypes.ClickToStart:
            context.font = "80px Arial";
            context.fillText("Click To Start", 520, 400);
            return;
        case GameStateTypes.Flapping:
            const img = imgs[Math.floor((state.totalMS / 100) % imgs.length)];
            context.drawImage(img, 100, state.top, 25, 50);
            context.save();
            context.scale(-1, 1);
            context.drawImage(img, -125, state.top, -25, 50);
            context.restore();
            return;
    }

    assertUnreachable(state);
}