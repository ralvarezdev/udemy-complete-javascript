'use strict';

import {COMPJS_PATHS, COMPJS_SELECTORS} from "./compjs-props.js";
import {CompJS} from "./compjs.js";
import {GRID_SELECTORS, GRID_SELECTORS_LIST, GRID_URLS} from "./grid-props.js";
import {getListFromObject, getMapFromObject} from "./utils.js";

export class Grid {
    static #COMPJS;
    static #DEFAULT_LOCK_STATUS = false
    static #DEFAULT_HAS_LOCK = false
    static #DEFAULT_HAS_TRASH = false
    static #DEFAULT_HAS_INSERTION = false

    // Element ID
    #ELEMENT_ID;

    // Configuration
    #TITLE = "Grid"
    #LOCK_STATUS = Grid.#DEFAULT_LOCK_STATUS;
    #PAGE_SIZE = 10
    #COLUMNS = []
    #COLUMNS_SORTED_KEYS = []
    #DATA = []

    #HAS_LOCK = Grid.#DEFAULT_HAS_LOCK
    #HAS_TRASH = Grid.#DEFAULT_HAS_TRASH
    #HAS_INSERTION = Grid.#DEFAULT_HAS_INSERTION

    // JSON
    #JSON_COLUMNS = "columns"
    #JSON_LOCKED = "locked"
    #JSON_PAGE_SIZE = "pageSize"
    #JSON_TITLE = "title"

    #JSON_COLUMN_ID = "columnId"
    #JSON_COLUMN_TITLE = "title"
    #JSON_COLUMN_INDEX = "index"
    #JSON_COLUMN_TYPE = "type"

    #JSON_DATA = "data"

    // DOM Elements
    #PARENT_ELEMENT;
    #ROOT;
    #HEADER;
    #HEADER_TITLE;
    #HEADER_LEFT_ICONS;
    #HEADER_RIGHT_ICONS;
    #HEADER_LOCK;
    #HEADER_ICON_UNLOCK;
    #HEADER_ICON_LOCK;
    #BODY;
    #BODY_HEADER;
    #BODY_CONTENT
    #BODY_CONTENT_DATA
    #BODY_CONTENT_DATA_PAGES
    #BODY_CONTENT_CHECKBOXES

    // Pagination
    #NUMBER_PAGES
    #CURRENT_PAGE = 0

    static {
        Grid.#COMPJS = new CompJS();
        Grid.#COMPJS.addStyleSheet(COMPJS_PATHS.GRID);
    }

    constructor(elementId, parentElement) {
        this.#PARENT_ELEMENT = (parentElement === undefined) ? document.body : parentElement;
        this.#ELEMENT_ID = String(elementId)

        // Initialize
        this.mainInitializer(elementId);
    }

    // - Initializers

    // Main initializer
    mainInitializer() {
        // Root
        this.#ROOT = Grid.#COMPJS.createElement("div", this.#PARENT_ELEMENT, GRID_SELECTORS.ROOT);

        // Set root element ID
        const rootId = this.getSelectorWithElementId(GRID_SELECTORS.ROOT);
        Grid.#COMPJS.setElementID(rootId, this.#ROOT);

        if (!this.#HAS_TRASH)
            this.#ROOT.classList.add(GRID_SELECTORS.ROOT_NO_TRASH)

        this.#initializeHeader();
        this.#initializeBody();
    }

    // Header initializer
    #initializeHeader() {
        // Header
        this.#HEADER = Grid.#COMPJS.createElement("div", this.#ROOT, GRID_SELECTORS.HEADER);

        // Title
        this.#HEADER_TITLE = Grid.#COMPJS.createElement("h2", this.#HEADER, GRID_SELECTORS.HEADER_TITLE);
        this.#HEADER_TITLE.innerHTML = String(this.#TITLE);

        // Additional classes
        if (this.#HAS_TRASH)
            this.addTrashIcon()
        else
            this.#HEADER_TITLE.classList.add(GRID_SELECTORS.HEADER_TITLE_NO_TRASH)

        if (this.#HAS_LOCK)
            this.addLockIcon()
        else
            this.#HEADER_TITLE.classList.add(GRID_SELECTORS.HEADER_TITLE_NO_LOCK)
    }

    // Body initializer
    #initializeBody() {
        // Body
        this.#BODY = Grid.#COMPJS.createElement("div", this.#ROOT, GRID_SELECTORS.BODY);
        this.#BODY_HEADER = Grid.#COMPJS.createElement("div", this.#BODY, GRID_SELECTORS.BODY_HEADER);

        const contentSelectorFromId = this.getSelectorWithElementId(GRID_SELECTORS.BODY_CONTENT)
        this.#BODY_CONTENT = Grid.#COMPJS.createElement("div", this.#BODY, GRID_SELECTORS.BODY_CONTENT, contentSelectorFromId);

        const contentDataSelectorFromId = this.getSelectorWithElementId(GRID_SELECTORS.BODY_CONTENT_DATA)
        this.#BODY_CONTENT_DATA = Grid.#COMPJS.createElement("div", this.#BODY_CONTENT, GRID_SELECTORS.BODY_CONTENT_DATA, contentDataSelectorFromId);

        // Additional classes
        if (!this.#HAS_TRASH) {
            this.#BODY_HEADER.classList.add(GRID_SELECTORS.BODY_HEADER_NO_TRASH)
            this.#BODY_CONTENT_DATA.classList.add(GRID_SELECTORS.BODY_CONTENT_DATA_NO_TRASH)
        }

        if (!this.#HAS_LOCK) {
            this.#BODY_HEADER.classList.add(GRID_SELECTORS.BODY_HEADER_NO_LOCK)
            this.#BODY_CONTENT_DATA.classList.add(GRID_SELECTORS.BODY_CONTENT_DATA_NO_LOCK)
        }

        this.#updateBodyHeader();
    }

    addLockIcon() {
        if (this.#HAS_LOCK)
            return;

        this.#HAS_LOCK = true

        // Title
        this.#HEADER_TITLE.classList.remove(GRID_SELECTORS.HEADER_TITLE_NO_LOCK);

        // Body
        this.#BODY_HEADER.classList.remove(GRID_SELECTORS.BODY_HEADER_NO_LOCK)
        this.#BODY_CONTENT_DATA.classList.remove(GRID_SELECTORS.BODY_CONTENT_DATA_NO_LOCK)

        // Icons
        this.#HEADER_LEFT_ICONS = Grid.#COMPJS.createElement("div", this.#HEADER, GRID_SELECTORS.HEADER_LEFT_ICONS);

        // Lock icons
        this.#HEADER_LOCK = Grid.#COMPJS.createElement("div", this.#HEADER_LEFT_ICONS, GRID_SELECTORS.HEADER_LOCK);

        this.#HEADER_ICON_UNLOCK = Grid.#COMPJS.loadSVG(this.#HEADER_LOCK, GRID_URLS.LOCK_SVG, "Lock SVG", GRID_SELECTORS.HEADER_ICON_LOCK);

        this.#HEADER_ICON_LOCK = Grid.#COMPJS.loadSVG(this.#HEADER_LOCK, GRID_URLS.UNLOCK_SVG, "Unlock SVG", GRID_SELECTORS.HEADER_ICON_LOCK, COMPJS_SELECTORS.HIDE, GRID_SELECTORS.HEADER_ICON_LOCK_HIDDEN);

        // Add event listener to lock icons
        for (let icon of [this.#HEADER_ICON_LOCK, this.#HEADER_ICON_UNLOCK])
            icon.addEventListener("click", event => {
                event.preventDefault();

                this.#LOCK_STATUS = !this.#LOCK_STATUS;
                for (let className of [GRID_SELECTORS.HEADER_ICON_LOCK_HIDDEN, COMPJS_SELECTORS.HIDE]) {
                    this.#HEADER_ICON_LOCK.classList.toggle(className);
                    this.#HEADER_ICON_UNLOCK.classList.toggle(className);
                }
            });
    }

    addTrashIcon() {
        if (this.#HAS_TRASH)
            return;

        this.#HAS_TRASH = true

        // Root
        this.#ROOT.classList.remove(GRID_SELECTORS.ROOT_NO_TRASH);

        // Title
        this.#HEADER_TITLE.classList.remove(GRID_SELECTORS.HEADER_TITLE_NO_TRASH);

        // Body
        this.#BODY_HEADER.classList.remove(GRID_SELECTORS.BODY_HEADER_NO_TRASH)
        this.#BODY_CONTENT_DATA.classList.remove(GRID_SELECTORS.BODY_CONTENT_DATA_NO_TRASH)
    }

    // - JSON

    // Read JSON props
    loadJSON(jsonObject) {
        if (!jsonObject instanceof Object)
            throw new Error("JSON Grid is not an object...")

        // Header
        this.#LOCK_STATUS = (jsonObject.locked === undefined) ? this.#LOCK_STATUS : Boolean(jsonObject[this.#JSON_LOCKED]);
        this.#TITLE = (jsonObject.title === undefined) ? this.#TITLE : String(jsonObject[this.#JSON_TITLE]);

        // Data
        this.#PAGE_SIZE = (jsonObject.pageSize === undefined) ? this.#PAGE_SIZE : parseInt(jsonObject[this.#JSON_PAGE_SIZE]);
        this.#COLUMNS = (jsonObject.columns === undefined) ? this.#COLUMNS : this.#loadJSONColumnsData(jsonObject[this.#JSON_COLUMNS]);
        this.#DATA = (jsonObject.data === undefined) ? this.#DATA : this.#loadJSONBodyData(jsonObject[this.#JSON_DATA]);
        this.#sortJSONColumnsKeys();

        // Updates
        this.#updateHeader()
        this.#updateBodyHeader()
        this.#updateBody()
    }

    #loadJSONColumnsData(columnsObject) {
        const columnsMap = getMapFromObject(columnsObject)
        for (let key of columnsMap.keys())
            columnsMap.set(key, getMapFromObject(columnsMap.get(key)))

        return columnsMap
    }

    #loadJSONBodyData(dataObject) {
        const dataList = getListFromObject(dataObject)

        dataList.forEach((dataMap, i) => {
            dataList[i] = getMapFromObject(dataMap)
        })

        return dataList
    }

    #sortJSONColumnsKeys() {
        // Sort JSON Columns Keys
        this.#COLUMNS_SORTED_KEYS = []

        for (let key of this.#COLUMNS.keys())
            this.#COLUMNS_SORTED_KEYS.push(this.#COLUMNS.get(key))

        this.#COLUMNS_SORTED_KEYS.sort((a, b) => a.get(this.#JSON_COLUMN_INDEX) - b.get(this.#JSON_COLUMN_INDEX));
    }

    // Get JSON props
    getJSON() {
        const obj = {}

        // Header
        obj.locked = this.#LOCK_STATUS
        obj.title = this.#TITLE

        // Data
        obj.pageSize = this.#PAGE_SIZE
        obj.columns = this.#COLUMNS
        obj.data = this.#DATA
    }

    // - Updates

    #updateHeader() {
        this.#HEADER_TITLE.innerHTML = String(this.#TITLE);
    }

    #updateBodyHeader() {
        while (this.#BODY_HEADER.firstChild)
            this.#BODY_HEADER.removeChild(this.#BODY_HEADER.firstChild)

        // Set columns' data
        this.#COLUMNS_SORTED_KEYS.forEach(column => {
            const columnElement = Grid.#COMPJS.createElement("div", this.#BODY_HEADER, GRID_SELECTORS.BODY_HEADER_COLUMN);

            columnElement.innerHTML = column.get(this.#JSON_COLUMN_TITLE)
            columnElement.style.order = column.get(this.#JSON_COLUMN_INDEX);
        })
    }

    #updateBody() {
        // Clear rows
        let firstChild = null
        while ((firstChild = this.#BODY_CONTENT_DATA.firstChild))
            this.#BODY_CONTENT_DATA.removeChild(firstChild)

        if (this.#HAS_TRASH)
            while ((firstChild = this.#BODY_CONTENT_CHECKBOXES.firstChild))
                this.#BODY_CONTENT_CHECKBOXES.removeChild(firstChild)

        // Update rows data
        this.#NUMBER_PAGES = Math.floor(this.#DATA.length / this.#PAGE_SIZE)
        this.#BODY_CONTENT_DATA_PAGES = new Array(this.#NUMBER_PAGES)

        // Get total height size in rems
        for (let i = 0; i < this.#DATA.length; i += this.#PAGE_SIZE) {
            const pageElement = Grid.#COMPJS.createElement("div", this.#BODY_CONTENT_DATA, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE, COMPJS_SELECTORS.HIDE, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_HIDDEN);
            const pageIdx = Math.floor(i / this.#PAGE_SIZE)
            this.#BODY_CONTENT_DATA_PAGES[pageIdx] = pageElement

            if (pageIdx === this.#CURRENT_PAGE)
                pageElement.classList.remove(COMPJS_SELECTORS.HIDE, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_HIDDEN)

            for (let j = i; j < i + this.#PAGE_SIZE; j++)
                if (j < this.#DATA.length)
                    this.#updateBodyContentDataRow(pageElement, j)
        }

        let maxHeight = 0

        for (let pageElement of this.#BODY_CONTENT_DATA_PAGES)
            if (pageElement.offsetHeight > maxHeight)
                maxHeight = pageElement.offsetHeight

        const selector = Grid.#COMPJS.getFormattedClassName(GRID_SELECTORS.BODY_CONTENT)
        const pageStyle = Grid.#COMPJS.getCompStyle(selector)

        maxHeight += parseInt(pageStyle.marginTop) + parseInt(pageStyle.marginBottom)

        const remsMaxHeight = Grid.#COMPJS.convertPixelsToRem(maxHeight) + "rem"

        // Set body content data height
        for (let selector of [GRID_SELECTORS.BODY_CONTENT, GRID_SELECTORS.BODY_CONTENT_DATA]) {
            selector = this.getFormattedClassNameWithElementId(selector)
            Grid.#COMPJS.setCompJSSelectorPropertyValue(selector, "height", remsMaxHeight)
        }

        Grid.#COMPJS.applyStyles()
    }

    #updateBodyContentDataRow(pageElement, rowIndex) {
        const rowData = this.#DATA[rowIndex]
        const rowElement = Grid.#COMPJS.createElement("div", pageElement, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW);

        this.#COLUMNS_SORTED_KEYS.forEach(column => {
            const cellElement = Grid.#COMPJS.createElement("div", rowElement, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_CELL);
            cellElement.innerHTML = rowData.get(column.get(this.#JSON_COLUMN_ID));
        })
    }

    // - Utilities

    // Method to check class simple selector
    isGridSelectorValid(selector) {
        // Check if the given class name is valid
        Grid.#COMPJS.checkSelector(selector);

        for (let validSelector of GRID_SELECTORS_LIST)
            if (validSelector === selector)
                return true;

        return false;
    }

    // - Setters and Getters

    // Get selector only valid for this element
    getSelectorWithElementId(selector) {
        return Grid.#COMPJS.getSelectorWithElementId(selector, this.#ELEMENT_ID)
    }

    getFormattedClassNameWithElementId(selector) {
        const selectorWithId = this.getSelectorWithElementId(selector)
        return Grid.#COMPJS.getFormattedClassName(selectorWithId)
    }

    // General methods for getting CSS selectors properties values
    getSelectorPropertiesValues(selector, propertiesName) {
        if (!this.isGridSelectorValid(selector))
            throw new Error(`'${selector}' is an invalid selector name...`);

        return Grid.#COMPJS.getSelectorPropertiesValues(selector, propertiesName);
    }

    getGridPropertiesValues() {
        return this.getSelectorPropertiesValues(GRID_SELECTORS.ROOT, GRID_SELECTORS_LIST);
    }

    // General methods for setting CSS selector properties values
    setSelectorPropertyValue(selector, propertyName, propertyValue) {
        // Check if the given class name is valid
        if (!this.isGridSelectorValid(selector))
            throw new Error(`'${selector}' is an invalid class name...`);

        Grid.#COMPJS.setCompJSSelectorPropertyValue(selector, propertyName, propertyValue);
    }

    setGridSelectorPropertyValue(propertyName, propertyValue) {
        this.setSelectorPropertyValue(GRID_SELECTORS.ROOT, propertyName, propertyValue);
    }

    // Reset applied customized styles
    resetAppliedStyles(selector) {
        Grid.#COMPJS.checkSelector(selector);
        Grid.#COMPJS.resetAppliedStyles(selector);
    }
}