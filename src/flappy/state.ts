import { strEnum, assertUnreachable } from "./util"

const g = 0.001; // px/ms^2
const vRise = -0.65 // px/ms
export const PlayerHeight = 50;
export const PlayerWidth = 50;
export const PlayerLeft = 100;

export const GameStateTypes = strEnum(["ClickToStart", "Flapping", "Oops"]);
type GameStateTypes = keyof typeof GameStateTypes;

export type GameState =
    | ClickToStart
    | Flapping
    | Oops

interface ClickToStart {
    type: typeof GameStateTypes.ClickToStart
}

interface Flapping {
    type: typeof GameStateTypes.Flapping
    top: number
    velocity: number
}

interface Oops {
    type: typeof GameStateTypes.Oops
    top: number
}

export const DefaultState: GameState = { type: GameStateTypes.ClickToStart };

const FlappingStart: Flapping = {
    type: GameStateTypes.Flapping,
    top: 500,
    velocity: 0,
}

export function frame(passedMS: number, oldState: GameState): GameState {
    switch (oldState.type) {
        case GameStateTypes.ClickToStart: return oldState;
        case GameStateTypes.Flapping:
            const currentVelocity = oldState.velocity + passedMS * g;
            const currentTop = oldState.top + (currentVelocity + oldState.velocity) * 0.5 * passedMS;
            if (currentTop < 900 - PlayerHeight && currentTop > 0)
                return {
                    type: GameStateTypes.Flapping,
                    top: currentTop,
                    velocity: currentVelocity
                };
            else
                return {
                    type: GameStateTypes.Oops,
                    top: currentTop
                };
        case GameStateTypes.Oops: return oldState;
    }

    assertUnreachable(oldState);
}

export function click(oldState: GameState): Flapping {
    switch (oldState.type) {
        case GameStateTypes.ClickToStart: return FlappingStart;
        case GameStateTypes.Flapping:
            return {
                type: GameStateTypes.Flapping,
                top: oldState.top,
                velocity: vRise
            };
        case GameStateTypes.Oops: return FlappingStart;
    }

    assertUnreachable(oldState);
}