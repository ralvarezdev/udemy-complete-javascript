// - CompJS Grid properties
export const GRID = Object.freeze({
    // CompJS Grid paths
    PATHS: Object.freeze({
        // CompJS components stylesheet path
        MAIN_STYLE: 'src/compjs/css/compjs-grid.css',
    }),

    // CompJS Grid observers
    OBSERVERS: Object.freeze({
        // Resize observers
        RESIZE: Object.freeze({
            PAGE_ELEMENT: "pageElement",
            PAGE_ROW_ELEMENT: "pageRowElement",
        }),

        // Mutation observers
        MUTATION: Object.freeze({
            TITLE: "title",
            COLUMNS: "columns",
            CELLS: "cells",
        })
    }),

    // CompJS datasets
    DATASETS: Object.freeze({
        PAGE_IDX: "pageIdx",
        ROW_IDX: "pageRowIdx",
        COLUMN_ID: "cellColumnId"
    }),

    // CompJS Grid CSS selectors
    SELECTORS: Object.freeze({
        // Root class name
        ROOT: "compjs__grid",

        // Icons ID
        ICON: Object.freeze({
            LOCK: "compjs__icon-lock",
            UNLOCK: "compjs__icon-unlock",
            REMOVE: "compjs__icon-remove",
            INSERT: "compjs__icon-insert",
            DOWNLOAD: "compjs__icon-download"
        }),

        // Header class names
        HEADER: Object.freeze({
            BASE: "compjs__grid__header",
            BASE_NO_CHECKBOXES: "compjs__grid__header--no-checkboxes",
            ICONS_CONTAINER: "compjs__grid__header__icons-container",
            ICON_CONTAINER: "compjs__grid__header__icon-container",
            ICON_CONTAINER_INSERT: "compjs__grid__header__icon-container--insert",
            ICON_CONTAINER_REMOVE: "compjs__grid__header__icon-container--remove",
            ICON_CONTAINER_EDIT: "compjs__grid__header__icon-container--edit",
            ICON: "compjs__grid__header__icon",
            TITLE_CONTAINER: "compjs__grid__header__title-container",
            TITLE: "compjs__grid__header__title",
            TITLE_WARNING: "compjs__grid__header__title--warning",
        }),

        // Body class names
        BODY: Object.freeze({
            BASE: "compjs__grid__body",

            // Header class names
            HEADER: Object.freeze({
                BASE: "compjs__grid__body__header",
                BASE_WARNING: "compjs__grid__body__header--warning",
                BASE_NO_CHECKBOXES: "compjs__grid__body__header--no-checkboxes",
                COLUMNS_CONTAINER: "compjs__grid__body__header__columns-container",
                COLUMNS_CONTAINER_NO_CHECKBOXES: "compjs__grid__body__header__column-container--no-checkboxes",
                COLUMN: "compjs__grid__body__header__column",
                COLUMN_WARNING: "compjs__grid__body__header__column--warning",
            }),

            // Content class names
            CONTENT: Object.freeze({
                BASE: "compjs__grid__body__content",
                PAGES_CONTAINER: "compjs__grid__body__content__pages-container",
                PAGES_CONTAINER_NO_CHECKBOXES: "compjs__grid__body__content__pages-container--no-checkboxes",
                PAGE: "compjs__grid__body__content__page",
                PAGE_SHOW_LEFT: "compjs__grid__body__content__page--show-from-left",
                PAGE_SHOW_RIGHT: "compjs__grid__body__content__page--show-from-right",
                PAGE_HIDE_LEFT: "compjs__grid__body__content__page--hide-to-left",
                PAGE_HIDE_RIGHT: "compjs__grid__body__content__page--hide-to-right",
                PAGE_ROW: "compjs__grid__body__content__page__row",
                PAGE_ROW_WARNING: "compjs__grid__body__content__page__row--warning",
                PAGE_ROW_CELL: "compjs__grid__body__content__page__row__cell",
                PAGE_ROW_CELL_WARNING: "compjs__grid__body__content__page__row__cell--warning",
                CHECKBOXES_CONTAINER: "compjs__grid__body__content__checkboxes-container",
                CHECKBOX_CONTAINER: "compjs__grid__body__content__checkbox-container",
                CHECKBOX_CONTAINER_WARNING: "compjs__grid__body__content__checkbox-container--warning",
                CHECKBOX: "compjs__grid__body__content__checkbox",
            })
        }),

        // Footer class names
        FOOTER: Object.freeze({
            BASE: "compjs__grid__footer",
            BASE_NO_CHECKBOXES: "compjs__grid__footer--no-checkboxes",
            PAGINATION: "compjs__grid__footer__pagination",
            OUTER_BTN: "compjs__grid__footer__pagination__outer-btn",
            OUTER_BTN_WARNING: "compjs__grid__footer__pagination__outer-btn--warning",
            MIDDLE_BTN_CONTAINER: "compjs__grid__footer__pagination__middle-btn-container",
            MIDDLE_BTN: "compjs__grid__footer__pagination__middle-btn",
            MIDDLE_BTN_WARNING: "compjs__grid__footer__pagination__middle-btn--warning",
            MIDDLE_BTN_ACTIVE: "compjs__grid__footer__pagination__middle-btn--active",
            INNER_BTN_CONTAINER: "compjs__grid__footer__pagination__inner-btn-container",
            INNER_BTN: "compjs__grid__footer__pagination__inner-btn",
            INNER_BTN_WARNING: "compjs__grid__footer__pagination__inner-btn--warning",
            INNER_BTN_ACTIVE: "compjs__grid__footer__pagination__inner-btn--active",
        })
    }),

    // CompJS Grid JSON keys
    JSON: Object.freeze({
        // CompJS Grid keys
        COLUMNS: "columns",
        LOCKED: "locked",
        PAGE_SIZE: "pageSize",
        TITLE: "title",
        DATA: "data",

        // CompJS Grid column keys
        COLUMN: Object.freeze({
            ID: "id",
            TITLE: "title",
            DATA_TYPE: "dataType",
            INDEX: "index",
            NULLABLE: "nullable",
        }),
    })
})