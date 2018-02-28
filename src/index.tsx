import * as React from "react";
import * as ReactDom from 'react-dom'

import HashRouter from './hashRouter';
import { parseRoute, RouteType, Route } from './routing';

import GameDescription from "./gameDescription";
import Games from './games';

import GameEntryPage from "./components/gameEntryPage";
import MainFrame from "./components/mainFrame";

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
                            <div id="content" className="col-lg-8 offset-lg-1 text-center">
                                <h1> {game.name}</h1>
                                <p className="publish-date font-weight-light">{game.publishDate.toLocaleDateString()}</p>
                                {game.constructor("game")}
                            </div>
                            <div id="sidebar" className="col-lg-2 pt-5">
                                <p><a href="https://github.com/ZCDHP/HomePage/issues/new" target="_blank">Bug!</a></p>
                                <p>Created by <a href="https://github.com/ZCDHP" target="_blank">ZCDHP</a></p>
                            </div>
                        </div>
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