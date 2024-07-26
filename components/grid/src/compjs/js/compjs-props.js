// - CompJS properties
export const COMPJS = Object.freeze({
    // CompJS paths
    PATHS: Object.freeze({
        // CompJS root path
        ROOT: 'src/compjs',

        // CompJS CSS stylesheet path
        MAIN_STYLE: 'src/compjs/css/compjs.css',
    }),

    // CompJS available data types
    DATA_TYPES: Object.freeze({
        STRING: Object.freeze({
            NAME: "string",
            REGEXP: /^.*$/
        }),

        INTEGER: Object.freeze({
            NAME: "int",
            REGEXP: /^[-+]?[0-9]+$/
        }),

        UNSIGNED_INTEGER: Object.freeze({
            NAME: "uint",
            REGEXP: /^[0-9]+$/
        }),

        DECIMAL: Object.freeze({
            NAME: "decimal",
            REGEXP: /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/
        }),

        UNSIGNED_DECIMAL: Object.freeze({
            NAME: "udecimal",
            REGEXP: /^[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/
        }),

        BOOLEAN: Object.freeze({
            NAME: "boolean",
            REGEXP: /^(true|false)$/
        }),

        CHAR: Object.freeze({
            NAME: "char",
            REGEXP: /^.$/
        }),

        DATE: Object.freeze({
            NAME: "date",
            REGEXP: /^\d{4}-\d{2}-\d{2}$/
        }),

        TIME: Object.freeze({
            NAME: "time",
            REGEXP: /^\d{2}:\d{2}:\d{2}$/
        })
    }),

    // CompJS delays
    DELAYS: Object.freeze({
        // Animation delay on page load
        LOAD: 700,
        CLICK: 200,
    }),

    // CompJS attributes
    ATTRIBUTES: Object.freeze({
        // Icon view box
        VIEW_BOX: '0 0 24 24',
    }),

    // CompJS CSS variables name
    VARIABLES: Object.freeze({
        // Transition timings
        TRANSITIONS: Object.freeze({
            FOCUS: '--compjs-transition-focus-duration',
            FOCUS_DELAY: '--compjs-transition-focus-delay',
            COLOR: '--compjs-transition-color-duration',
            COLOR_DELAY: '--compjs-transition-color-delay',
            TRANSLATE: '--compjs-transition-translate-duration',
            TRANSLATE_DELAY: '--compjs-transition-translate-delay',
            SCALE: '--compjs-transition-scale-duration',
            SCALE_DELAY: '--compjs-transition-scale-delay',
        }),

        // Font sizes
        FONT_SIZES: Object.freeze({

            H2: '--compjs-h2-font-size',
            H3: '--compjs-h3-font-size',
            H4: '--compjs-h4-font-size',
            TEXT: '--compjs-text-font-size',
        }),

        // Font weights
        FONT_WEIGHTS: Object.freeze({
            BOLD: '--compjs-bold-font-weight',
        }),

        // Icon sizes
        ICON_SIZES: Object.freeze({
            BIG: '--compjs-icon-big-size',
            MEDIUM: '--compjs-icon-medium-size',
            SMALL: '--compjs-icon-small-size',
        }),

        // Button widths
        BUTTON_WIDTHS: Object.freeze({
            BIG: '--compjs-button-big-width',
            MEDIUM: '--compjs-button-medium-width',
            SMALL: '--compjs-button-small-width',
        }),

        // Radio sizes
        RADIO_SIZES: Object.freeze({
            BIG: '--compjs-radio-big-size',
            MEDIUM: '--compjs-radio-medium-size',
            SMALL: '--compjs-radio-small-size',
        }),

        // Checkbox sizes
        CHECKBOX_SIZES: Object.freeze({
            BIG: '--compjs-checkbox-big-size',
            MEDIUM: '--compjs-checkbox-medium-size',
            SMALL: '--compjs-checkbox-small-size',
        }),

        // Margin sizes
        MARGIN_SIZES: Object.freeze({
            HUGE: '--compjs-margin-huge-size',
            BIG: '--compjs-margin-big-size',
            MEDIUM: '--compjs-margin-medium-size',
            SMALL: '--compjs-margin-small-size',
            MICRO: '--compjs-margin-micro-size',
        }),

        // Gap sizes
        GAP_SIZES: Object.freeze({
            HUGE: '--compjs-gap-huge-size',
            BIG: '--compjs-gap-big-size',
            MEDIUM: '--compjs-gap-medium-size',
            SMALL: '--compjs-gap-small-size',
            MICRO: '--compjs-gap-micro-size',
        }),

        // Padding sizes
        PADDING_SIZES: Object.freeze({
            HUGE: '--compjs-padding-huge-size',
            BIG: '--compjs-padding-big-size',
            MEDIUM: '--compjs-padding-medium-size',
            SMALL: ' --compjs-padding-small-size',
            MICRO: ' --compjs-padding-micro-size',
            TINY: ' --compjs-padding-tiny-size',
        }),

        // Border radius widths
        BORDER_RADIUS_WIDTHS: Object.freeze({
            BIG: '--compjs-border-radius-big-width',
            MEDIUM: '--compjs-border-radius-medium-width',
            SMALL: '--compjs-border-radius-small-width',
        }),

        // Border widths
        BORDER_WIDTHS: Object.freeze({
            HUGE: '--compjs-border-huge-width',
            BIG: '--compjs-border-big-width',
            MEDIUM: '--compjs-border-medium-width',
            SMALL: '--compjs-border-small-width',
            TINY: '--compjs-border-tiny-width',
        }),

        // Colors
        COLORS: Object.freeze({
            // Primary colors
            PRIMARY: Object.freeze({
                DARK: '--compjs-primary-dark',
                MEDIUM: '--compjs-primary-medium',
                LIGHT: '--compjs-primary-light',
            }),

            // Greys
            GREY: Object.freeze({
                DARK: '--compjs-grey-dark',
                MEDIUM: '--compjs-grey-medium',
                LIGHT: '--compjs-grey-light',
            }),

            // Warning colors
            WARNING: Object.freeze({
                DARK: '--compjs-warning-dark',
                MEDIUM: '--compjs-warning-medium',
                LIGHT: '--compjs-warning-light',
            }),
        }),
    }),

    // CompJS CSS selectors
    SELECTORS: Object.freeze({
        // Root selector
        ROOT: ":root",

        // Base element ID
        COMPJS: "compjs",

        // Style element ID
        STYLE: "compjs-style",

        // Utilities class names
        UTILITIES: Object.freeze({
            HIDE: "compjs__hide",
            NO_TRANSITION: "compjs__no-transition",
            NO_TRANSFORM: "compjs__no-transform",
            NO_ANIMATION: "compjs__no-animation",
            PRELOAD: "compjs__preload"
        }),

        // CompJS elements class name
        ELEMENTS: Object.freeze({
            HIDDEN_SVG_CONTAINER: "compjs__hidden-svg-container",
            HIDDEN_SVG: "compjs__hidden-svg",
            BUTTON: "compjs__button",
            INPUT: "compjs__input",
            RADIO: "compjs__radio",
            RADIO_WARNING: "compjs__radio--warning",
            CHECKBOX: "compjs__checkbox",
            CHECKBOX_WARNING: "compjs__checkbox--warning"
        })
    }),

    // CompJS related URLs
    URLS: Object.freeze({
        // SVG URLs and filenames
        SVG: Object.freeze({
            EDIT: "./src/compjs/svg/edit-2.svg",
            PLUS: "./src/compjs/svg/plus.svg",

            LOCK: "./src/compjs/svg/lock.svg",
            UNLOCK: "./src/compjs/svg/unlock.svg",

            TRASH: "./src/compjs/svg/trash-2.svg",
            CLOSE: "./src/compjs/svg/x.svg",

            DOWNLOAD: "./src/compjs/svg/download.svg"
        })
    }),

    // CompJS related URIs
    URIS: Object.freeze({
        // W3 URIs
        NAMESPACES: Object.freeze({
            SVG: 'http://www.w3.org/2000/svg'
        })
    })
})