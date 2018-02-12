import * as React from "react";
import * as ReactDom from 'react-dom'

import { Main as Flappy } from './flappy/main'

interface GameDescription {
    name: string
    description: string
    coverPath: string
    constructor: (id: string) => React.ReactElement<{ id: string }>
}

class GameEntry extends React.Component<{ game: GameDescription, onGameSelected: (game: GameDescription) => void }> {
    render() {
        return (
            <div
                className="btn btn-light mt-3 d-flex flex-column flex-md-row align-items-center align-items-md-start w-100"
                onClick={_ => this.props.onGameSelected(this.props.game)}>
                <img src={this.props.game.coverPath} alt="Game Cover" style={{ width: "400px", minWidth: "400px", height: "225px" }} />
                <div className="text-center text-md-left mt-4 ml-4" style={{ whiteSpace: "normal" }}>
                    <h3>{this.props.game.name}</h3>
                    {this.props.game.description}
                </div>
            </div>
        );
    }
}

class GameEntryList extends React.Component<{ games: GameDescription[], onGameSelected: (game: GameDescription) => void }> {
    render() {
        return (
            <div className="col-12 col-md-10 offset-md-1 col-xl-8 offset-xl-2 p-5 d-flex flex-column align-items-center">
                {this.props.games.map(g => <GameEntry game={g} onGameSelected={this.props.onGameSelected} />)}
            </div>
        )
    }
}

class Index extends React.Component<{ games: GameDescription[] }, { playing: GameDescription | null }> {
    state: { playing: GameDescription | null } = { playing: null };
    render() {
        return (
            <div id="main" className="container-fluid p-0">
                <div id="header" className="container-fluid text-center" style={{ backgroundColor: "green" }}>Header</div>
                {this.renderBody()}
                <div id="footer" className="container-fluid text-center" style={{ backgroundColor: "green" }}>Footer</div>
            </div>
        );
    }

    private renderBody = () => {
        if (this.state.playing == null)
            return <div id="body" className="row"><GameEntryList games={this.props.games} onGameSelected={g => this.setState({ playing: g })} /> </div>;
        else
            return (
                <div id="body" className="row">
                    <div id="content" className="col-lg-10 col-xl-9">
                        {this.state.playing.constructor("game")}
                    </div>
                    <div id="sidebar" className="d-none d-lg-block col-lg-2 col-xl-3" style={{ backgroundColor: "blue" }}>Sidebar</div>
                </div>
            )
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ReactDom.render(
        <Index games={[
            {
                name: "Flappy",
                description: "A simple and crude imitation to Flappy Bird.",
                coverPath: "./flappy/cover.png",
                constructor: id => <Flappy id={id} />
            },
            {
                name: "Flappy",
                description: "A simple and crude imit atasdfa sdfasdf asdf asdfasio asd fasdfsdf asn to Flappy Bird.",
                coverPath: "./flappy/cover.png",
                constructor: id => <Flappy id={id} />
            }
        ]} />,
        document.body);
});