import { strEnum, assertUnreachable } from "../util"
import Vactor from './linear/vector';
import LineSegment from './linear/lineSegment';
import Vector from "./linear/vector";

const g = 0.001; // px/ms^2
const vRise = -0.4 // px/ms
const vForward = -0.1;
export const PlayerHeight = 50;
export const PlayerWidth = 50;
export const PlayerLeft = 100;
export const CheckAreaWidth = 75;
export const CheckAreaHeight = 150;
const CheckAreaInterval = 200;

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
    checkAreas: Array<CheckArea>
    score: number
}

interface Oops {
    type: typeof GameStateTypes.Oops
    top: number
    checkAreas: Array<CheckArea>
    score: number
}

export const DefaultState: GameState = { type: GameStateTypes.ClickToStart };

function FlappingStart(): Flapping {
    return {
        type: GameStateTypes.Flapping,
        top: 500,
        velocity: 0,
        checkAreas: Array.from(InitCheckAreas()),
        score: 0
    };
}

function* InitCheckAreas() {
    for (let i = 500; i < 1600; i += (CheckAreaWidth + CheckAreaInterval))
        yield {
            top: Math.floor(Math.random() * Math.floor(500)) + 200,
            left: i
        }
}

export function frame(passedMS: number, oldState: GameState): GameState {
    switch (oldState.type) {
        case GameStateTypes.ClickToStart: return oldState;
        case GameStateTypes.Flapping: return flappingFrame(passedMS, oldState);
        case GameStateTypes.Oops: return oldState;
    }

    assertUnreachable(oldState);
}

function flappingFrame(passedMS: number, oldState: Flapping): GameState {
    const currentVelocity = oldState.velocity + passedMS * g;
    const currentTop = oldState.top + (currentVelocity + oldState.velocity) * 0.5 * passedMS;

    const currentCheckAreas = oldState.checkAreas.map(x => {
        return { top: x.top, left: x.left + passedMS * vForward };
    });

    const currentScore = oldState.score +
        (currentCheckAreas.filter(x => x.left + CheckAreaWidth < PlayerLeft).length - oldState.checkAreas.filter(x => x.left + CheckAreaWidth < PlayerLeft).length);

    while (currentCheckAreas.length > 0 && currentCheckAreas[0].left + CheckAreaWidth < 0)
        currentCheckAreas.shift();
    if (1600 - currentCheckAreas[currentCheckAreas.length - 1].left > CheckAreaWidth + CheckAreaInterval)
        currentCheckAreas.push({
            top: Math.floor(Math.random() * Math.floor(500)) + 200,
            left: currentCheckAreas[currentCheckAreas.length - 1].left + CheckAreaWidth + CheckAreaInterval
        });

    if (currentTop < 900 - PlayerHeight &&
        currentTop > 0 &&
        currentCheckAreas.every(a => !HitObstacle(currentTop, a))) {
        return {
            type: GameStateTypes.Flapping,
            top: currentTop,
            velocity: currentVelocity,
            checkAreas: currentCheckAreas,
            score: currentScore
        };
    }
    else
        return {
            type: GameStateTypes.Oops,
            top: currentTop,
            checkAreas: oldState.checkAreas,
            score: oldState.score
        };
}

export function click(oldState: GameState): GameState {
    switch (oldState.type) {
        case GameStateTypes.ClickToStart: return FlappingStart();
        case GameStateTypes.Flapping:
            return {
                type: GameStateTypes.Flapping,
                top: oldState.top,
                velocity: vRise,
                checkAreas: oldState.checkAreas,
                score: oldState.score
            };
        case GameStateTypes.Oops: return oldState;
    }

    assertUnreachable(oldState);
}

function HitObstacle(playerTop: number, area: CheckArea) {
    if (!(PlayerLeft + PlayerWidth >= area.left && PlayerLeft <= area.left + CheckAreaWidth))
        return false;

    const areaLines = LinesForCheckArea(area);
    const playerLines = [
        ...LinesForVectors([
            new Vector(PlayerLeft + 8, playerTop + 43),
            new Vector(PlayerLeft + 25, playerTop + 3),
            new Vector(PlayerLeft + 42, playerTop + 43)
        ])
    ];

    return playerLines.some(p => areaLines.some(a => LineSegment.intersects(p, a)))
}

function LinesForCheckArea(area: CheckArea) {
    return [
        ...LinesForVectors([
            new Vector(area.left, 0),
            new Vector(area.left, area.top),
            new Vector(area.left + CheckAreaWidth, area.top),
            new Vector(area.left + CheckAreaWidth, 0)]),
        ...LinesForVectors([
            new Vector(area.left, 1600),
            new Vector(area.left, area.top + CheckAreaHeight),
            new Vector(area.left + CheckAreaWidth, area.top + CheckAreaHeight),
            new Vector(area.left + CheckAreaWidth, 1600)
        ])
    ];
}

function* LinesForVectors(vectors: Vector[]) {
    for (let i = 1; i < vectors.length; i++)
        yield new LineSegment(vectors[i - 1], vectors[i]);
}
