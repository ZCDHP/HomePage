import * as React from "react";
import GameDescription from "../gameDescription";

export default class GamePlayPage extends React.Component<GameDescription> {
    render() {
        return (
            <div id="body" className="row">
                <div className="game-body col-lg-8 offset-lg-1 text-center">
                    <h1> {this.props.name}</h1>
                    <p className="publish-date font-weight-light">{this.props.publishDate.toLocaleDateString()}</p>
                    {this.props.children}
                </div>
                <div id="sidebar" className="col-lg-2 pt-5">
                    <p><a href="https://github.com/ZCDHP/HomePage/issues/new" target="_blank">Bug!</a></p>
                    <p>Created by <a href="https://github.com/ZCDHP" target="_blank">ZCDHP</a></p>
                </div>
            </div>
        )
    }
}