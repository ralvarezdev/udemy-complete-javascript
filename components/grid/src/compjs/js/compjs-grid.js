'use strict';

import {COMPJS_CONSTANTS, COMPJS_PATHS, COMPJS_SELECTORS, COMPJS_URLS} from "./compjs-props.js";
import {CompJSElement} from "./compjs-element.js";
import {GRID_SELECTORS, GRID_SELECTORS_LIST, GRID_JSON} from "./compjs-grid-props.js";
import {getListFromObject, getMapFromObject} from "./compjs-utils.js";

export class CompJSGrid extends CompJSElement {
    // Configuration
    #TITLE = "Start creating!"
    #LOCK_STATUS
    #PAGE_SIZE
    #COLUMNS
    #COLUMNS_SORTED_KEYS
    #DATA

    #HAS_LOCK = false
    #HAS_REMOVE = false
    #HAS_INSERTION = false

    // DOM Elements
    #ROOT;
    #HEADER;
    #HEADER_TITLE_CONTAINER;
    #HEADER_TITLE;
    #HEADER_ICONS;
    #HEADER_LOCK_ICON_CONTAINER
    #BODY;
    #BODY_HEADER;
    #BODY_CONTENT
    #BODY_CONTENT_DATA
    #BODY_CONTENT_CHECKBOXES
    #FOOTER
    #FOOTER_PAGINATION

    // Body content data pages map that contains the given page element (key) and its height (value)
    #BODY_CONTENT_DATA_PAGES_HEIGHT

    // List that contains the page element with the maximum height
    #MAX_HEIGHT_ELEMENT = null

    // Datasets
    #PAGE_IDX = "pageIdx"
    #ROW_IDX = "pageRowIdx"
    #COLUMN_ID="cellColumnId"

    // Pagination
    #NUMBER_PAGES = 0
    #CURRENT_PAGE = 0

    // Pagination buttons
    #MIDDLE_BTN_CONTAINER
    #INNER_BTN_CONTAINER
    #FIRST_PAGE_BTN
    #LAST_PAGE_BTN
    #PREVIOUS_BTN
    #NEXT_BTN
    #NUMBER_INNER_BTNS=0
    #PAGE_BTN_OFFSET = 2
    #BTN_START_IDX

    // Empty elements and warning flags
    #GLOBAL_WARNING = false
    #WARNING_COLUMNS = new Map()
    #WARNING_CELLS = new Map()

    // Observers
    #OBSERVERS = new Map()
    #OBSERVERS_OPTIONS = new Map()

    // Resize observers
    #PAGE_ELEMENT_RESIZE_OBSERVER = "pageElementResize"

    // Mutation observers
    #TITLE_OBSERVER = "title"
    #COLUMNS_OBSERVER = "columns"
    #CELLS_OBSERVER = "cells"

    static {
        CompJSElement.CompJS.addStyleSheet(COMPJS_PATHS.GRID_STYLE);
    }

    constructor(elementId, parentElement) {
        super(elementId, parentElement)

        // Set root element
        this.#ROOT = this.createDivWithId(this.parentElement, GRID_SELECTORS.ROOT, GRID_SELECTORS.ROOT,COMPJS_SELECTORS.HIDE, COMPJS_SELECTORS.NO_TRANSITION, COMPJS_SELECTORS.NO_TRANSFORM, COMPJS_SELECTORS.NO_ANIMATION, COMPJS_SELECTORS.PRELOAD);

        // CompJS Grid observers
        this.#initObservers();

        // CompJS Grid elements initialization
        this.#initHeader();
        this.#initBody();
        this.#initFooter();

        // Additional elements
        if (this.#HAS_REMOVE)
            this.addRemoveIcon()

        if (this.#HAS_LOCK)
            this.addLockIcon()
    }

    // - Error handling

    // Throw undefined element error
    _throwUndefinedElementError(elementName) {
        throw new Error(`CompJS Grid ${elementName} element is not defined...`)
    }

    // Throw missing property error
    #throwMissingPropertyError(propertyName) {
        throw new Error(`CompJS Grid ${propertyName} property is not defined...`)
    }

    // Throw missing JSON property error
    #throwMissingJSONPropertyError(propertyName) {
        throw new Error(`JSON CompJS Grid ${propertyName} property is not defined...`)
    }

    // - Events

    // Change current page
    #changePage(toIdx) {
        // Check to page index
        if (toIdx === this.#CURRENT_PAGE)
            return

        if (toIdx >= this.#NUMBER_PAGES)
            toIdx = 0

        else if (toIdx < 0)
            toIdx = this.#NUMBER_PAGES - 1

        // Change of the current pagination active button
        this.#togglePaginationButtonActive()

        // Get page elements
        const currentPageElement = this.#getPageElementByIndex(this.#CURRENT_PAGE)
        const toPageElement = this.#getPageElementByIndex(toIdx)

        // Update current page
        const fromIdx = this.#CURRENT_PAGE
        this.#CURRENT_PAGE = toIdx

        // Update pagination buttons
        this.#updateInnerPageButtons()
        this.#updatePaginationButtonsPage()
        
        // Change of the next pagination active button
        this.#togglePaginationButtonActive()

        currentPageElement.classList.remove(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_SHOW_LEFT, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_SHOW_RIGHT)
        toPageElement.classList.remove
            (GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_HIDE_LEFT, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_HIDE_RIGHT)

        // Change page
        if (toIdx < fromIdx) {
            // Show from left side
            currentPageElement.classList.add(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_HIDE_RIGHT)
            toPageElement.classList.add(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_SHOW_LEFT)
            return
        }

        // Show from right side
        currentPageElement.classList.add(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_HIDE_LEFT)
        toPageElement.classList.add(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_SHOW_RIGHT)
    }

    // Show grid
    #showGrid() {
        // Remove preload class
        this.#ROOT.classList.remove(COMPJS_SELECTORS.NO_TRANSITION, COMPJS_SELECTORS.NO_TRANSFORM, COMPJS_SELECTORS.NO_ANIMATION,COMPJS_SELECTORS.HIDE)

        // Sleep for a while to prevent animations on page load
        this.CompJS.sleep(COMPJS_CONSTANTS.LOAD_DELAY).then(()=> this.#ROOT.classList.remove(COMPJS_SELECTORS.PRELOAD))
    }

    // - Element initializers

    // Header initializer
    #initHeader() {
        // Header
        this.#HEADER = this.CompJS.createDiv(this.#ROOT, GRID_SELECTORS.HEADER, GRID_SELECTORS.HEADER_NO_CHECKBOXES);

        // Title
        this.#HEADER_TITLE_CONTAINER = this.CompJS.createDiv(this.#HEADER, GRID_SELECTORS.HEADER_TITLE_CONTAINER);

        this.#HEADER_TITLE = this.CompJS.createElement("h2", this.#HEADER_TITLE_CONTAINER, GRID_SELECTORS.HEADER_TITLE);
        this.#HEADER_TITLE.contentEditable = this.isContentEditable()        
        
        // Icons
        this.#HEADER_ICONS = this.CompJS.createDiv(this.#HEADER, GRID_SELECTORS.HEADER_ICONS);
    }

    // Body initializer
    #initBody() {
        // Body
        this.#BODY = this.CompJS.createDiv(this.#ROOT, GRID_SELECTORS.BODY);
        this.#BODY_HEADER = this.CompJS.createDiv(this.#BODY, GRID_SELECTORS.BODY_HEADER, GRID_SELECTORS.BODY_HEADER_NO_CHECKBOXES);

        // Body content
        this.#BODY_CONTENT = this.createDivWithId(this.#BODY, GRID_SELECTORS.BODY_CONTENT, GRID_SELECTORS.BODY_CONTENT);

        // Body content data
        this.#BODY_CONTENT_DATA = this.createDivWithId(this.#BODY_CONTENT, GRID_SELECTORS.BODY_CONTENT_DATA, GRID_SELECTORS.BODY_CONTENT_DATA, GRID_SELECTORS.BODY_CONTENT_DATA_NO_CHECKBOXES);

        // Add observers
        this.#addMutationObserverToElement(this.#HEADER_TITLE, this.#TITLE_OBSERVER)
        this.#addMutationObserverToElement(this.#BODY_HEADER, this.#COLUMNS_OBSERVER)
        this.#addMutationObserverToElement(this.#BODY_CONTENT_DATA, this.#CELLS_OBSERVER)
    }

    // Footer initializer
    #initFooter() {
        // Footer
        this.#FOOTER = this.CompJS.createDiv(this.#ROOT, GRID_SELECTORS.FOOTER, GRID_SELECTORS.FOOTER_NO_CHECKBOXES, COMPJS_SELECTORS.HIDE);

        // Pagination
        this.#FOOTER_PAGINATION = this.CompJS.createDiv(this.#FOOTER, GRID_SELECTORS.FOOTER_PAGINATION);

        // Previous and next buttons
        this.#PREVIOUS_BTN = this.CompJS.createButton(this.#FOOTER_PAGINATION, GRID_SELECTORS.FOOTER_OUTER_BTN);
        this.#setPaginationButtonPageContent(this.#PREVIOUS_BTN, "Previous")
        this.#setPreviousPageButtonPage()

        // Next button
        this.#NEXT_BTN = this.CompJS.createButton(this.#FOOTER_PAGINATION, GRID_SELECTORS.FOOTER_OUTER_BTN);
        this.#setPaginationButtonPageContent(this.#NEXT_BTN, "Next")
        this.#setNextPageButtonPage()

        // Middle buttons container
        this.#MIDDLE_BTN_CONTAINER = this.CompJS.createDiv(this.#FOOTER_PAGINATION, GRID_SELECTORS.FOOTER_MIDDLE_BTN_CONTAINER);

        // First page and last page buttons
        this.#FIRST_PAGE_BTN = this.CompJS.createButton(this.#MIDDLE_BTN_CONTAINER, GRID_SELECTORS.FOOTER_MIDDLE_BTN, GRID_SELECTORS.FOOTER_MIDDLE_BTN_ACTIVE)
        this.#setPaginationButtonPage(this.#FIRST_PAGE_BTN, 0)
        this.#setPaginationButtonPageContent(this.#FIRST_PAGE_BTN, 1)

        this.#LAST_PAGE_BTN = this.CompJS.createButton(this.#MIDDLE_BTN_CONTAINER, GRID_SELECTORS.FOOTER_MIDDLE_BTN)

        // Add pagination buttons click event
        this.#addPaginationButtonClickEvent(this.#PREVIOUS_BTN, this.#NEXT_BTN, this.#FIRST_PAGE_BTN,this.#LAST_PAGE_BTN)
    }

    // - Updates

    // Update header element
    #updateHeader() {
        if (this.#TITLE === undefined)
            this.#throwMissingPropertyError("title")

        if (!this.#TITLE.length)
            this.#toggleWarnings()

        // Title
        this.#HEADER_TITLE.innerHTML = String(this.#TITLE);
        this.#HEADER_TITLE.contentEditable = this.isContentEditable()
    }

    // Update body header element
    #updateBodyHeader() {
        while (this.#BODY_HEADER.firstChild)
            this.#BODY_HEADER.removeChild(this.#BODY_HEADER.firstChild)

        if (!this.#COLUMNS_SORTED_KEYS)
            throw new Error("JSON CompJS Grid columns property is not defined...")

        // Set columns' data
        this.#COLUMNS_SORTED_KEYS.forEach(([key, dataMap]) => {
            const columnElement = this.CompJS.createDiv(this.#BODY_HEADER, GRID_SELECTORS.BODY_HEADER_COLUMN);

            columnElement.dataset[GRID_JSON.COLUMN_DATA_TYPE] = dataMap.get(GRID_JSON.COLUMN_DATA_TYPE)
            columnElement.dataset[GRID_JSON.COLUMN_ID] = key

            const columnTitle = dataMap.get(GRID_JSON.COLUMN_DATA_TITLE)

            if (columnTitle.length)
                columnElement.innerHTML = columnTitle;

            else
                this.#toggleColumnWarning(columnElement)

            columnElement.style.order = dataMap.get(GRID_JSON.COLUMN_DATA_INDEX);
        })
    }

    // Update body element
    #updateBody() {
        // Clear rows
        this.#disconnectPageElementResizeObserver()
        let firstChild

        if (this.#BODY_CONTENT_DATA !== undefined)
            while ((firstChild = this.#BODY_CONTENT_DATA.firstChild))
                this.#BODY_CONTENT_DATA.removeChild(firstChild)

        if (!this.#HAS_REMOVE && this.#BODY_CONTENT_CHECKBOXES !== undefined)
            while ((firstChild = this.#BODY_CONTENT_CHECKBOXES.firstChild))
                this.#BODY_CONTENT_CHECKBOXES.removeChild(firstChild)

        if (this.#PAGE_SIZE === undefined)
            this.#throwMissingPropertyError("page size")

        if (this.#DATA === undefined)
            this.#throwMissingPropertyError("data")

        // Update rows data
        this.#NUMBER_PAGES = 0
        this.#BODY_CONTENT_DATA_PAGES_HEIGHT = new Map()

        // Get total height size in rems
        const totalPages= this.#DATA.length/this.#PAGE_SIZE+(this.#DATA.length%this.#PAGE_SIZE>0?1:0)
        for (let pageNumber=0; pageNumber < totalPages;  pageNumber ++) {
            const pageElement =this.#addBodyContentPage()
            this.#addBodyContentPageRows(pageElement, pageNumber)
        }
    }

    // Add body content page element
    #addBodyContentPage(){
        // Create page element
        const pageNumber= this.#NUMBER_PAGES++
        const pageElement = this.CompJS.createDiv(this.#BODY_CONTENT_DATA, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_HIDE_RIGHT);

        // Set page element index
        this.#setPageElementIndex(pageElement,pageNumber)

        // Set page height
        this.#BODY_CONTENT_DATA_PAGES_HEIGHT.set(pageElement, this.CompJS.getElementTotalHeight(pageElement))

        // Remove hide class from current page
        if (pageNumber === this.#CURRENT_PAGE)
            pageElement.classList.remove(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_HIDE_RIGHT)

        // Add observer
        this.#addResizeObserverToElement(pageElement, this.#PAGE_ELEMENT_RESIZE_OBSERVER)

        return pageElement
    }

    // Add body content page element rows
    #addBodyContentPageRows(pageElement, pageNumber) {
        let rowIndex=pageNumber*this.#PAGE_SIZE

        for (let i=0;i<this.#PAGE_SIZE&& rowIndex<this.#DATA.length; rowIndex++,i++)
            this.#addBodyContentDataRow(pageElement, rowIndex)
    }

    // Add body content data row
    #addBodyContentDataRow(pageElement, rowIndex) {
        // Get row data and create row element
        const rowData = this.#DATA[rowIndex]
        const rowElement = this.CompJS.createDiv(pageElement, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW);

        // Set row element index and add data cells
        this.#setPageRowElementIndex(rowElement, rowIndex)
        this.#addBodyContentDataCells(rowElement, rowData)
    }

    // Add body content data row cells
    #addBodyContentDataCells(rowElement, rowData) {
        this.#COLUMNS_SORTED_KEYS.forEach(([key, dataMap]) => {
            const cellElement = this.CompJS.createDiv(rowElement, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_CELL);
            this.#setCellElementColumnId(cellElement, key)

            if(rowData) {
                const cellData = rowData.get(key)
                if (cellData !== undefined)
                    cellElement.innerHTML = cellData;

                else if (!dataMap.get(GRID_JSON.COLUMN_DATA_NULLABLE))
                    this.#toggleCellWarning(cellElement)
            }
        })
    }

    // Resize body content element according to its child elements
    #resizeBodyContent() {
        const maxHeight = this.#getBodyContentDataPageHeight(this.#MAX_HEIGHT_ELEMENT)
        const remsMaxHeight = this.CompJS.convertPixelsToRem(maxHeight) + "rem"

        // Set body content data height
        for (let className of [GRID_SELECTORS.BODY_CONTENT, GRID_SELECTORS.BODY_CONTENT_DATA]) {
            const id = this.getFormattedIdFromSelector(className)
            this.setIdProperty(id, "height", remsMaxHeight)
        }

        this.CompJS.applyStyles()
    }

    // Update footer
    #updateFooter() {
        if (this.#NUMBER_PAGES === 1) {
            this.#FOOTER.classList.add(COMPJS_SELECTORS.HIDE)
            return
        }

        if (this.#INNER_BTN_CONTAINER !== undefined)
            this.#INNER_BTN_CONTAINER.remove()

        // Add page buttons
        if (this.#NUMBER_PAGES > 2) 
            this.#updateInnerPageButtons()

            // Update pagination buttons page
        this.#updatePaginationButtonsPage()

        // Remove hide class from footer
        this.#FOOTER.classList.remove(COMPJS_SELECTORS.HIDE)
    }
    
    // Update inner pagination buttons
    #updateInnerPageButtons() {
        if(this.#NUMBER_PAGES<=2)
            return

        // Page button container
        if(this.#INNER_BTN_CONTAINER === undefined)
            this.#INNER_BTN_CONTAINER = this.CompJS.createDiv(this.#MIDDLE_BTN_CONTAINER, GRID_SELECTORS.FOOTER_INNER_BTN_CONTAINER)

        const numberButtons= 2*this.#PAGE_BTN_OFFSET+1< this.#NUMBER_PAGES-2 ? 2*this.#PAGE_BTN_OFFSET+1: this.#NUMBER_PAGES-2
        
        // Add inner buttons, if needed
        for (;this.#NUMBER_INNER_BTNS < numberButtons; this.#NUMBER_INNER_BTNS++) {
            const paginationButton=this.CompJS.createButton(this.#INNER_BTN_CONTAINER, GRID_SELECTORS.FOOTER_INNER_BTN);
            this.#addPaginationButtonClickEvent(paginationButton)
        }
    }

    // Update pagination buttons range
    #updatePaginationButtonsRange() {
        if(this.#NUMBER_PAGES-2<=2*this.#PAGE_BTN_OFFSET+1){
            this.#BTN_START_IDX=1
    return}

        this.#BTN_START_IDX = this.#CURRENT_PAGE - this.#PAGE_BTN_OFFSET
        if (this.#BTN_START_IDX < 1)
            this.#BTN_START_IDX = 1

        else if(this.#CURRENT_PAGE + this.#PAGE_BTN_OFFSET >= this.#NUMBER_PAGES - 1)
            this.#BTN_START_IDX = this.#NUMBER_PAGES - 2 * this.#PAGE_BTN_OFFSET-2
    }
    
    // Update outer pagination buttons page
    #updatePaginationOuterButtonsPage() {
        this.#setPreviousPageButtonPage()
        this.#setNextPageButtonPage()
    }

    // Update middle pagination buttons page
    #updatePaginationMiddleButtonsPage() {
        this.#setPaginationButtonPage(this.#LAST_PAGE_BTN, this.#NUMBER_PAGES - 1)
        this.#setPaginationButtonPageContent(this.#LAST_PAGE_BTN, this.#NUMBER_PAGES)
    }

    // Update inner pagination buttons page
    #updatePaginationInnerButtonsPage() {
        if (this.#NUMBER_PAGES <= 2)
            return

        this.#updatePaginationButtonsRange()
        let i = this.#BTN_START_IDX

        for (const paginationButton of this.#INNER_BTN_CONTAINER.childNodes) {
            this.#setPaginationButtonPage(paginationButton, i++)
            this.#setPaginationButtonPageContent(paginationButton, i)
        }
    }
    
    // Update pagination buttons page
    #updatePaginationButtonsPage() {
        this.#updatePaginationOuterButtonsPage()
        this.#updatePaginationMiddleButtonsPage()
        this.#updatePaginationInnerButtonsPage()
    }

    // - JSON

    // Load JSON props
    async loadJSON(jsonObject) {
        if (!jsonObject instanceof Object)
            throw new Error("JSON is not an object...")

        // Header
        this.#LOCK_STATUS = Boolean(jsonObject[GRID_JSON.LOCKED]);
        this.#TITLE = String(jsonObject[GRID_JSON.TITLE]);

        // Data
        this.#PAGE_SIZE = parseInt(jsonObject[GRID_JSON.PAGE_SIZE]);
        this.#COLUMNS = this.#loadJSONColumnsData(jsonObject[GRID_JSON.COLUMNS]);
        this.#DATA = this.#loadJSONBodyData(jsonObject[GRID_JSON.DATA]);

        // Sort columns keys
        this.#sortJSONColumnsKeys();

        // Update elements
        this.#updateHeader()
        this.#updateBodyHeader()
        this.#updateBody()
        this.#updateFooter()

        // Show grid component
        this.#showGrid()
    }

    // Load JSON body data
    #loadJSONBodyData(dataObject) {
        const dataList = getListFromObject(dataObject)

        dataList.forEach((dataMap, i) => {
            dataList[i] = getMapFromObject(dataMap)
        })

        return dataList
    }

    // Load JSON columns data
    #loadJSONColumnsData(columnsObject) {
        const columnsList = getListFromObject(columnsObject)
        const columnsMap = new Map()
        const requiredProps = [[GRID_JSON.COLUMN_DATA_INDEX, "index"], [GRID_JSON.COLUMN_DATA_TITLE, "title"], [GRID_JSON.COLUMN_DATA_TYPE, "type"], [GRID_JSON.COLUMN_DATA_NULLABLE, "nullable"]]
        let key, data, dataMap

        for (let columnMap of columnsList) {
            key = columnMap[GRID_JSON.COLUMN_ID]
            if (!key)
                this.#throwMissingJSONPropertyError("ID")

            data = columnMap[GRID_JSON.COLUMN_DATA]
            if (!data)
                this.#throwMissingJSONPropertyError("data")

            dataMap = getMapFromObject(data)

            // Check for required properties
            requiredProps.forEach(([prop, propName]) => {
                if (!dataMap.has(prop))
                    this.#throwMissingJSONPropertyError(propName)
            })

            columnsMap.set(key, dataMap)
        }

        return columnsMap
    }

    // Sort JSON Columns Keys
    #sortJSONColumnsKeys() {
        this.#COLUMNS_SORTED_KEYS = []

        for (let key of this.#COLUMNS.keys())
            this.#COLUMNS_SORTED_KEYS.push([key, this.#COLUMNS.get(key)])

        this.#COLUMNS_SORTED_KEYS.sort((a, b) => a[1].get(GRID_JSON.COLUMN_DATA_INDEX) - b[1].get(GRID_JSON.COLUMN_DATA_INDEX));
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

    // - Grid properties getters

    // Get grid root class properties values
    getGridProperties() {
        return this.getSelectorProperties(GRID_SELECTORS.ROOT, ...GRID_SELECTORS_LIST);
    }

    // Get grid root class properties values to the given element ID
    getGridIdProperties() {
        return this.getSelectorProperties(GRID_SELECTORS.ROOT, ...GRID_SELECTORS_LIST);
    }

    // - Element getters

    // Get body content data page height
    #getBodyContentDataPageHeight(element) {
        if (!this.#BODY_CONTENT_DATA_PAGES_HEIGHT.has(element))
            this._throwUndefinedElementError("page")

        return this.#BODY_CONTENT_DATA_PAGES_HEIGHT.get(element)
    }

    // Get body header columns
    _getBodyHeaderColumns() {
        const className = this.CompJS.getFormattedClassName(GRID_SELECTORS.BODY_HEADER_COLUMN)
        return this._querySelectorAll(this.#BODY_HEADER, "body header", className)
    }

    // Get body content data rows
    #getBodyContentDataRows() {
        const className = this.CompJS.getFormattedClassName(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW)
        return this._querySelectorAll(this.#BODY_CONTENT_DATA, "body content data", className)
    }

    // Get body content data cells
    #getBodyContentDataCells() {
        const className = this.CompJS.getFormattedClassName(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_CELL)
        return this._querySelectorAll(this.#BODY_CONTENT_DATA, "body content data", className)
    }

    // Get page element by index
    #getPageElementByIndex(idx) {
        const className = this.CompJS.getFormattedClassName(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE)
        return this._querySelectorWithData(this.#BODY_CONTENT_DATA, "body content data", className, this.#PAGE_IDX, idx)
    }

    // Get last page element
    #getLastPageElement() {
        return this.#getPageElementByIndex(this.#NUMBER_PAGES - 1)
    }

    // Get pagination button element class name by index
    #getPaginationButtonClassNameByIndex(idx) {
        // Get the class name for either the middle or inner buttons
        for(let middleBtn of [this.#FIRST_PAGE_BTN, this.#LAST_PAGE_BTN])
            if (idx===parseInt(middleBtn.dataset[this.#PAGE_IDX]))
                return GRID_SELECTORS.FOOTER_MIDDLE_BTN

        return GRID_SELECTORS.FOOTER_INNER_BTN
    }

    // Get pagination button active class name by index
    #getPaginationButtonActiveElementByIndex(idx) {
        return this.#getPaginationButtonClassNameByIndex(idx) + "--active"
    }

    // Get pagination button element by index
    #getPaginationButtonByIndex(idx) {
        const className = this.#getPaginationButtonClassNameByIndex(idx)
        const formattedClassName = this.CompJS.getFormattedClassName(className)
        return this._querySelectorWithData(this.#FOOTER_PAGINATION, "footer pagination", formattedClassName, this.#PAGE_IDX, idx)
    }

    // - Setters

    // Set page element index
    #setPageElementIndex(element, idx) {
        element.dataset[this.#PAGE_IDX] = idx
    }

    // Set page row element index
    #setPageRowElementIndex(element, idx) {
        element.dataset[this.#ROW_IDX] = idx
    }

    // Set cell column ID
    #setCellElementColumnId(element, id) {
        element.dataset[this.#COLUMN_ID] = id
    }

    // Set pagination button page
    #setPaginationButtonPage(element, idx) {
        if (idx < 0)
            idx = this.#NUMBER_PAGES - 1

        if (idx >= this.#NUMBER_PAGES)
            idx = 0

        element.dataset[this.#PAGE_IDX] = idx
    }

    // Set pagination button page index
    #setPaginationButtonPageContent(element, content) {
        element.innerHTML = content
    }

    // Set previous page button page index
    #setPreviousPageButtonPage() {
        this.#setPaginationButtonPage(this.#PREVIOUS_BTN, this.#CURRENT_PAGE - 1)
    }

    // Set next page button page index
    #setNextPageButtonPage() {
        this.#setPaginationButtonPage(this.#NEXT_BTN, this.#CURRENT_PAGE + 1)

    }

    // - Icons

    // Load SVG
    async #loadSVG(parentElement,url, id, onLoad) {
        this.CompJS.loadHiddenSVG(url, COMPJS_CONSTANTS.VIEW_BOX, id)
                .then(() => this.CompJS.loadSVG(parentElement, id, GRID_SELECTORS.HEADER_ICON))
                .then(                    svgElement =>{
                    if(onLoad)
                        onLoad(svgElement)})
                .catch(err => console.error(err))
    }

    // Toggle lock status
    #toggleLockStatus() {
        // Change lock status
        this.#LOCK_STATUS = !this.#LOCK_STATUS;

        // Change content editable status
        const isEditable=this.isContentEditable()
        this.setEditable(this.#HEADER_TITLE, isEditable)
        this._getBodyHeaderColumns().forEach(element=>this.setEditable(element, isEditable))
        this.#getBodyContentDataCells().forEach(element=>this.setEditable(element, isEditable))

        if(this.#HAS_LOCK)
        this.#HEADER_LOCK_ICON_CONTAINER.childNodes.forEach(child => child.classList.toggle(COMPJS_SELECTORS.HIDE))
    }

    // Add lock icon
    addLockIcon() {
        if (this.#HAS_LOCK)
            return;

        if (this.#LOCK_STATUS === undefined)
            this.#throwMissingJSONPropertyError("lock status")

        this.#HAS_LOCK = true

        // Lock icons container
        this.#HEADER_LOCK_ICON_CONTAINER = this.CompJS.createDiv(this.#HEADER_ICONS, GRID_SELECTORS.HEADER_ICON_CONTAINER, GRID_SELECTORS.HEADER_ICON_CONTAINER_LOCK);

        // Lock icon click event
        this.#HEADER_LOCK_ICON_CONTAINER.addEventListener('click', event => {
            event.preventDefault();
            this.#toggleLockStatus()
        })

        // Icons objects
        const unlockIcon = {
            url: COMPJS_URLS.UNLOCK_SVG,
            id: GRID_SELECTORS.ICON_UNLOCK,
            changeOnLock: true
        }

        const lockIcon = {
            url: COMPJS_URLS.LOCK_SVG,
            id: GRID_SELECTORS.ICON_LOCK,
            changeOnLock: false
        }

        // Load lock SVG
        for (let icon of [unlockIcon, lockIcon])
            this.#loadSVG(this.#HEADER_LOCK_ICON_CONTAINER, icon.url, icon.id, svgElement => {
                if (icon.changeOnLock)
                        this.CompJS.addClassNames(svgElement, COMPJS_SELECTORS.HIDE)
            })
    }

    // Add insert icon
    addInsertIcon(){
        if (this.#HAS_INSERTION)
            return;

        this.#HAS_INSERTION = true
        
        // Insert icon container
        const headerInsertIconContainer = this.CompJS.createDiv(this.#HEADER_ICONS, GRID_SELECTORS.HEADER_ICON_CONTAINER, GRID_SELECTORS.HEADER_ICON_CONTAINER_INSERT);
        
        // Load insert SVG
        this.#loadSVG(headerInsertIconContainer, COMPJS_URLS.PLUS_SVG, GRID_SELECTORS.ICON_INSERT)

        // Insert icon click event
        headerInsertIconContainer.addEventListener('click', event => {
            event.preventDefault()

            // Check if there's enough space for a new row
            let lastPageElement= this.#getLastPageElement()
            const rowIndex =parseInt(lastPageElement.lastElementChild.dataset[this.#ROW_IDX])

            if(lastPageElement.childNodes.length>=this.#PAGE_SIZE)
                lastPageElement = this.#addBodyContentPage()

            // Add new row
            this.#addBodyContentDataRow(lastPageElement, rowIndex+1)

            // Make the new row editable
            const lastRow=lastPageElement.lastElementChild
            lastRow.childNodes.forEach(element=>this.setEditable(element,true))

            // Focus first row cell
            let cellFocused=lastRow.firstElementChild
            cellFocused.focus()

            const focusOutListener=event=>{
                event.preventDefault()

                // Remove focus out listener
                event.target.removeEventListener("focusout", focusOutListener)

                // Element that receives the focus
                const focusElement=event.relatedTarget

                // Check if the focus is still on the new row
                if(!focusElement||focusElement.parentElement!==lastRow) {
                    lastRow.childNodes.forEach(element=>this.setEditable(element,this.isContentEditable()))
                    return
                }

                focusElement.addEventListener("focusout", focusOutListener)
            }
            cellFocused.addEventListener("focusout", focusOutListener)

            // Move to last page
            this.#changePage(this.#NUMBER_PAGES-1)
        })
    }

    // Add trash icon
    addRemoveIcon() {
        if (this.#HAS_REMOVE)
            return;

        this.#HAS_REMOVE = true

        // Remove classes when there is no lock icon
        this.#HEADER.classList.remove(GRID_SELECTORS.HEADER_NO_CHECKBOXES)
        this.#BODY_HEADER.classList.remove(GRID_SELECTORS.BODY_HEADER_NO_CHECKBOXES)
        this.#BODY_CONTENT_DATA.classList.remove(GRID_SELECTORS.BODY_CONTENT_DATA_NO_CHECKBOXES)
        this.#FOOTER.classList.remove(GRID_SELECTORS.FOOTER_NO_CHECKBOXES)
    }
    
    // Add icons
    addIcons() {
        this.addLockIcon()
        this.addInsertIcon()
        this.addRemoveIcon()
    }

    // - Buttons

    // Add button page click event
    #addPaginationButtonClickEvent(...buttons) {
        for (let button of buttons)
            button.addEventListener("click", event => {
                event.preventDefault()

                const pageIdx = parseInt(button.dataset[this.#PAGE_IDX])
                this.#changePage(pageIdx)
            })
    }

    // - Active elements

    // Toggle active class from pagination button
    #togglePaginationButtonActive() {
        // Get the current page button
        const idx = this.#CURRENT_PAGE
        const element=this.#getPaginationButtonByIndex(idx)
        const activeClassName = this.#getPaginationButtonActiveElementByIndex(idx)

        element.classList.toggle(activeClassName)
    }

    // - Checkers

    // Check if the grid is locked
    isContentEditable() {
        return !this.#LOCK_STATUS
    }

    // - Grid properties setters

    // Set grid root class property value
    setGridProperty(propertyName, propertyValue) {
        this.setClassProperty(GRID_SELECTORS.ROOT, propertyName, propertyValue);
    }

    // Set grid root class property value to the given element ID
    setGridIdProperty(propertyName, propertyValue) {
        this.setIdFromSelectorProperty(GRID_SELECTORS.ROOT, propertyName, propertyValue);
    }

    // - Observers getters and setters

    // Has observer
    #hasObserver(observerName) {
        return this.#OBSERVERS.has(observerName)
    }

    // Has observer options
    #hasObserverOptions(observerName) {
        return this.#OBSERVERS_OPTIONS.has(observerName)
    }

    // Get observer
    #getObserver(observerName) {
        if (!this.#OBSERVERS.has(observerName))
            throw new Error("Observer is not defined...")

        return this.#OBSERVERS.get(observerName)
    }

    #getObserverOptions(observerName) {
        if (!this.#OBSERVERS_OPTIONS.has(observerName))
            throw new Error("Observer options are not defined...")

        return this.#OBSERVERS_OPTIONS.get(observerName)
    }

    // Set observer
    #setObserver(observerName, observer) {
        if (this.#OBSERVERS.has(observerName))
            throw new Error("Observer is already defined...")

        this.#OBSERVERS.set(observerName, observer)
    }

    // Set observer options
    #setObserverOptions(observerName, options) {
        if (this.#OBSERVERS_OPTIONS.has(observerName))
            throw new Error("Observer options are already defined...")

        this.#OBSERVERS_OPTIONS.set(observerName, options)
    }

    // Add mutation observer to element
    #addMutationObserverToElement(element, observerName) {
        const options = this.#getObserverOptions(observerName)
        this.#getObserver(observerName).observe(element, options)
    }

    // Add resize observer to element
    #addResizeObserverToElement(element, observerName) {
        this.#getObserver(observerName).observe(element)
    }

    // - Resize observers

    // Initialize Page Element Resize Observer
    #initPageElementResizeObserver() {
        if (this.#hasObserver(this.#PAGE_ELEMENT_RESIZE_OBSERVER))
            return

        const pageElementResizeObserverCallback = entries => {
            for (let entry of entries) {
                let maxHeight
                const height = this.CompJS.getElementTotalHeight(entry.target)
                const isNull = this.#MAX_HEIGHT_ELEMENT === null

                if (!isNull)
                    maxHeight = this.#getBodyContentDataPageHeight(this.#MAX_HEIGHT_ELEMENT)

                if (isNull || height > maxHeight) {
                    // Update page element with the maximum height
                    this.#MAX_HEIGHT_ELEMENT = entry.target

                    // Update body content data page height
                    this.#BODY_CONTENT_DATA_PAGES_HEIGHT.set(this.#MAX_HEIGHT_ELEMENT, height)

                    this.#resizeBodyContent()
                    continue
                }

                if (height === maxHeight)
                    continue

                if (entry.target === this.#MAX_HEIGHT_ELEMENT) {
                    // Update body content data page height
                    this.#BODY_CONTENT_DATA_PAGES_HEIGHT.set(this.#MAX_HEIGHT_ELEMENT, height)

                    // Update page element with the maximum height
                    for (let [element, height] of this.#BODY_CONTENT_DATA_PAGES_HEIGHT.entries())
                        if (height > maxHeight) {
                            this.#MAX_HEIGHT_ELEMENT = element
                            maxHeight = height
                        }

                    this.#resizeBodyContent()
                }
            }
        }

        const pageElementResizeObserver = new ResizeObserver(pageElementResizeObserverCallback)
        this.#setObserver(this.#PAGE_ELEMENT_RESIZE_OBSERVER, pageElementResizeObserver)
    }

    // - Mutation observers

    // Initialize Title Observer
    #initTitleObserver() {
        if (this.#hasObserver(this.#TITLE_OBSERVER))
            return

        const titleObserverOptions = {
            subtree: true,
            characterData: true
        }

        const titleObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type !== "characterData")
                    return

                if (mutation.target.length === 0)
                    this.#toggleWarnings()

                else if (this.#GLOBAL_WARNING)
                    this.#toggleWarnings()
            })
        })

        this.#setObserver(this.#TITLE_OBSERVER, titleObserver)
        this.#setObserverOptions(this.#TITLE_OBSERVER, titleObserverOptions)
    }

    // Columns Observer
    #initColumnsObserver() {
        if (this.#hasObserver(this.#COLUMNS_OBSERVER))
            return

        const columnsObserverOptions = {
            subtree: true,
            characterData: true
        }

        const columnsObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type !== "characterData")
                    return

                const element = mutation.target.ownerDocument.activeElement

                if (mutation.target.textContent.length === 0)
                    this.#toggleColumnWarning(element)

                else if (this.#WARNING_COLUMNS.get(element) && !this.#GLOBAL_WARNING)
                    this.#toggleColumnWarning(element)
            })
        })

        this.#setObserver(this.#COLUMNS_OBSERVER, columnsObserver)
        this.#setObserverOptions(this.#COLUMNS_OBSERVER, columnsObserverOptions)
    }

    // Initialize Cells Observer
    #initCellsObserver() {
        if (this.#hasObserver(this.#CELLS_OBSERVER))
            return

        const cellsObserverOptions = {
            subtree: true,
            characterData: true
        }

        const cellsObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type !== "characterData")
                    return

                const element = mutation.target.ownerDocument.activeElement
                const columnId = element.dataset[this.#COLUMN_ID]
                const columnData = this.#COLUMNS.get(columnId)
                const textContent = mutation.target.textContent

                // Validate empty cell
                if (textContent.length === 0 && !columnData.get(GRID_JSON.COLUMN_DATA_NULLABLE)) {
                    if(!this.#WARNING_CELLS.get(element))
                        this.#toggleCellWarning(element)
                    return
                }

                // Validate cell data type
                const columnDataType = columnData.get(GRID_JSON.COLUMN_DATA_TYPE)
                const regularExpression = this.CompJS.getDataTypeRegExp(columnDataType)

                if (regularExpression !== undefined)
                    if (!regularExpression.test(textContent)){
                        if(!this.#WARNING_CELLS.get(element))
                            this.#toggleCellWarning(element)
                        return
                    }

                // Remove cell warning
                if (this.#WARNING_CELLS.get(element))
                    this.#toggleCellWarning(element)
            })
        })

        this.#setObserver(this.#CELLS_OBSERVER, cellsObserver)
        this.#setObserverOptions(this.#CELLS_OBSERVER, cellsObserverOptions)
    }

    // Initialize Observers
    #initObservers() {
        this.#initPageElementResizeObserver()
        this.#initTitleObserver()
        this.#initColumnsObserver()
        this.#initCellsObserver()
    }

    // - Warnings

    // Add or remove element warning status from a given map
    #toggleElementWarningStatus(map, element) {
        if (!element)
            return

        if (map.has(element))
            map.set(element, !map.get(element))
        else
            map.set(element, true)
    }

    // Add or remove global warning classes
    #toggleWarnings() {
        this.#GLOBAL_WARNING = !this.#GLOBAL_WARNING

        // Title
        this.#HEADER_TITLE.classList.toggle(GRID_SELECTORS.HEADER_TITLE_WARNING)

        // Body
        this.#BODY_HEADER.classList.toggle(GRID_SELECTORS.BODY_HEADER_WARNING)

        this.#getBodyContentDataRows().forEach(cell => {
            cell.classList.toggle(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_WARNING)
        })
    }

    // Add or remove column warning classes
    #toggleColumnWarning(element) {
        if (!element)
            return

        this.#toggleElementWarningStatus(this.#WARNING_COLUMNS, element)
        element.classList.toggle(GRID_SELECTORS.BODY_HEADER_COLUMN_WARNING)
    }

    // Add or remove cell warning classes
    #toggleCellWarning(element) {
        if (!element)
            return

        this.#toggleElementWarningStatus(this.#WARNING_CELLS, element)
        element.classList.toggle(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_CELL_WARNING)
    }

    // - Disconnect observers

    // Disconnect Observer
    disconnectObserver(observerName) {
        if (!this.#OBSERVERS.has(observerName))
            return

        this.#getObserver(observerName).disconnect()
    }

    // Disconnect page element resize observer
    #disconnectPageElementResizeObserver() {
        this.disconnectObserver(this.#PAGE_ELEMENT_RESIZE_OBSERVER)
    }

    // Disconnect title observer
    disconnectTitleObserver() {
        this.disconnectObserver(this.#TITLE_OBSERVER)
    }

    // Disconnect columns observer
    disconnectColumnsObserver() {
        this.disconnectObserver(this.#COLUMNS_OBSERVER)
    }

    // Disconnect body content data cells observer
    disconnectCellsObserver() {
        this.disconnectObserver(this.#CELLS_OBSERVER)
    }

    // Disconnect title, columns and cells observers
    disconnectNonEssentialObservers() {
        this.disconnectTitleObserver()
        this.disconnectColumnsObserver()
        this.disconnectCellsObserver()
    }
}