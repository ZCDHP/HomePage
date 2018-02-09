import * as React from "react";

const defaultState: FlappyState = {
    top: 500
}
const img0 = new Image();
img0.src = "./flappy/0.png";

export class Main extends React.Component<{ id: string }>{
    render() {
        return <canvas id={this.props.id} onClick={() => this.flappyState = click(this.flappyState)}></canvas>
    }

    async componentDidMount() {
        await new Promise((resolve, _) => img0.onload = resolve);
        const context = (document.getElementById(this.props.id) as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
        this.renderContext = context;
        context.canvas.height = context.canvas.clientHeight;
        context.canvas.width = context.canvas.clientWidth;
        context.scale(context.canvas.width / 1600, context.canvas.height / 900)

        const onFrame = (currentMS: number, lastMS: number) => {
            const passedMS = currentMS - lastMS;

            this.flappyState = {
                top: this.flappyState.top + passedMS / 10
            };

            renderState(this.renderContext as CanvasRenderingContext2D, this.flappyState);
            requestAnimationFrame(nextMS => onFrame(nextMS, currentMS));
        };

        const startTime = window.performance.now();
        requestAnimationFrame(nextMS => onFrame(nextMS, startTime));
    }

    renderContext: CanvasRenderingContext2D | null = null
    flappyState: FlappyState = defaultState
}


interface FlappyState {
    top: number
}

function click(oldState: FlappyState): FlappyState {
    return {
        top: oldState.top - 100
    };
}

function renderState(context: CanvasRenderingContext2D, state: FlappyState) {
    context.clearRect(0, 0, 1600, 900);
    context.drawImage(img0, 100, state.top, 25, 50);
    context.save();
    context.scale(-1, 1);
    context.drawImage(img0, -125, state.top, -25, 50);
    context.restore();
}