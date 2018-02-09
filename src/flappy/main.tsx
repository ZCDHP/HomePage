import * as React from "react";

export class Main extends React.Component<{ id: string }>{
    render() {
        return <canvas id={this.props.id} onClick={() => this.flappyState = click(this.flappyState)}></canvas>
    }

    componentDidMount() {
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

const defaultState: FlappyState = {
    top: 500
}

function click(oldState: FlappyState): FlappyState {
    return {
        top: oldState.top - 100
    };
}

function renderState(context: CanvasRenderingContext2D, state: FlappyState) {
    context.clearRect(0, 0, 1600, 900);
    context.fillStyle = 'black';
    context.fillRect(100, state.top, 25, 25);
}