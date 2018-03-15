import immer from 'immer'
import { Stack, List } from 'immutable'
import { State as GameState, Tile, TerrainType, Unit, getMovementCost, State } from './state';
import Map2d from './map2d';
import { Array2, strEnum, assertUnreachable } from '../util';
import Vector from '../flappy/linear/vector';

const TileSize = 120;
const PathSize = TileSize / 8;
const PathPosition = (TileSize - PathSize) / 2;
const PathPositionVector = new Vector(PathPosition, PathPosition);
const SidePathOffest = TileSize - PathSize - PathPosition;
const Dirs = [new Vector(0, 1), new Vector(0, -1), new Vector(1, 0), new Vector(-1, 0)];

export type BoardViewState =
    | { type: typeof BoardViewStateType.None }
    | UnitMoving

export const BoardViewStateType = strEnum(["None", "UnitMoving"]);
export type BoardViewStateType = keyof typeof BoardViewStateType;

export const None: BoardViewState = { type: BoardViewStateType.None }

export interface UnitMoving {
    type: typeof BoardViewStateType.UnitMoving
    unitPosition: Vector
    moveablePositions: Vector[]
    path: Stack<Step>
}

interface Step {
    direction: Vector
    restMovePoint: number
    position: Vector
}

// interaction
export function click(oldState: BoardViewState, pos: Vector, gameState: GameState): BoardViewState {
    const selectedCell = getboardCell(pos);
    const unit = gameState.board.get(selectedCell)!.unit;
    if (!unit)
        return None;
    return {
        type: BoardViewStateType.UnitMoving,
        unitPosition: selectedCell,
        moveablePositions: getMoveablePositions(gameState, selectedCell),
        path: Stack([{
            direction: new Vector(0, 0),
            restMovePoint: unit.movement,
            position: selectedCell
        }])
    }
}

export function move(oldState: BoardViewState, pos: Vector, gameState: GameState): BoardViewState {
    switch (oldState.type) {
        case BoardViewStateType.None:
            return oldState;
        case BoardViewStateType.UnitMoving:
            return move_UnitMoving(oldState, pos, gameState);
    }
    assertUnreachable(oldState);
}

function move_UnitMoving(moving: UnitMoving, pos: Vector, gameState: GameState): BoardViewState {
    const selectedCell = getboardCell(pos);
    const lastStep = moving.path.peek();

    if (Vector.equal(lastStep.position, selectedCell) || // Already there
        !moving.moveablePositions.some(p => Vector.equal(p, selectedCell)))  // Un reachable
        return moving;

    const moveCostMap = createMoveCostMap(gameState, moving.unitPosition, moving.moveablePositions);
    const unit = gameState.board.get(moving.unitPosition)!.unit as Unit;

    // Some where already on path
    if (moving.path.some(x => Vector.equal(x!.position, selectedCell)))
        return immer(moving, draft => {
            let newPath = moving.path;
            while (!Vector.equal(selectedCell, newPath.peek().position))
                newPath = newPath.pop();
            draft.path = newPath;
        });

    // Adjoin
    const diffVec = Vector.subtracion(selectedCell, lastStep.position);
    if (Math.abs(diffVec.x) + Math.abs(diffVec.y) == 1) {
        const nextDirection = diffVec;
        const nextMovePoint = lastStep.restMovePoint - moveCostMap.get(selectedCell)!;
        if (nextMovePoint >= 0)
            return immer(moving, draft => {
                draft.path = moving.path.push({
                    direction: diffVec,
                    restMovePoint: nextMovePoint,
                    position: selectedCell
                });
            });
    }

    return immer(moving, draft => {
        draft.path = findPathTo(moving.path, moveCostMap, selectedCell);
    });
}

function findPathTo(path: Stack<Step>, moveCostMap: Map2d<number>, target: Vector, avoidDir?: Vector): Stack<Step> {
    const baseOnCurrent = findPathBaseOn(path, moveCostMap, target, avoidDir);
    if (baseOnCurrent)
        return baseOnCurrent;
    const pathNext = path.pop();
    if (pathNext.isEmpty())
        throw new Error("Un reachable");
    return findPathTo(pathNext, moveCostMap, target, path.peek().direction);
}

function findPathBaseOn(path: Stack<Step>, moveCostMap: Map2d<number>, target: Vector, avoidDir?: Vector): Stack<Step> | undefined {
    const lastStep = path.peek();
    if (Vector.equal(lastStep.position, target))
        return path;

    const avoidDirs = [avoidDir, Vector.scale(lastStep.direction, -1)].filter(x => x != undefined) as Vector[];
    for (const dir of Dirs.filter(x => !avoidDirs.some(y => Vector.equal(x, y)))) {
        const positionNext = Vector.add(dir, lastStep.position);
        const moveCost = moveCostMap.get(positionNext);
        if (!moveCost)
            continue;
        const movementNext = lastStep.restMovePoint - moveCost;
        if (movementNext < 0)
            continue;

        const resultNext = findPathBaseOn(
            path.push({ direction: dir, position: positionNext, restMovePoint: movementNext }),
            moveCostMap,
            target);
        if (resultNext)
            return resultNext;
    }
}

function createMoveCostMap(gameState: GameState, unitAt: Vector, area: Vector[]): Map2d<number> {
    const unit = gameState.board.get(unitAt)!.unit as Unit;
    const getCost = (pos: Vector) => getMovementCost(unit.movementType, gameState.board.get(pos)!.terrain);
    return area.reduce<Map2d<number>>((map, pos) => map.set(pos, getCost(pos)), new Map2d<number>());
}

function getboardCell(pos: Vector): Vector {
    const floatBoardPost = Vector.scale(pos, 1 / TileSize);
    return new Vector(Math.trunc(floatBoardPost.x), Math.trunc(floatBoardPost.y));
}

function getMoveablePositions(state: GameState, unitAt: Vector): Vector[] {
    const unit = state.board.get(unitAt)!.unit as Unit;
    const getCost = (p: Vector) => p.x < 0 || p.y < 0 || p.x >= state.boardSize.x || p.y >= state.boardSize.y ?
        Number.POSITIVE_INFINITY :
        getMovementCost(unit.movementType, state.board.get(p)!.terrain);
    const map = getMoveablePositionsFrom(unitAt, getCost, new Map2d<number>().set(unitAt, unit.movement));
    return Array.from(map).map(x => x.corrdinate);
}

function getMoveablePositionsFrom(position: Vector, getCost: (pos: Vector) => number, map: Map2d<number>, queue: List<Vector> = List()): Map2d<number> {
    const movement = map.get(position)!;
    const { map: newMap, queue: newQueue } = Dirs
        .map(x => Vector.add(x, position))
        .reduce((state, p) => {
            const existing = map.get(p);
            const rest = movement - getCost(p);
            if (rest >= 0 && (!existing || existing < rest)) {
                return {
                    map: state.map.set(p, rest),
                    queue: rest == 0 ? state.queue : state.queue.push(p)
                }
            }
            else return state;
        }, { map, queue });

    if (newQueue.isEmpty())
        return newMap;
    else {
        const next = newQueue.first();
        return getMoveablePositionsFrom(next, getCost, newMap, newQueue.shift());
    }
}

// rendering
export function render(context: CanvasRenderingContext2D, boardViewVtate: BoardViewState, gameState: GameState) {
    const pathMap = getPathMap(boardViewVtate);

    for (const tile of gameState.board)
        scopeToTile(context, tile.corrdinate, () => {
            renderTile(context, tile.value);
        });

    if (boardViewVtate.type == BoardViewStateType.UnitMoving) {
        for (const position of boardViewVtate.moveablePositions)
            scopeToTile(context, position, () => {
                context.fillStyle = "rgba(255,255,255,0.3)";
                context.fillRect(0, 0, TileSize, TileSize);
            });
        for (const path of pathMap)
            scopeToTile(context, path.corrdinate, () => {
                context.fillStyle = "rgba(229,70,70,0.3)";
                List(path.value).flatMap<Vector, Vector>(dir => [
                    Vector.add(PathPositionVector, new Vector(dir!.x * PathSize, dir!.y * PathSize)),
                    Vector.add(PathPositionVector, new Vector(dir!.x * SidePathOffest, dir!.y * SidePathOffest))])
                    .concat([PathPositionVector])
                    .forEach(pos => context.fillRect(pos!.x, pos!.y, PathSize, PathSize));
            });
    }
}

function scopeToTile(context: CanvasRenderingContext2D, position: Vector, func: () => void) {
    context.save();
    context.translate(position.x * TileSize, position.y * TileSize);
    func();
    context.restore();
}

function getPathMap(boardViewVtate: BoardViewState): Map2d<Vector[]> {
    if (boardViewVtate.type != BoardViewStateType.UnitMoving)
        return new Map2d();

    const path = boardViewVtate.path.reverse().toArray();
    return path
        .reduce<Map2d<Vector[]>>((map, step, index) => {
            const linkPre = index == 0 ? [] : [Vector.scale(step!.direction, -1)];
            const linkNext = index == path.length - 1 ? [] : [path[index + 1].direction];
            return map.set(step.position, [...linkPre, ...linkNext]);
        }, new Map2d<Vector[]>());
}

function renderTile(context: CanvasRenderingContext2D, tile: Tile) {
    renderTerrain(context, tile.terrain);
    if (tile.unit)
        renderUnit(context, tile.unit);
}

function renderTerrain(context: CanvasRenderingContext2D, terrain: TerrainType) {
    switch (terrain) {
        case TerrainType.Plain:
            context.fillStyle = "#82E0AA";
            context.fillRect(0, 0, TileSize, TileSize);
            return;
        case TerrainType.Mountain:
            context.fillStyle = "#82E0AA";
            context.fillRect(0, 0, TileSize, TileSize);
            context.strokeStyle = "black";
            context.beginPath();
            context.moveTo(0.375 * TileSize, 0.75 * TileSize);
            context.lineTo(0.5 * TileSize, 0.25 * TileSize);
            context.lineTo(0.625 * TileSize, 0.75 * TileSize);
            context.closePath();
            context.stroke();
            return;
        case TerrainType.Sea:
            context.fillStyle = "#5DADE2";
            context.fillRect(0, 0, TileSize, TileSize);
            return;
    }

    assertUnreachable(terrain);
}

function renderUnit(context: CanvasRenderingContext2D, unit: Unit) {
    context.fillStyle = 'black';
    context.font = "40px Arial";
    context.textBaseline = "top";
    context.fillText(unit.name, 0, 0, TileSize);
}