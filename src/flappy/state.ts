const g = 0.001; // px/ms^2
const riseV = -0.65 // px/ms


export interface FlappyState {
    top: number
    velocity: number
    totalMS: number
}

export const DefaultState: FlappyState = {
    top: 500,
    totalMS: 0,
    velocity: 0,
}

export function frame(passedMS: number, oldState: FlappyState): FlappyState {
    const currentVelocity = oldState.velocity + passedMS * g;
    return {
        top: oldState.top + (currentVelocity + oldState.velocity) * 0.5 * passedMS,
        velocity: currentVelocity,
        totalMS: oldState.totalMS + passedMS
    };
}

export function click(oldState: FlappyState): FlappyState {
    return {
        top: oldState.top,
        totalMS: oldState.totalMS,
        velocity: riseV
    };
}