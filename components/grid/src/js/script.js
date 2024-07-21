import {CompJSGrid} from "../compjs/js/compjs-grid.js";
import {CompJS} from "../compjs/js/compjs.js";
import {COMPJS_SELECTORS, COMPJS_VARIABLES} from "../compjs/js/compjs-props.js";


// Add grid to page
const compjs = new CompJS("src/compjs");

const grid1 = new CompJSGrid(1);
const grid2 = new CompJSGrid(2);

/*
grid1.setGridIdProperty(COMPJS_VARIABLES.PRIMARY_COLOR_DARK, "#333")
compjs.applyStyles()
 */

fetch("src/json/grid-data-1.json")
    .then(response => response.json())
    .then(json => grid1.loadJSON(json))
    .then(() => {grid1.addIcons()
    })
    .then(() => fetch("src/json/grid-data-2.json"))
    .then(response => response.json())
    .then(json => grid2.loadJSON(json))
    .then(() => grid2.addIcons())
    .catch(error => console.error(error));

