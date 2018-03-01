type RouteHandler = (pathSegments: string[]) => void;

export function ListenRouteChange(handler: RouteHandler) {
    window.addEventListener("popstate", () => handler(CurrentRoute()));
}

export function CurrentRoute() {
    return (window.location.href.split('#')[1] || '').split('/').filter(x => x != '');
}