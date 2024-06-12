import { Grid } from "./grid.js";
import * as compjs from "./compjs.js";

// Add grid to page
const grid = new Grid();

// Testing
compjs.CompJS.setFontSizeValue(compjs.FONT_SIZE_H2, "5rem");
compjs.CompJS.setColorValue(compjs.GREY_DARK, "#100");

compjs.CompJS.applyStyles();
