import * as React from "react";
import * as ReactDom from 'react-dom'

import { Main as Flappy } from './flappy/main'


document.addEventListener('DOMContentLoaded', () => {
    ReactDom.render(
        <Flappy id="flappy" />,
        document.body);
});