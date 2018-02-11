import { strEnum, assertUnreachable } from "./util"

const g = 0.001; // px/ms^2
const vRise = -0.65 // px/ms
const vForward = -0.1;
export const PlayerHeight = 50;
export const PlayerWidth = 50;
export const PlayerLeft = 100;
export const CheckAreaWidth = 75;
export const CheckAreaHeight = 100;
const CheckAreaInterval = 100;

export const GameStateTypes = strEnum(["ClickToStart", "Flapping", "Oops"]);
type GameStateTypes = keyof typeof GameStateTypes;

export type GameState =
    | ClickToStart
    | Flapping
    | Oops

interface ClickToStart {
    type: typeof GameStateTypes.ClickToStart
}

export interface CheckArea {
    top: number
    left: number
}

interface Flapping {
    type: typeof GameStateTypes.Flapping
    top: number
    velocity: number
    CheckAreas: Array<CheckArea>
}

interface Oops {
    type: typeof GameStateTypes.Oops
    top: number
    CheckAreas: Array<CheckArea>
}

export const DefaultState: GameState = { type: GameStateTypes.ClickToStart };

const FlappingStart: Flapping = {
    type: GameStateTypes.Flapping,
    top: 500,
    velocity: 0,
    CheckAreas: []
}

export function frame(passedMS: number, oldState: GameState): GameState {
    switch (oldState.type) {
        case GameStateTypes.ClickToStart: return oldState;
        case GameStateTypes.Flapping:
            const currentVelocity = oldState.velocity + passedMS * g;
            const currentTop = oldState.top + (currentVelocity + oldState.velocity) * 0.5 * passedMS;
            if (currentTop < 900 - PlayerHeight && currentTop > 0) {
                const newCheckAreas = oldState.CheckAreas.map(x => {
                    return { top: x.top, left: x.left + passedMS * vForward };
                });
                while (newCheckAreas.length > 0 && newCheckAreas[0].left + CheckAreaWidth < 0)
                    newCheckAreas.shift();
                if (newCheckAreas.length == 0 || 1600 - newCheckAreas[newCheckAreas.length - 1].left > CheckAreaWidth + CheckAreaInterval)
                    newCheckAreas.push({
                        top: Math.floor(Math.random() * Math.floor(500)) + 200,
                        left: newCheckAreas.length == 0 ? 1600 : newCheckAreas[newCheckAreas.length - 1].left + CheckAreaWidth + CheckAreaInterval
                    });

                return {
                    type: GameStateTypes.Flapping,
                    top: currentTop,
                    velocity: currentVelocity,
                    CheckAreas: newCheckAreas
                };
            }
            else
                return {
                    type: GameStateTypes.Oops,
                    top: currentTop,
                    CheckAreas: oldState.CheckAreas
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
                velocity: vRise,
                CheckAreas: oldState.CheckAreas
            };
        case GameStateTypes.Oops: return FlappingStart;
    }

    assertUnreachable(oldState);
}