import { strEnum, assertUnreachable } from "./util"

const g = 0.001; // px/ms^2
const vRise = -0.65 // px/ms

export const GameStateTypes = strEnum(["ClickToStart", "Flapping"]);
type GameStateTypes = keyof typeof GameStateTypes;

export type GameState =
    | ClickToStart
    | Flapping

interface ClickToStart {
    type: typeof GameStateTypes.ClickToStart
}

interface Flapping {
    type: typeof GameStateTypes.Flapping
    top: number
    velocity: number
    totalMS: number
}

export const DefaultState: GameState = { type: GameStateTypes.ClickToStart };

export function frame(passedMS: number, oldState: GameState): GameState {
    switch (oldState.type) {
        case GameStateTypes.ClickToStart: return oldState;
        case GameStateTypes.Flapping:
            const currentVelocity = oldState.velocity + passedMS * g;
            return {
                type: GameStateTypes.Flapping,
                top: oldState.top + (currentVelocity + oldState.velocity) * 0.5 * passedMS,
                velocity: currentVelocity,
                totalMS: oldState.totalMS + passedMS
            };
    }

    assertUnreachable(oldState);
}

export function click(oldState: GameState): Flapping {
    switch (oldState.type) {
        case GameStateTypes.ClickToStart:
            return {
                type: GameStateTypes.Flapping,
                top: 500,
                totalMS: 0,
                velocity: 0,
            };
        case GameStateTypes.Flapping:
            return {
                type: GameStateTypes.Flapping,
                top: oldState.top,
                totalMS: oldState.totalMS,
                velocity: vRise
            };
    }

    assertUnreachable(oldState);
}