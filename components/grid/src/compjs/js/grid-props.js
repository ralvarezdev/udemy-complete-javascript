// - Class names that are related with the grid component
export const GRID_SELECTORS = {
    // Root class name
    ROOT: "grid",
    ROOT_NO_TRASH: "grid--no-trash",

    // Header class names
    HEADER: "grid__header",
    HEADER_ICON: "grid__header__icon",
    HEADER_ICON_LOCK: "grid__header__icon--lock",
    HEADER_ICON_LOCK_HIDDEN: "grid__header__icon--lock--hidden",
    HEADER_LEFT_ICONS: "grid__header__left-side-icons",
    HEADER_RIGHT_ICONS: "grid__header__right-side-icons",
    HEADER_LOCK: "grid__header__left-side-icons__lock",
    HEADER_TITLE: "grid__header__title",
    HEADER_TITLE_NO_LOCK: "grid__header__title--no-lock",
    HEADER_TITLE_NO_TRASH: "grid__header__title--no-trash",

    // Column class names
    BODY: "grid__body",
    BODY_HEADER: "grid__body__header",
    BODY_HEADER_COLUMN: "grid__body__header__column",
    BODY_HEADER_NO_LOCK: "grid__body__header--no-lock",
    BODY_HEADER_NO_TRASH: "grid__body__header--no-trash",
    BODY_CONTENT: "grid__body__content",
    BODY_CONTENT_DATA: "grid__body__content__data",
    BODY_CONTENT_DATA_PAGE: "grid__body__content__data__page",
    BODY_CONTENT_DATA_PAGE_HIDDEN: "grid__body__content__data__page--hidden",
    BODY_CONTENT_DATA_NO_LOCK: "grid__body__content__data--no-lock",
    BODY_CONTENT_DATA_NO_TRASH: "grid__body__content__data--no-trash",
    BODY_CONTENT_CHECKBOXES: "grid__body__content__checkboxes",

    // Row class names
    BODY_CONTENT_DATA_PAGE_ROW: "grid__body__content__data__page__row",
    BODY_CONTENT_DATA_PAGE_ROW_CELL: "grid__body__content__data__page__row__cell",

    // Footer class names
    FOOTER: "grid__footer",
    FOOTER_PAGINATION: "grid__footer__pagination",
    FOOTER_ICONS: "grid__footer__icons",
};
Object.freeze(GRID_SELECTORS);

// - List that contains all values from 'GRID_SELECTORS'
export const GRID_SELECTORS_LIST = [...Object.values(GRID_SELECTORS)];
Object.freeze(GRID_SELECTORS_LIST);

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