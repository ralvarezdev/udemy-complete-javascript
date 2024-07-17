// - Class names that are related with the grid component
export const GRID_SELECTORS = {
    // Root class name
    ROOT: "grid",

    // Header class names
    HEADER: "grid__header",
    HEADER_ICONS: "grid__header__icons",
    HEADER_ICON_CONTAINER: "grid__header__icon__container",
    HEADER_ICON: "grid__header__icon",
    HEADER_ICON_HIDDEN: "grid__header__icon--hidden",
    HEADER_TITLE: "grid__header__title",
    HEADER_TITLE_WARNING: "grid__header__title--warning",
    HEADER_TITLE_NO_CHECKBOXES: "grid__header__title--no-checkboxes",

    // Icons IDs
    ICON_LOCK: "icon-lock",
    ICON_UNLOCK: "icon-unlock",
    ICON_TRASH: "icon-trash",
    ICON_DOWNLOAD: "icon-download",
    ICON_ADD: "icon-add",

    // Column class names
    BODY: "grid__body",
    BODY_HEADER: "grid__body__header",
    BODY_HEADER_WARNING: "grid__body__header--warning",
    BODY_HEADER_NO_CHECKBOXES: "grid__body__header--no-checkboxes",
    BODY_HEADER_COLUMN: "grid__body__header__column",
    BODY_HEADER_COLUMN_WARNING: "grid__body__header__column--warning",
    BODY_CONTENT: "grid__body__content",
    BODY_CONTENT_DATA: "grid__body__content__data",
    BODY_CONTENT_DATA_PAGE: "grid__body__content__data__page",
    BODY_CONTENT_DATA_PAGE_HIDDEN: "grid__body__content__data__page--hidden",
    BODY_CONTENT_DATA_NO_CHECKBOXES: "grid__body__content__data--no-checkboxes",
    BODY_CONTENT_CHECKBOXES: "grid__body__content__checkboxes",

    // Row class names
    BODY_CONTENT_DATA_PAGE_ROW: "grid__body__content__data__page__row",
    BODY_CONTENT_DATA_PAGE_ROW_WARNING: "grid__body__content__data__page__row--warning",
    BODY_CONTENT_DATA_PAGE_ROW_CELL: "grid__body__content__data__page__row__cell",
    BODY_CONTENT_DATA_PAGE_ROW_CELL_WARNING: "grid__body__content__data__page__row__cell--warning",

    // Footer class names
    FOOTER: "grid__footer",
    FOOTER_PAGINATION: "grid__footer__pagination",
    FOOTER_ICONS: "grid__footer__icons",
};
Object.freeze(GRID_SELECTORS);

// - List that contains all values from 'GRID_SELECTORS'
export const GRID_SELECTORS_LIST = [...Object.values(GRID_SELECTORS)];
Object.freeze(GRID_SELECTORS_LIST);

// - JSON keys that are related with the grid component
export const GRID_JSON = {
    // Grid keys
    COLUMNS: "columns",
    LOCKED: "locked",
    PAGE_SIZE: "pageSize",
    TITLE: "title",
    DATA: "data",

    // Grid column keys
    COLUMN_ID: "columnId",
    COLUMN_DATA:"columnData",
    COLUMN_DATA_TITLE: "title",
    COLUMN_DATA_INDEX: "index",
    COLUMN_DATA_TYPE: "type",
    COLUMN_DATA_NULLABLE:"nullable",
}
Object.freeze(GRID_JSON);