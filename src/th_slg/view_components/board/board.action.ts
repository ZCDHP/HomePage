import {
    BoardView as View, BoardViewType as ViewType, Step, UnitMoving,
    TileSize, PathPosition, PathSize, PathPositionVector, SidePathOffest, Dirs, BoardView_None
} from "./board.view"
import { Game, TerrainType, Tile, Unit, getMovementCost } from "../../game";
import * as Action from "../../actions";
import Vector from "../../../flappy/linear/vector";
import Map2d from "../../map2d";
import { List, Stack } from "immutable";
import immer from "immer";

export function handle(view: View, game: Game, action: Action.Action): View {
    switch (action.type) {
        case Action.ActionType.Board_Unit_Selected:
            return UnitSelected(view, game, action);
        case Action.ActionType.Board_Unit_Move_Destination_Selected:
            return DestinationSelected(view, game, action);
        case Action.ActionType.Board_Unit_Move_Cancel:
            return BoardView_None;
        default:
            return view;
    }
}

function UnitSelected(view: View, game: Game, action: Action.BoardUnitSelected): View {
    const unit = game.board.get(action.data)!.unit!;

    return {
        type: ViewType.UnitMoving,
        unitPosition: action.data,
        moveablePositions: getMoveablePositions(game, action.data),
        path: Stack([{
            direction: new Vector(0, 0),
            restMovePoint: unit.movement,
            position: action.data
        }])
    }
}

function getMoveablePositions(state: Game, unitAt: Vector): Vector[] {
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


function DestinationSelected(view: View, game: Game, action: Action.BoardUnitMoveDestinationSelected): View {
    if (view.type != ViewType.UnitMoving)
        return view;

    const lastStep = view.path.peek();
    const selectedCell = action.data;

    if (Vector.equal(lastStep.position, selectedCell) || // Already there
        !view.moveablePositions.some(p => Vector.equal(p, selectedCell)))  // Un reachable
        return view;

    const moveCostMap = createMoveCostMap(game, view.unitPosition, view.moveablePositions);
    const unit = game.board.get(view.unitPosition)!.unit as Unit;

    // Some where already on path
    if (view.path.some(x => Vector.equal(x!.position, selectedCell)))
        return immer(view, draft => {
            let newPath = view.path;
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
            return immer(view, draft => {
                draft.path = view.path.push({
                    direction: diffVec,
                    restMovePoint: nextMovePoint,
                    position: selectedCell
                });
            });
    }

    return immer(view, draft => {
        draft.path = findPathTo(view.path, moveCostMap, selectedCell);
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

function createMoveCostMap(game: Game, unitAt: Vector, area: Vector[]): Map2d<number> {
    const unit = game.board.get(unitAt)!.unit as Unit;
    const getCost = (pos: Vector) => getMovementCost(unit.movementType, game.board.get(pos)!.terrain);
    return area.reduce<Map2d<number>>((map, pos) => map.set(pos, getCost(pos)), new Map2d<number>());
}