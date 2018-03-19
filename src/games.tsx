import * as React from "react";

import GameDescription from "./gameDescription";

import { Main as Flappy } from './flappy/main'
import { Game as _2048 } from './2048/game'
import { Main as TH_slg } from './th_slg/main'

const Games: GameDescription[] = [
    {
        id: "th_slg",
        name: "TH SLG",
        description: "A SLG played by Secret Sealing Club to kill a afternoon.",
        coverPath: "./th_slg/cover.png",
        constructor: id => <TH_slg id={id} />,
        publishDate: new Date('3000-01-01')
    },
    {
        id: "2048",
        name: "2048",
        description: "A simple and crude imitation to 2048.",
        coverPath: "./2048/cover.png",
        constructor: id => <_2048 id={id} />,
        publishDate: new Date('2018-02-27')
    },
    {
        id: "flapping",
        name: "Flapping",
        description: "A simple and crude imitation to Flappy Bird.",
        coverPath: "./flappy/cover.png",
        constructor: id => <Flappy id={id} />,
        publishDate: new Date("2018-02-13")
    }
];

export default Games;
