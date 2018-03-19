import { BoardView, BoardViewType, TileSize, PathPosition, PathSize, PathPositionVector, SidePathOffest } from "./board.view"
import { Game, TerrainType, Tile, Unit } from "../../game";
import { List } from "immutable";
import Map2d from "../../map2d";
import { assertUnreachable } from "../../../util";
import Vector from "../../../flappy/linear/vector";


export function render(context: CanvasRenderingContext2D, boardView: BoardView, game: Game) {
    const pathMap = getPathMap(boardView);

    for (const tile of game.board)
        scopeToTile(context, tile.corrdinate, () => {
            renderTile(context, tile.value);
        });

    if (boardView.type == BoardViewType.UnitMoving) {
        for (const position of boardView.moveablePositions)
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

function getPathMap(boardViewVtate: BoardView): Map2d<Vector[]> {
    if (boardViewVtate.type != BoardViewType.UnitMoving)
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