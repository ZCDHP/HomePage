import * as React from "react";
import * as ReactDom from 'react-dom'

import { Main as Flappy } from './flappy/main'
import { Game as _2048 } from './2048/game'

interface GameDescription {
    name: string
    description: string
    coverPath: string
    constructor: (id: string) => React.ReactElement<{ id: string }>
    publishDate: Date
}

class GameEntry extends React.Component<{ game: GameDescription, onGameSelected: (game: GameDescription) => void }> {
    render() {
        return (
            <div
                className="btn btn-light mt-3 d-flex flex-column flex-md-row align-items-center align-items-md-start w-100"
                onClick={_ => this.props.onGameSelected(this.props.game)}>
                <img className="mx-auto" src={this.props.game.coverPath} alt="Game Cover" style={{ width: "400px", minWidth: "400px", height: "225px" }} />
                <div className="container-fluid text-center text-md-left mt-4 ml-md-4" style={{ whiteSpace: "normal" }}>
                    <h3>{this.props.game.name}</h3>
                    <p className="publish-date font-weight-light">{this.props.game.publishDate.toLocaleDateString()}</p>
                    <p>{this.props.game.description}</p>
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
                <div id="header" className="container-fluid text-center">
                    <nav className="nav" >
                        <a className="nav-link active" href="">Home</a>
                    </nav>
                </div>
                {this.renderBody()}
                <div id="footer" className="container-fluid text-center">
                    Host on <a href="https://pages.github.com/">GitHub Pages</a>
                </div>
            </div>
        );
    }

    private renderBody = () => {
        if (this.state.playing == null)
            return <div id="body" className="row"><GameEntryList games={this.props.games} onGameSelected={g => this.setState({ playing: g })} /> </div>;
        else
            return (
                <div id="body" className="row">
                    <div id="content" className="col-lg-8 offset-lg-1 text-center">
                        <h1> {this.state.playing.name}</h1>
                        <p className="publish-date font-weight-light">{this.state.playing.publishDate.toLocaleDateString()}</p>
                        {this.state.playing.constructor("game")}
                    </div>
                    <div id="sidebar" className="col-lg-2 pt-5">
                        <p><a href="https://github.com/ZCDHP/HomePage/issues/new" target="_blank">Bug!</a></p>
                        <p>Created by <a href="https://github.com/ZCDHP" target="_blank">ZCDHP</a></p>
                    </div>
                </div>
            )
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ReactDom.render(
        <Index games={[
            {
                name: "2048",
                description: "A simple and crude imitation to 2048.",
                coverPath: "./2048/cover.png",
                constructor: id => <_2048 id={id} />,
                publishDate: new Date('2030-01-01')
            },
            {
                name: "Flappy",
                description: "A simple and crude imitation to Flappy Bird.",
                coverPath: "./flappy/cover.png",
                constructor: id => <Flappy id={id} />,
                publishDate: new Date("2018-02-27")
            }
        ]} />,
        document.body);
});