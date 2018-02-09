import * as React from "react";

export class Main extends React.Component<{id:string}>{
    render(){
        return <canvas id={this.props.id} onClick={this.onClick.bind(this)}></canvas>
    }

    componentDidMount(){
        const context = (document.getElementById(this.props.id) as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
        this.renderContext = context;
        context.canvas.height = context.canvas.clientHeight;
        context.canvas.width = context.canvas.clientWidth;
        context.scale(context.canvas.width/1600, context.canvas.height/900)
        
        const onFrame = (currentMS:number, lastMS:number)=>{
            const passedMS = currentMS - lastMS;

            this.flappyState = {
                top: this.flappyState.top + passedMS/10
            };

            this.renderFrame();
            requestAnimationFrame(nextMS =>onFrame(nextMS, currentMS));
        };

        const startTime = window.performance.now();
        requestAnimationFrame(nextMS =>onFrame(nextMS, startTime));
    }

    onClick(){
        this.flappyState = {
            top: this.flappyState.top - 100
        }
    }

    renderFrame(){
        const context = this.renderContext as CanvasRenderingContext2D;
        context.clearRect(0,0,1600,900);
        context.fillStyle='black';
        context.fillRect(100,this.flappyState.top,25,25);
    }

    renderContext:CanvasRenderingContext2D|null = null
    flappyState:FlappyState = defaultState
}

interface FlappyState{
    top:number
}

const defaultState:FlappyState = {
    top:500
}