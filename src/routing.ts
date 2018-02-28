import { strEnum, assertUnreachable } from "./util"

export class RoutePath {
    public static Root(path: string) {
        return `/#/${path}`;
    }

    public static Game(id: string) {
        return `/#/game/${id}`;
    }
}

export const RouteType = strEnum(["Index", "Game", "NotFound"]);
export type RouteType = keyof typeof RouteType;

interface IRouteType<T extends RouteType> { type: T };

type Route_Index = IRouteType<typeof RouteType.Index>;
const Route_Index: Route_Index = { type: RouteType.Index };

type Route_NotFound = IRouteType<typeof RouteType.NotFound>;
const Route_NotFound: Route_NotFound = { type: RouteType.NotFound };

type Route_Game = IRouteType<typeof RouteType.Game> & { id: string };
function Route_Game(id: string): Route_Game { return { type: RouteType.Game, id }; }

export type Route =
    | IRouteType<typeof RouteType.Index>
    | IRouteType<typeof RouteType.NotFound>
    | IRouteType<typeof RouteType.Game> & { id: string }

export function parseRoute(pathSegnemts: string[]): Route {
    if (pathSegnemts.length == 0 ||
        pathSegnemts.length == 1 && pathSegnemts[0].toLowerCase() == "index")
        return Route_Index;
    else if (pathSegnemts.length == 2 && pathSegnemts[0].toLowerCase() == "game")
        return Route_Game(pathSegnemts[1]);
    else
        return Route_NotFound;
}
