import * as React from "react";
import { RoutePath } from '../routing';

export default class MainFrame extends React.Component {
    render() {
        return (
            <div id="main" className="container-fluid p-0">
                <div id="header" className="container-fluid text-center">
                    <nav className="nav" >
                        <a className="nav-link active" href="">Home</a>
                    </nav>
                </div>
                {this.props.children}
                <div id="footer" className="container-fluid text-center">
                    Host on <a href="https://pages.github.com/">GitHub Pages</a>
                </div>
            </div>
        );
    }
}