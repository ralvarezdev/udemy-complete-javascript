// - CompJS Grid constants
export const GRID_CONSTANTS = {
    // Resize observers
    PAGE_ELEMENT_RESIZE_OBSERVER: "pageElementResize",
    ROW_RESIZE_OBSERVER: "currentPageRowResize",

    // Mutation observers
    TITLE_OBSERVER: "title",
    COLUMNS_OBSERVER: "columns",
    CELLS_OBSERVER: "cells",

    // Datasets
    PAGE_IDX: "pageIdx",
    ROW_IDX: "pageRowIdx",
    COLUMN_ID: "cellColumnId",
}
Object.freeze(GRID_CONSTANTS);

// - CompJS Grid CSS selectors
export const GRID_SELECTORS = {
    // Root class name
    ROOT: "compjs__grid",

    // Header class names
    HEADER: "compjs__grid__header",
    HEADER_NO_CHECKBOXES: "compjs__grid__header--no-checkboxes",
    HEADER_ICONS_CONTAINER: "compjs__grid__header__icons-container",
    HEADER_ICON_CONTAINER: "compjs__grid__header__icon-container",
    HEADER_ICON_CONTAINER_INSERT: "compjs__grid__header__icon-container--insert",
    HEADER_ICON_CONTAINER_REMOVE: "compjs__grid__header__icon-container--remove",
    HEADER_ICON_CONTAINER_EDIT: "compjs__grid__header__icon-container--edit",
    HEADER_ICON: "compjs__grid__header__icon",
    HEADER_TITLE_CONTAINER: "compjs__grid__header__title-container",
    HEADER_TITLE: "compjs__grid__header__title",
    HEADER_TITLE_WARNING: "compjs__grid__header__title--warning",

    // Icons ID
    ICON_LOCK: "compjs__icon-lock",
    ICON_UNLOCK: "compjs__icon-unlock",
    ICON_REMOVE: "compjs__icon-remove",
    ICON_INSERT: "compjs__icon-insert",
    ICON_DOWNLOAD: "compjs__icon-download",

    // Body class names
    BODY: "compjs__grid__body",

    // Column class names
    BODY_HEADER: "compjs__grid__body__header",
    BODY_HEADER_WARNING: "compjs__grid__body__header--warning",
    BODY_HEADER_NO_CHECKBOXES: "compjs__grid__body__header--no-checkboxes",
    BODY_HEADER_COLUMNS_CONTAINER: "compjs__grid__body__header__columns-container",
    BODY_HEADER_COLUMNS_CONTAINER_NO_CHECKBOXES: "compjs__grid__body__header__column-container--no-checkboxes",
    BODY_HEADER_COLUMN: "compjs__grid__body__header__column",
    BODY_HEADER_COLUMN_WARNING: "compjs__grid__body__header__column--warning",

    // Content class names
    BODY_CONTENT: "compjs__grid__body__content",
    BODY_CONTENT_PAGES_CONTAINER: "compjs__grid__body__content__pages-container",
    BODY_CONTENT_PAGES_CONTAINER_NO_CHECKBOXES: "compjs__grid__body__content__pages-container--no-checkboxes",
    BODY_CONTENT_PAGE: "compjs__grid__body__content__page",
    BODY_CONTENT_PAGE_SHOW_LEFT: "compjs__grid__body__content__page--show-from-left",
    BODY_CONTENT_PAGE_SHOW_RIGHT: "compjs__grid__body__content__page--show-from-right",
    BODY_CONTENT_PAGE_HIDE_LEFT: "compjs__grid__body__content__page--hide-to-left",
    BODY_CONTENT_PAGE_HIDE_RIGHT: "compjs__grid__body__content__page--hide-to-right",
    BODY_CONTENT_CHECKBOXES_CONTAINER: "compjs__grid__body__content__checkboxes-container",
    BODY_CONTENT_CHECKBOX_CONTAINER: "compjs__grid__body__content__checkbox-container",
    BODY_CONTENT_CHECKBOX_CONTAINER_WARNING: "compjs__grid__body__content__checkbox-container--warning",
    BODY_CONTENT_CHECKBOX: "compjs__grid__body__content__checkbox",

    // Row class names
    BODY_CONTENT_PAGE_ROW: "compjs__grid__body__content__page__row",
    BODY_CONTENT_PAGE_ROW_WARNING: "compjs__grid__body__content__page__row--warning",
    BODY_CONTENT_PAGE_ROW_CELL: "compjs__grid__body__content__page__row__cell",
    BODY_CONTENT_PAGE_ROW_CELL_WARNING: "compjs__grid__body__content__page__row__cell--warning",

    // Footer class names
    FOOTER: "compjs__grid__footer",
    FOOTER_NO_CHECKBOXES: "compjs__grid__footer--no-checkboxes",
    FOOTER_PAGINATION: "compjs__grid__footer__pagination",
    FOOTER_OUTER_BTN: "compjs__grid__footer__pagination__outer-btn",
    FOOTER_OUTER_BTN_WARNING: "compjs__grid__footer__pagination__outer-btn--warning",
    FOOTER_MIDDLE_BTN_CONTAINER: "compjs__grid__footer__pagination__middle-btn-container",
    FOOTER_MIDDLE_BTN: "compjs__grid__footer__pagination__middle-btn",
    FOOTER_MIDDLE_BTN_WARNING: "compjs__grid__footer__pagination__middle-btn--warning",
    FOOTER_MIDDLE_BTN_ACTIVE: "compjs__grid__footer__pagination__middle-btn--active",
    FOOTER_INNER_BTN_CONTAINER: "compjs__grid__footer__pagination__inner-btn-container",
    FOOTER_INNER_BTN: "compjs__grid__footer__pagination__inner-btn",
    FOOTER_INNER_BTN_WARNING: "compjs__grid__footer__pagination__inner-btn--warning",
    FOOTER_INNER_BTN_ACTIVE: "compjs__grid__footer__pagination__inner-btn--active",
};
Object.freeze(GRID_SELECTORS);

// - List that contains all values from 'GRID_SELECTORS'
export const GRID_SELECTORS_LIST = [...Object.values(GRID_SELECTORS)];
Object.freeze(GRID_SELECTORS_LIST);

// - CompJS Grid JSON keys
export const GRID_JSON = {
    // CompJS Grid keys
    COLUMNS: "columns",
    LOCKED: "locked",
    PAGE_SIZE: "pageSize",
    TITLE: "title",
    DATA: "data",

    // CompJS Grid column keys
    COLUMN_ID: "columnId",
    COLUMN_DATA: "columnData",
    COLUMN_DATA_TITLE: "title",
    COLUMN_DATA_INDEX: "index",
    COLUMN_DATA_TYPE: "type",
    COLUMN_DATA_NULLABLE: "nullable",
}
Object.freeze(GRID_JSON);