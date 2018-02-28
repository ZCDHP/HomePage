type RouteHandler = (pathSegments: string[]) => void;

export default function HashRoute(handler: RouteHandler) {
    const handlerPath = () => {
        const pathSegments = (window.location.href.split('#')[1] || '').split('/').filter(x => x != '');
        handler(pathSegments);
    };

    document.addEventListener("DOMContentLoaded", handlerPath);
    window.addEventListener("popstate", handlerPath);
}