import {CompJSGrid} from "../compjs/js/compjs-grid.js";

// Add grids to page
// const grid1 = new CompJSGrid(1);

const grid2 = new CompJSGrid(2);

/*
grid1.setGridIdProperty(COMPJS_VARIABLES.PRIMARY_COLOR_DARK, "#333")
compjs.applyStyles()
 */

/*
fetch("src/json/grid-data-1.json")
    .then(response => response.json())
    .then(json => grid1.loadJSON(json))
    .then(() =>grid1.addIcons())
    .catch(error => console.error(error));
 */

fetch("src/json/grid-data-2.json")
    .then(response => response.json())
    .then(json => grid2.loadJSON(json))
    .then(() => grid2.addIcons())
    .catch(error => console.error(error));

