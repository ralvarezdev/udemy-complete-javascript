// - Class names that are related with the grid component
export const GRID_CLASSES = {
    // Root class name
    ROOT: "grid",

    // Header class names
    HEADER: "grid__header",
    HEADER_ICON: "grid__header__icon",
    HEADER_ICONS: "grid__header__icons",
    HEADER_ICONS_LOCK: "grid__header__icons__lock",
    HEADER_TITLE: "grid__header__title",
    HEADER_TITLE_NO_ICONS: "grid__header__title--no-icons",

    // Column class names
    BODY: "grid__body",
    BODY_HEADER: "grid__body__header",
    BODY_HEADER_NO_ICONS: "grid__body__header--no-icons",
    BODY_HEADER_COLUMN: "grid__body__header__column",
    BODY_ICONS: "grid__body__icons",

    // Row class names
    BODY_ROW: "grid__body__row",
    BODY_CELL: "grid__body__row__cell",

    // Footer class names
    FOOTER: "grid__footer",
    FOOTER_PAGINATION: "grid__footer__pagination",
    FOOTER_ICONS: "grid__footer__icons",
};
Object.freeze(GRID_CLASSES);

// - List that contains all values from 'GRID_CLASSES'
export const GRID_CLASSES_LIST = [...Object.values(GRID_CLASSES)];
Object.freeze(GRID_CLASSES_LIST);

// - URLs that are related with the grid component
export const GRID_URLS = {
    // SVG URLs and filenames
    EDIT_SVG: "./src/compjs/svg/edit-2.svg",
    PLUS_SVG: "./src/compjs/svg/plus.svg",

    LOCK_SVG: "./src/compjs/svg/lock.svg",
    UNLOCK_SVG: "./src/compjs/svg/unlock.svg",

    TRASH_SVG: "./src/compjs/svg/trash-2.svg",
    CLOSE_SVG: "./src/compjs/svg/x.svg",

    DOWNLOAD_SVG: "./src/compjs/svg/download.svg"
};
Object.freeze(GRID_URLS);