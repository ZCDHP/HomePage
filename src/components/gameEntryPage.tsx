import * as React from "react";
import GameDescription from "../gameDescription";
import { RoutePath } from '../routing';

class GameEntry extends React.Component<{ game: GameDescription }> {
    render() {
        return (
            <a
                className="btn btn-light mt-3 px-0 pt-0 w-100"
                href={RoutePath.Game(this.props.game.id)}>
                <div className="container-fluid m-0 text-center text-md-left" style={{ backgroundColor: "black", color: "white" }}>
                    <h3>{this.props.game.name}</h3>
                </div>
                <div className="d-flex flex-column-reverse flex-md-row align-items-center align-items-md-start w-100">
                    <div className="container-fluid text-center text-md-left" style={{ whiteSpace: "normal" }}>
                        <p className="publish-date font-weight-light p-1">{this.props.game.publishDate.toLocaleDateString()}</p>
                        <p className="m-auto">{this.props.game.description}</p>
                    </div>
                    <div style={{ width: "400px", height: "225px", minWidth: "400px" }}>
                        <img className="mx-auto  rounded" src={this.props.game.coverPath} alt="Game Cover" style={{ maxWidth: "400px", maxHeight: "225px" }} />
                    </div>
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
