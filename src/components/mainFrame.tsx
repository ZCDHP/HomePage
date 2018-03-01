import * as React from "react";

export default class MainFrame extends React.Component<{ title: string }> {
    render() {
        document.title = this.props.title;
        return (
            <div id="main" className="container-fluid p-0">
                <div id="header" className="container-fluid text-center">
                    <nav id="header-nav" className="nav" >
                        <a className="nav-link active" href="/#">Home</a>
                    </nav>
                </div>
                {this.props.children}
                <div id="footer" className="container-fluid text-center">
                    Host on <a href="https://pages.github.com/">GitHub Pages</a>
                </div>
            </div >
        );
    }
}