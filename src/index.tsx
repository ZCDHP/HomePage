import * as React from "react";
import * as ReactDom from 'react-dom'

import HashRouter from './hashRouter';
import { parseRoute, RouteType, Route } from './routing';

import GameDescription from "./gameDescription";
import Games from './games';

import MainFrame from "./components/mainFrame";
import GameEntryPage from "./components/gameEntryPage";
import GamePage from "./components/gamePage";

class Main extends React.Component<{}, Route>{
    constructor(prop: {}) {
        super(prop);
        this.state = parseRoute([]);
        HashRouter(stringSegments => this.setState(parseRoute(stringSegments)));
    }

    render() {
        return (
            <MainFrame >
                {this.renderBody(this.state)}
            </MainFrame>
        );
    }

    private renderBody = (route: Route) => {
        switch (route.type) {
            case RouteType.Index:
                return <div id="main" className="container-fluid p-0"><GameEntryPage games={Games} /></div>;
            case RouteType.Game:
                const game = Games.find(x => x.id == route.id);
                if (game)
                    return (
                        <div id="main" className="container-fluid p-0">
                            <GamePage {...game}>
                                {game.constructor("game")}
                            </GamePage>
                        </div >
                    );
            default:
                return <h1>NOT FOUND</h1>;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ReactDom.render(
        <Main />,
        document.body);
});