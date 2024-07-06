import {Grid} from "../compjs/js/grid.js";
import {CompJS} from "../compjs/js/compjs.js";
import {COMPJS_VARIABLES} from "../compjs/js/compjs-props.js";


// Add grid to page
const compjs = new CompJS("src/compjs");
const grid = new Grid(1);
grid.addLockIcon()

fetch("src/json/grid-data.json")
    .then(response => response.json())
    .then(json => grid.loadJSON(json));
