import immer from 'immer'
import { Stack, List } from 'immutable'
import { State as GameState, Tile, TerrainType, Unit, getMovementCost } from './state';
import * as MapFragment from './mapFragment';
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
    const unit = gameState.board[selectedCell.x][selectedCell.y].unit;
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

    const moveCostMap = createMovementCostMap(gameState, moving.unitPosition, moving.moveablePositions);
    const unit = gameState.board[moving.unitPosition.x][moving.unitPosition.y].unit as Unit;

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
        const nextMovePoint = lastStep.restMovePoint - moveCostMap[selectedCell.x][selectedCell.y];
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

function findPathTo(path: Stack<Step>, movementMap: MapFragment.MapFragment<number>, target: Vector, avoidDir?: Vector): Stack<Step> {
    const baseOnCurrent = findPathBaseOn(path, movementMap, target, avoidDir);
    if (baseOnCurrent)
        return baseOnCurrent;
    const pathNext = path.pop();
    if (pathNext.isEmpty())
        throw new Error("Un reachable");
    return findPathTo(pathNext, movementMap, target, path.peek().direction);
}

function findPathBaseOn(path: Stack<Step>, movementMap: MapFragment.MapFragment<number>, target: Vector, avoidDir?: Vector): Stack<Step> | undefined {
    const lastStep = path.peek();
    if (Vector.equal(lastStep.position, target))
        return path;

    const avoidDirs = [avoidDir, Vector.scale(lastStep.direction, -1)].filter(x => x != undefined) as Vector[];
    for (const dir of Dirs.filter(x => !avoidDirs.some(y => Vector.equal(x, y)))) {
        const positionNext = Vector.add(dir, lastStep.position);
        if (!MapFragment.contains(positionNext.x, positionNext.y, movementMap))
            continue;
        const movementNext = lastStep.restMovePoint - movementMap[positionNext.x][positionNext.y];
        if (movementNext < 0)
            continue;

        const resultNext = findPathBaseOn(
            path.push({ direction: dir, position: positionNext, restMovePoint: movementNext }),
            movementMap,
            target);
        if (resultNext)
            return resultNext;
    }
}

function createMovementCostMap(gameState: GameState, unitAt: Vector, area: Vector[]): MapFragment.MapFragment<number> {
    const map = MapFragment.create<number>();
    const unit = gameState.board[unitAt.x][unitAt.y].unit as Unit;
    for (const pos of area)
        MapFragment.set(pos.x, pos.y, map, getMovementCost(unit.movementType, gameState.board[pos.x][pos.y].terrain));

    return map;
}

function getboardCell(pos: Vector): Vector {
    const floatBoardPost = Vector.scale(pos, 1 / TileSize);
    return new Vector(Math.trunc(floatBoardPost.x), Math.trunc(floatBoardPost.y));
}

function getMoveablePositions(state: GameState, unitAt: Vector): Vector[] {
    const map = MapFragment.create<number>();
    const unit = state.board[unitAt.x][unitAt.y].unit as Unit;

    function from(movePoint: number, position: Vector) {
        Dirs.map(x => Vector.add(x, position))
            .forEach(p => {
                if (p.x < 0 || p.y < 0 || p.x >= state.board.length || p.y >= state.board[0].length)
                    return;
                const onMap = MapFragment.get(p.x, p.y, map);
                const restMovePoint = movePoint - getMovementCost(unit.movementType, state.board[p.x][p.y].terrain);
                if (restMovePoint >= 0 &&
                    (!onMap || onMap < restMovePoint)) {
                    MapFragment.set(p.x, p.y, map, restMovePoint);
                    from(restMovePoint, p);
                }
            });
    }

    MapFragment.set(unitAt.x, unitAt.y, map, unit.movement);

    from(unit.movement, unitAt);
    return MapFragment.map((x, y, _) => new Vector(x, y), map);
}

// rendering
export function render(context: CanvasRenderingContext2D, boardViewVtate: BoardViewState, gameState: GameState) {
    let pathMap = MapFragment.create<Vector[]>();
    if (boardViewVtate.type == BoardViewStateType.UnitMoving) {
        const path = boardViewVtate.path.reverse().toArray();
        path.forEach((step, index) => {
            const linkPre = index == 0 ? [] : [Vector.scale(step.direction, -1)];
            const linkNext = index == path.length - 1 ? [] : [path[index + 1].direction];
            MapFragment.set(step.position.x, step.position.y, pathMap, [...linkPre, ...linkNext]);
        });
    }

    Array2.expand(gameState.board)
        .forEach(tile => {
            context.save();
            context.translate(tile.corrdinate.x * TileSize, tile.corrdinate.y * TileSize);
            renderTile(context, tile.value)

            if (boardViewVtate.type == BoardViewStateType.UnitMoving) {
                if (boardViewVtate.moveablePositions.some(x => Vector.equal(x, tile.corrdinate))) {
                    context.fillStyle = "rgba(255,255,255,0.3)";
                    context.fillRect(0, 0, TileSize, TileSize);
                }

                const dirs = MapFragment.get(tile.corrdinate.x, tile.corrdinate.y, pathMap)
                if (dirs) {
                    context.fillStyle = "rgba(229,70,70,0.3)";
                    List(dirs).flatMap<Vector, Vector>(dir => [
                        Vector.add(PathPositionVector, new Vector(dir!.x * PathSize, dir!.y * PathSize)),
                        Vector.add(PathPositionVector, new Vector(dir!.x * SidePathOffest, dir!.y * SidePathOffest))])
                        .concat([PathPositionVector])
                        .forEach(pos => context.fillRect(pos!.x, pos!.y, PathSize, PathSize));
                }
            }

            context.restore();
        })
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