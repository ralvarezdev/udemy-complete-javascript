import {Grid} from "../compjs/js/grid.js";
import {CompJS} from "../compjs/js/compjs.js";
import {COMPJS_SELECTORS} from "../compjs/js/compjs-props.js";


// Add grid to page
const compjs = new CompJS("src/compjs");

const grid1 = new Grid(1);
grid1.addLockIcon()

const grid2 = new Grid(2);
//grid2.addLockIcon()

fetch("src/json/grid-data-1.json")
    .then(response => response.json())
    .then(json => {
        grid1.loadJSON(json)
    })
    .then(() => fetch("src/json/grid-data-2.json"))
    .then(response => response.json())
    .then(json => {
        grid2.loadJSON(json)
    });

