import * as React from "react";
import GameDescription from "../gameDescription";
import { RoutePath } from '../routing';

class GameEntry extends React.Component<{ game: GameDescription }> {
    render() {
        return (
            <a
                className="btn btn-light mt-3 d-flex flex-column flex-md-row align-items-center align-items-md-start w-100"
                href={RoutePath.Game(this.props.game.id)}>
                <img className="mx-auto" src={this.props.game.coverPath} alt="Game Cover" style={{ width: "400px", minWidth: "400px", height: "225px" }} />
                <div className="container-fluid text-center text-md-left mt-4 ml-md-4" style={{ whiteSpace: "normal" }}>
                    <h3>{this.props.game.name}</h3>
                    <p className="publish-date font-weight-light">{this.props.game.publishDate.toLocaleDateString()}</p>
                    <p>{this.props.game.description}</p>
                </div>
            </a>
        );
    }
}

export default class GameEntryPage extends React.Component<{ games: GameDescription[] }> {
    render() {
        return (
            <div className="col-12 col-md-10 offset-md-1 col-xl-8 offset-xl-2 p-5 d-flex flex-column align-items-center">
                {this.props.games.map(g => <GameEntry game={g} />)}
            </div>
        )
    }
}
