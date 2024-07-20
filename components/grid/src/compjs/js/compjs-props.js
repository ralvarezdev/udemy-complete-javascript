// - CompJS Root path
export const COMPJS_ROOT_PATH = 'src/compjs';

// - CompJS constants
export const COMPJS_CONSTANTS = {
    VIEW_BOX:'0 0 24 24'
}
Object.freeze(COMPJS_CONSTANTS);

// - Paths that are related with CompJS
export const COMPJS_PATHS = {
    // CSS Root stylesheets path
    ROOT_STYLE: `${COMPJS_ROOT_PATH}/css/compjs-root.css`,

    // CSS CompJS stylesheet path
    COMPJS_STYLE: `${COMPJS_ROOT_PATH}/css/compjs.css`,

    // CSS components stylesheet path
    GRID_STYLE: `${COMPJS_ROOT_PATH}/css/compjs-grid.css`,
};
Object.freeze(COMPJS_PATHS);

// - CSS selectors that are related with the CompJS
export const COMPJS_SELECTORS = {
    // Root selector
    ROOT: ":root",

    // Base element id
    COMPJS: "compjs",

    // Style element id
    STYLE: "compjs-style",

    // Utilities class names
    HIDE: "compjs__hide",

    // Compjs class names
    HIDDEN_SVG_CONTAINER: "compjs__hidden-svg-container",
    HIDDEN_SVG: "compjs__hidden-svg",
    BUTTON: "compjs__button",
    INPUT: "compjs__input",
};
Object.freeze(COMPJS_SELECTORS);

// - CSS variables name that are related with CompJS
export const COMPJS_VARIABLES = {
    // Timing CSS variables
    TRANSITION_FOCUS:'--compjs-transition-focus',
    TRANSITION_FOCUS_DELAY:'--compjs-transition-focus-delay',
    TRANSITION_COLOR:'--compjs-transition-color',
    TRANSITION_COLOR_DELAY:'--compjs-transition-color-delay',
    TRANSITION_TRANSLATE:'--compjs-transition-translate',
    TRANSITION_TRANSLATE_DELAY:'--compjs-transition-translate-delay',

    // Font size CSS variables
    H2_FONT_SIZE: '--compjs-h2-font-size',
    H3_FONT_SIZE: '--compjs-h3-font-size',
    H4_FONT_SIZE: '--compjs-h4-font-size',
    TEXT_FONT_SIZE: '--compjs-text-font-size',

    // Icon size CSS variables
    ICON_BIG_SIZE: '--compjs-icon-big-size',
    ICON_MEDIUM_SIZE: '--compjs-icon-medium-size',
    ICON_SMALL_SIZE: '--compjs-icon-small-size',

    // Button width CSS variables
    BUTTON_BIG_WIDTH: '--compjs-button-big-width',
    BUTTON_MEDIUM_WIDTH: '--compjs-button-medium-width',
    BUTTON_SMALL_WIDTH: '--compjs-button-small-width',

    // Checkbox size CSS variables
    CHECKBOX_BIG_SIZE: '--compjs-checkbox-big-size',
    CHECKBOX_MEDIUM_SIZE: '--compjs-checkbox-medium-size',
    CHECKBOX_SMALL_SIZE: '--compjs-checkbox-small-size',

    // Margin CSS variables
    MARGIN_HUGE_SIZE: '--compjs-margin-huge-size',
    MARGIN_BIG_SIZE: '--compjs-margin-big-size',
    MARGIN_MEDIUM_SIZE: '--compjs-margin-medium-size',
    MARGIN_SMALL_SIZE: '--compjs-margin-small-size',
    MARGIN_MICRO_SIZE: '--compjs-margin-micro-size',

    // Gap CSS variables
    GAP_BIG_SIZE: '--compjs-gap-big-size',
    GAP_MEDIUM_SIZE: '--compjs-gap-medium-size',
    GAP_SMALL_SIZE: '--compjs-gap-small-size',

    // Padding CSS variables
    PADDING_HUGE_SIZE: '--compjs-padding-huge-size',
    PADDING_BIG_SIZE: '--compjs-padding-big-size',
    PADDING_MEDIUM_SIZE: '--compjs-padding-medium-size',
    PADDING_SMALL_SIZE: ' --compjs-padding-small-size',
    PADDING_MICRO_SIZE: ' --compjs-padding-micro-size',

    // Border radius CSS variables
    BORDER_RADIUS_BIG_WIDTH: '--compjs-border-radius-big-width',
    BORDER_RADIUS_MEDIUM_WIDTH: '--compjs-border-radius-medium-width',
    BORDER_RADIUS_SMALL_WIDTH: '--compjs-border-radius-small-width',

    // Border width CSS variables
    BORDER_MEDIUM_WIDTH: '--compjs-border-medium-width',

    // Font weight CSS variables
    BOLD_FONT_WEIGHT: '--compjs-bold-font-weight',

    // Colors CSS variables
    GREY_DARK: '--compjs-grey-dark',
    GREY_MEDIUM: '--compjs-grey-medium',
    GREY_LIGHT: '--compjs-grey-light',

    PRIMARY_COLOR_DARK: '--compjs-primary-color-dark',
    PRIMARY_COLOR_MEDIUM: '--compjs-primary-color-medium',
    PRIMARY_COLOR_LIGHT: '--compjs-primary-color-light',

    WARNING_DARK: '--compjs-warning-dark',
    WARNING_MEDIUM: '--compjs-warning-medium',
    WARNING_LIGHT: '--compjs-warning-light',
};
Object.freeze(COMPJS_VARIABLES);

// - List that contains all values from 'COMPJS_VARIABLES'
export const COMPJS_VARIABLES_LIST = [...Object.values(COMPJS_VARIABLES)];
Object.freeze(COMPJS_VARIABLES_LIST);

// - URLs that are related with the components
export const COMPJS_URLS = {
    // SVG URLs and filenames
    EDIT_SVG: "./src/compjs/svg/edit-2.svg",
    PLUS_SVG: "./src/compjs/svg/plus.svg",

    LOCK_SVG: "./src/compjs/svg/lock.svg",
    UNLOCK_SVG: "./src/compjs/svg/unlock.svg",

    TRASH_SVG: "./src/compjs/svg/trash-2.svg",
    CLOSE_SVG: "./src/compjs/svg/x.svg",

    DOWNLOAD_SVG: "./src/compjs/svg/download.svg"
};
Object.freeze(COMPJS_URLS);

// - URIs that are related with the components
export const COMPJS_URIS= {
    // W3
    SVG_NAMESPACE: 'http://www.w3.org/2000/svg'
}
Object.freeze((COMPJS_URIS))

// - CompJS available data types
export const COMPJS_DATA_TYPES = {
    // Data types
    STRING: "string",
    INTEGER: "int",
    UNSIGNED_INTEGER: "uint",
    DECIMAL: "decimal",
    UNSIGNED_DECIMAL: "udecimal",
    BOOLEAN: "boolean",
    CHAR: "char",
    DATE: "date",
    TIME: "time",
}
Object.freeze(COMPJS_DATA_TYPES);