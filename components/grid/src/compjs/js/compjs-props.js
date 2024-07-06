// - CompJS Root path
export const COMPJS_ROOT_PATH = 'src/compjs';

// - Paths that are related with CompJS
export const COMPJS_PATHS = {
    // CSS main stylesheets path
    BASE: `${COMPJS_ROOT_PATH}/css/base.css`,

    // CSS components stylesheet path
    GRID: `${COMPJS_ROOT_PATH}/css/grid.css`,
};
Object.freeze(COMPJS_PATHS);

// - CSS selectors that are related with the CompJS
export const COMPJS_SELECTORS = {
    // Root selector
    ROOT: ":root",

    // Style selector element
    STYLE: "#compjs-style"
};
Object.freeze(COMPJS_SELECTORS);

// - CSS variables name that are related with CompJS
export const COMPJS_VARIABLES = {
    // Font size CSS variables
    FONT_SIZE_H2: '--compjs-font-size-h2',
    FONT_SIZE_H3: '--compjs-font-size-h3',
    FONT_SIZE_H4: '--compjs-font-size-h4',
    FONT_SIZE_TEXT: '--compjs-font-size-text',

    // Icon size CSS variables
    BIG_ICON_SIZE: '--compjs-big-icon-size',
    MEDIUM_ICON_SIZE: '--compjs-medium-icon-size',
    SMALL_ICON_SIZE: '--compjs-small-icon-size',

    // Checkbox size CSS variables
    BIG_CHECKBOX_SIZE: '--compjs-big-checkbox-size',
    MEDIUM_CHECKBOX_SIZE: '--compjs-medium-checkbox-size',
    SMALL_CHECKBOX_SIZE: '--compjs-small-checkbox-size',

    // Margin CSS variables
    HUGE_MARGIN: '--compjs-huge-margin',
    BIG_MARGIN: '--compjs-big-margin',
    MEDIUM_MARGIN: '--compjs-medium-margin',
    SMALL_MARGIN: '--compjs-small-margin',
    MICRO_MARGIN: '--compjs-micro-margin',

    // Gap CSS variables
    BIG_ICON_GAP: '--compjs-big-icon-gap',

    // Padding CSS variables
    HUGE_PADDING: '--compjs-huge-padding',
    BIG_PADDING: '--compjs-big-padding',
    MEDIUM_PADDING: '--compjs-medium-padding',
    SMALL_PADDING: ' --compjs-small-padding',
    MICRO_PADDING: ' --compjs-micro-padding',

    // Border radius CSS variables
    MEDIUM_BORDER_RADIUS: '--compjs-medium-border-radius',

    // Colors CSS variables
    GREY_DARK: '--compjs-grey-dark',
    GREY_MEDIUM: '--compjs-grey-medium',
    GREY_LIGHT: '--compjs-grey-light',

    PRIMARY_DARK: '--compjs-primary-dark',
    PRIMARY_MEDIUM: '--compjs-primary-medium',
    PRIMARY_LIGHT: '--compjs-primary-light',

    // SVG CSS variables
    SVG_STROKE_WIDTH: '--compjs-svg-stroke-width'
};
Object.freeze(COMPJS_VARIABLES);

// - List that contains all values from 'COMPJS_VARIABLES'
export const COMPJS_VARIABLES_LIST = [...Object.values(COMPJS_VARIABLES)];
Object.freeze(COMPJS_VARIABLES_LIST);

// - Class names that are related with CompJS
export const COMPJS_CLASSES = {
    // Utilities class names
    HIDE: "hide",
};
Object.freeze(COMPJS_CLASSES);

// - List that contains all values from 'COMPJS_CLASSES'
export const COMPJS_CLASSES_LIST = [...Object.values(COMPJS_CLASSES)];
Object.freeze(COMPJS_CLASSES_LIST);
