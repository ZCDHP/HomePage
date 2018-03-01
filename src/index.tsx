import * as React from "react";
import * as ReactDom from 'react-dom'

import HashRouter from './hashRouter';
import { parseRoute, RouteType, Route } from './routing';

import GameDescription from "./gameDescription";
import Games from './games';

import MainFrame from "./components/mainFrame";
import GameEntryPage from "./components/gameEntryPage";
import GamePage from "./components/gamePage";

import "./index.scss";

class Main extends React.Component<{}, Route>{
    constructor(prop: {}) {
        super(prop);
        this.state = parseRoute([]);
        HashRouter(stringSegments => this.setState(parseRoute(stringSegments)));
    }

    render() {
        const { title, body } = this.bodaAndTitle(this.state);
        return (
            <MainFrame title={title} >
                <div id="main" className="container-fluid p-0">
                    {body}
                </div>
            </MainFrame>
        );
    }

    private bodaAndTitle = (route: Route) => {
        switch (route.type) {
            case RouteType.Index:
                return { title: "ZCDHP's Home Page", body: <GameEntryPage games={Games} /> };
            case RouteType.Game:
                const game = Games.find(x => x.id == route.id);
                if (game)
                    return {
                        title: game.name,
                        body: <GamePage {...game}> {game.constructor("game")}</GamePage>
                    };
            default:
                return { title: "NOT FOUND", body: <h1>NOT FOUND</h1> };
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ReactDom.render(
        <Main />,
        document.body);
});