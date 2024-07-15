'use strict';

import {COMPJS_CONSTANTS,COMPJS_PATHS, COMPJS_SELECTORS, COMPJS_URLS} from "./compjs-props.js";
import {CompJS} from "./compjs.js";
import {GRID_SELECTORS, GRID_SELECTORS_LIST} from "./grid-props.js";
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
    #HEADER_ICONS;
    #BODY;
    #BODY_HEADER;
    #BODY_CONTENT
    #BODY_CONTENT_DATA
    #BODY_CONTENT_CHECKBOXES

    // Body content data pages map that contains the given page element (key) and its height (value)
    #BODY_CONTENT_DATA_PAGES

    // List that contains the page element with the maximum height
    #MAX_HEIGHT_ELEMENT = null

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
        Grid.#COMPJS.setCompJSElementID(this.#ROOT,rootId);

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

        if (this.#HAS_LOCK)
            this.addLockIcon()
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

        this.#updateBodyHeader();
    }

    addLockIcon() {
        if (this.#HAS_LOCK)
            return;

        this.#HAS_LOCK = true

        // Icons
        this.#HEADER_ICONS = Grid.#COMPJS.createElement("div", this.#HEADER, GRID_SELECTORS.HEADER_ICONS);

        // Lock icons
        const headerIconLockContainer = Grid.#COMPJS.createElement("div", this.#HEADER_ICONS, GRID_SELECTORS.HEADER_ICON_CONTAINER);

        // Load lock SVG click event function
        headerIconLockContainer.addEventListener('click', event => {
            event.preventDefault();

            this.#LOCK_STATUS = !this.#LOCK_STATUS;
            for (let className of [GRID_SELECTORS.HEADER_ICON_HIDDEN, COMPJS_SELECTORS.HIDE])
                headerIconLockContainer.childNodes.forEach(child =>child.classList.toggle(className))
        })

        Grid.#COMPJS.loadHiddenSVG(COMPJS_URLS.UNLOCK_SVG,COMPJS_CONSTANTS.VIEW_BOX, GRID_SELECTORS.ICON_UNLOCK)
            .then(r=>{
                console.log(r)

                const svgElement=Grid.#COMPJS.loadSVG(headerIconLockContainer, GRID_SELECTORS.ICON_UNLOCK, GRID_SELECTORS.HEADER_ICON)

                if(this.#LOCK_STATUS)
                    Grid.#COMPJS.addClassNames(svgElement, COMPJS_SELECTORS.HIDE, GRID_SELECTORS.HEADER_ICON_HIDDEN)
            })
            .catch(err=>console.log(err))

        Grid.#COMPJS.loadHiddenSVG(COMPJS_URLS.LOCK_SVG,COMPJS_CONSTANTS.VIEW_BOX, GRID_SELECTORS.ICON_LOCK)
            .then(r=>{
                console.log(r)

                const svgElement=Grid.#COMPJS.loadSVG(headerIconLockContainer, GRID_SELECTORS.ICON_LOCK, GRID_SELECTORS.HEADER_ICON)

                if(!this.#LOCK_STATUS)
                    Grid.#COMPJS.addClassNames(svgElement, COMPJS_SELECTORS.HIDE, GRID_SELECTORS.HEADER_ICON_HIDDEN)
            })
            .catch(err=>console.log(err))
    }

    addTrashIcon() {
        if (this.#HAS_TRASH)
            return;

        this.#HAS_TRASH = true

        // Root
        this.#ROOT.classList.remove(GRID_SELECTORS.ROOT_NO_TRASH);
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
        this.#BODY_CONTENT_DATA_PAGES = new Map()

        // Page element resize observer callback
        const pageElementResizeObserverCallback=entries => {
            for (let entry of entries) {
                let maxHeight
                const height=Grid.#COMPJS.getElementTotalHeight(entry.target)
                const isNull=this.#MAX_HEIGHT_ELEMENT===null

                if(!isNull)
                    maxHeight = this.#getBodyContentDataPageHeight(this.#MAX_HEIGHT_ELEMENT)

                if (isNull||height > maxHeight) {
                    // Update page element with the maximum height
                    this.#MAX_HEIGHT_ELEMENT =entry.target

                    // Update body content data page height
                    this.#BODY_CONTENT_DATA_PAGES.set(this.#MAX_HEIGHT_ELEMENT,height)

                    this.#resizeBodyContent()
                    continue
                }

                if(height===maxHeight)
                    continue

                if(entry.target===this.#MAX_HEIGHT_ELEMENT){
                    // Update body content data page height
                    this.#BODY_CONTENT_DATA_PAGES.set(this.#MAX_HEIGHT_ELEMENT,height)

                    // Update page element with the maximum height
                        for(let [element, height] of this.#BODY_CONTENT_DATA_PAGES.entries())
                            if(height>maxHeight) {
                                this.#MAX_HEIGHT_ELEMENT = element
                                maxHeight=height
                            }

                        this.#resizeBodyContent()
                }
            }}

        // Get total height size in rems
        for (let i = 0; i < this.#DATA.length; i += this.#PAGE_SIZE) {
            const pageElement = Grid.#COMPJS.createElement("div", this.#BODY_CONTENT_DATA, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE, COMPJS_SELECTORS.HIDE, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_HIDDEN);
            const pageIdx = Math.floor(i / this.#PAGE_SIZE)
            this.#BODY_CONTENT_DATA_PAGES.set(pageElement,Grid.#COMPJS.getElementTotalHeight(pageElement))

            // Remove hide class from current page
            if (pageIdx === this.#CURRENT_PAGE)
                pageElement.classList.remove(COMPJS_SELECTORS.HIDE, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_HIDDEN)

            // Add resize observer
            const pageElementResizeObserver= new ResizeObserver(pageElementResizeObserverCallback)
            pageElementResizeObserver.observe(pageElement)

            for (let j = i; j < i + this.#PAGE_SIZE; j++)
                if (j < this.#DATA.length)
                    this.#updateBodyContentDataRow(pageElement, j)
        }
    }

    #getBodyContentDataPageHeight(element) {
        return this.#BODY_CONTENT_DATA_PAGES.get(element)}

    #resizeBodyContent() {
        const maxHeight=this.#getBodyContentDataPageHeight(this.#MAX_HEIGHT_ELEMENT)
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