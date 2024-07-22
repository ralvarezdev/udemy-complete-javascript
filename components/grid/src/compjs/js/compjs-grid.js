'use strict';

import {COMPJS_CONSTANTS, COMPJS_PATHS, COMPJS_SELECTORS, COMPJS_URLS} from "./compjs-props.js";
import {CompJSElement} from "./compjs-element.js";
import {GRID_SELECTORS, GRID_SELECTORS_LIST, GRID_JSON, GRID_CONSTANTS} from "./compjs-grid-props.js";
import {getListFromObject, getMapFromObject} from "./compjs-utils.js";

export class CompJSGrid extends CompJSElement {
    // Configuration
    #title = "Start creating!"
    #lockStatus
    #pageSize
    #columns
    #columnsSortedKeys
    #data

    // Icons
    #hasLock = false
    #hasRemove = false
    #hasInsertion = false

    // DOM Elements
    #ROOT;
    #header;
    #headerTitleContainer;
    #headerTitle;
    #headerIconsContainer;
    #headerEditIconContainer
    #body;
    #bodyHeader;
    #bodyHeaderColumnsContainer;
    #bodyContent
    #bodyContentPagesContainer
    #bodyContentCheckboxesContainer
    #footer
    #footerPagination

    // Body content data pages map that contains the given page element (key) and its height (value)
    #bodyContentPagesHeight

    // List that contains the page element with the maximum height
    #maxHeightElement = null

    // Pagination
    #pagesNumber = 0
    #currentPage = 0
    #firstPage
    #lastPage

    // Pagination buttons
    #middleButtonsContainer
    #innerButtonsContainer
    #firstPageButton
    #lastPageButton
    #previousPageButton
    #nextPageButton
    #innerButtonsNumber = 0
    #pageButtonOffset = 2
    #btnStartIdx

    // Empty elements and warning flags
    #globalWarning = false
    #WARNING_COLUMNS = new Map()
    #WARNING_CELLS = new Map()

    // Observers
    #OBSERVERS = new Map()
    #OBSERVERS_OPTIONS = new Map()

    static {
        CompJSElement.CompJS.addStyleSheet(COMPJS_PATHS.GRID_STYLE);
    }

    constructor(elementId, parentElement) {
        super(elementId, parentElement)

        // Set root element
        this.#ROOT = this.createDivWithId(this.parentElement, GRID_SELECTORS.ROOT, GRID_SELECTORS.ROOT, COMPJS_SELECTORS.HIDE, COMPJS_SELECTORS.NO_TRANSITION, COMPJS_SELECTORS.NO_TRANSFORM, COMPJS_SELECTORS.NO_ANIMATION, COMPJS_SELECTORS.PRELOAD);

        // CompJS Grid observers
        this.#initObservers();

        // CompJS Grid elements initialization
        this.#initHeader();
        this.#initBody();
        this.#initFooter();

        // Additional elements
        if (this.#hasRemove)
            this.addRemoveIcon()

        if (this.#hasLock)
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
        if (toIdx === this.#currentPage)
            return

        if (toIdx >= this.#pagesNumber)
            toIdx = 0

        else if (toIdx < 0)
            toIdx = this.#pagesNumber - 1

        // Change of the current pagination active button
        this.#togglePaginationButtonActive()

        // Get page elements
        const currentPageElement = this.#getPageElementByIndex(this.#currentPage)
        const toPageElement = this.#getPageElementByIndex(toIdx)

        // Update current page
        const fromIdx = this.#currentPage
        this.#currentPage = toIdx

        // Update body content checkboxes
        this.#updateBodyContentCheckboxes()

        // Update pagination buttons
        this.#updateInnerPageButtons()
        this.#updatePaginationButtonsPage()

        // Change of the next pagination active button
        this.#togglePaginationButtonActive()

        currentPageElement.classList.remove(GRID_SELECTORS.BODY_CONTENT_PAGE_SHOW_LEFT, GRID_SELECTORS.BODY_CONTENT_PAGE_SHOW_RIGHT)
        toPageElement.classList.remove(GRID_SELECTORS.BODY_CONTENT_PAGE_HIDE_LEFT, GRID_SELECTORS.BODY_CONTENT_PAGE_HIDE_RIGHT)

        // Change page
        if (toIdx < fromIdx) {
            // Show from left side
            currentPageElement.classList.add(GRID_SELECTORS.BODY_CONTENT_PAGE_HIDE_RIGHT)
            toPageElement.classList.add(GRID_SELECTORS.BODY_CONTENT_PAGE_SHOW_LEFT)
            return
        }

        // Show from right side
        currentPageElement.classList.add(GRID_SELECTORS.BODY_CONTENT_PAGE_HIDE_LEFT)
        toPageElement.classList.add(GRID_SELECTORS.BODY_CONTENT_PAGE_SHOW_RIGHT)
    }

    // Show grid
    #showGrid() {
        // Remove preload class
        this.#ROOT.classList.remove(COMPJS_SELECTORS.NO_TRANSITION, COMPJS_SELECTORS.NO_TRANSFORM, COMPJS_SELECTORS.NO_ANIMATION, COMPJS_SELECTORS.HIDE)

        // Sleep for a while to prevent animations on page load
        this.CompJS.sleep(COMPJS_CONSTANTS.LOAD_DELAY).then(() => this.#ROOT.classList.remove(COMPJS_SELECTORS.PRELOAD))
    }

    // - Element initializers

    // Header initializer
    #initHeader() {
        // Header
        this.#header = this.CompJS.createDiv(this.#ROOT, GRID_SELECTORS.HEADER, GRID_SELECTORS.HEADER_NO_CHECKBOXES);

        // Title
        this.#headerTitleContainer = this.CompJS.createDiv(this.#header, GRID_SELECTORS.HEADER_TITLE_CONTAINER);

        this.#headerTitle = this.CompJS.createElement("h2", this.#headerTitleContainer, GRID_SELECTORS.HEADER_TITLE);
        this.#headerTitle.contentEditable = this.isContentEditable()

        // Icons
        this.#headerIconsContainer = this.CompJS.createDiv(this.#header, GRID_SELECTORS.HEADER_ICONS_CONTAINER);
    }

    // Body initializer
    #initBody() {
        // Body
        this.#body = this.CompJS.createDiv(this.#ROOT, GRID_SELECTORS.BODY);

        // Body header
        this.#bodyHeader = this.CompJS.createDiv(this.#body, GRID_SELECTORS.BODY_HEADER, GRID_SELECTORS.BODY_HEADER_NO_CHECKBOXES);
        this.#bodyHeaderColumnsContainer = this.CompJS.createDiv(this.#bodyHeader, GRID_SELECTORS.BODY_HEADER_COLUMNS_CONTAINER, GRID_SELECTORS.BODY_HEADER_COLUMNS_CONTAINER_NO_CHECKBOXES);

        // Body content
        this.#bodyContent = this.createDivWithId(this.#body, GRID_SELECTORS.BODY_CONTENT, GRID_SELECTORS.BODY_CONTENT);

        // Body content pages container
        this.#bodyContentPagesContainer = this.createDivWithId(this.#bodyContent, GRID_SELECTORS.BODY_CONTENT_PAGES_CONTAINER, GRID_SELECTORS.BODY_CONTENT_PAGES_CONTAINER, GRID_SELECTORS.BODY_CONTENT_PAGES_CONTAINER_NO_CHECKBOXES);

        // Add observers
        this.#addMutationObserverToElement(this.#headerTitle, GRID_CONSTANTS.TITLE_OBSERVER)
        this.#addMutationObserverToElement(this.#bodyHeaderColumnsContainer, GRID_CONSTANTS.COLUMNS_OBSERVER)
        this.#addMutationObserverToElement(this.#bodyContentPagesContainer, GRID_CONSTANTS.CELLS_OBSERVER)
    }

    // Footer initializer
    #initFooter() {
        // Footer
        this.#footer = this.CompJS.createDiv(this.#ROOT, GRID_SELECTORS.FOOTER, GRID_SELECTORS.FOOTER_NO_CHECKBOXES, COMPJS_SELECTORS.HIDE);

        // Pagination
        this.#footerPagination = this.CompJS.createDiv(this.#footer, GRID_SELECTORS.FOOTER_PAGINATION);

        // Previous and next buttons
        this.#previousPageButton = this.CompJS.createButton(this.#footerPagination, GRID_SELECTORS.FOOTER_OUTER_BTN);
        this.#setPaginationButtonPageContent(this.#previousPageButton, "Previous")
        this.#setPreviousPageButtonPage()

        // Next button
        this.#nextPageButton = this.CompJS.createButton(this.#footerPagination, GRID_SELECTORS.FOOTER_OUTER_BTN);
        this.#setPaginationButtonPageContent(this.#nextPageButton, "Next")
        this.#setNextPageButtonPage()

        // Middle buttons container
        this.#middleButtonsContainer = this.CompJS.createDiv(this.#footerPagination, GRID_SELECTORS.FOOTER_MIDDLE_BTN_CONTAINER);

        // First page and last page buttons
        this.#firstPageButton = this.CompJS.createButton(this.#middleButtonsContainer, GRID_SELECTORS.FOOTER_MIDDLE_BTN, GRID_SELECTORS.FOOTER_MIDDLE_BTN_ACTIVE)
        this.#setPaginationButtonPage(this.#firstPageButton, 0)
        this.#setPaginationButtonPageContent(this.#firstPageButton, 1)

        this.#lastPageButton = this.CompJS.createButton(this.#middleButtonsContainer, GRID_SELECTORS.FOOTER_MIDDLE_BTN)

        // Add pagination buttons click event
        this.#addPaginationButtonClickEvent(this.#previousPageButton, this.#nextPageButton, this.#firstPageButton, this.#lastPageButton)
    }

    // - Additional elements

    // Add body content checkboxes
    #addBodyContentCheckboxes() {
        if (this.#bodyContentCheckboxesContainer === undefined)
            return

        // Get number of checkboxes
        let checkboxesNumber = this.#bodyContentCheckboxesContainer.childNodes.length

        // Add checkboxes
        for (; checkboxesNumber < this.#pageSize && checkboxesNumber < this.#getLastPageRowIndex(); checkboxesNumber++)
            this.#addBodyContentCheckbox(checkboxesNumber)
    }

    // Add body content checkbox
    #addBodyContentCheckbox(rowIndex) {
        const checkboxContainer = this.CompJS.createDiv(this.#bodyContentCheckboxesContainer, GRID_SELECTORS.BODY_CONTENT_CHECKBOX_CONTAINER);
        const checkbox = this.CompJS.createInputCheckbox(checkboxContainer, GRID_CONSTANTS.CHECKBOX_ROW_NAME, rowIndex, false, GRID_SELECTORS.BODY_CONTENT_CHECKBOX)

        // Add warning class, if needed
        if (this.#globalWarning)
            checkbox.classList.add(COMPJS_SELECTORS.CHECKBOX_WARNING)

        return checkboxContainer
    }

    // Add body content page element
    #addBodyContentPage() {
        // Create page element
        const pageNumber = this.#pagesNumber++
        const pageElement = this.CompJS.createDiv(this.#bodyContentPagesContainer, GRID_SELECTORS.BODY_CONTENT_PAGE, GRID_SELECTORS.BODY_CONTENT_PAGE_HIDE_RIGHT);

        // Set first and last page
        this.#lastPage = pageElement

        if (pageNumber === 0)
            this.#firstPage = pageElement

        // Set page element index
        this.#setPageElementIndex(pageElement, pageNumber)

        // Set page height
        this.#bodyContentPagesHeight.set(pageElement, this.CompJS.getElementTotalHeight(pageElement))

        // Remove hide class from current page
        if (pageNumber === this.#currentPage)
            pageElement.classList.remove(GRID_SELECTORS.BODY_CONTENT_PAGE_HIDE_RIGHT)

        // Add observer
        this.#addResizeObserverToElement(pageElement, GRID_CONSTANTS.PAGE_ELEMENT_RESIZE_OBSERVER)

        return pageElement
    }

    // Add body content page element rows
    #addBodyContentPageRows(pageElement, pageNumber) {
        let rowIndex = pageNumber * this.#pageSize

        for (let i = 0; i < this.#pageSize && rowIndex < this.#data.length; rowIndex++, i++)
            this.#addBodyContentPageRow(pageElement, rowIndex)
    }

    // Add body content page row
    #addBodyContentPageRow(pageElement, rowIndex) {
        // Get row data and create row element
        const rowData = this.#data[rowIndex]
        const rowElement = this.CompJS.createDiv(pageElement, GRID_SELECTORS.BODY_CONTENT_PAGE_ROW);

        // Add warning class, if needed
        if (this.#globalWarning)
            rowElement.classList.add(GRID_SELECTORS.BODY_CONTENT_PAGE_ROW_WARNING)

        // Set row element index and add page cells
        this.#setPageRowElementIndex(rowElement, rowIndex)
        this.#addBodyContentPageCells(rowElement, rowData)

        // Add checkboxes, if needed
        if (rowIndex < this.#pageSize)
            this.#addBodyContentCheckboxes()

        // Update checkboxes
        this.#updateBodyContentCheckboxes()

        return rowElement
    }

    // Add body content page row cells
    #addBodyContentPageCells(rowElement, rowData) {
        this.#columnsSortedKeys.forEach(([key, dataMap]) => {
            const cellElement = this.CompJS.createDiv(rowElement, GRID_SELECTORS.BODY_CONTENT_PAGE_ROW_CELL);
            this.#setCellElementColumnId(cellElement, key)

            if (rowData) {
                const cellData = rowData.get(key)
                if (cellData !== undefined)
                    cellElement.innerHTML = cellData;

                else if (!dataMap.get(GRID_JSON.COLUMN_DATA_NULLABLE))
                    this.#toggleCellWarning(cellElement)
            }
        })
    }

    // - Updates

    // Update header element
    #updateHeader() {
        if (this.#title === undefined)
            this.#throwMissingPropertyError("title")

        if (!this.#title.length)
            this.#toggleWarnings()

        // Title
        this.#headerTitle.innerHTML = String(this.#title);
        this.#headerTitle.contentEditable = this.isContentEditable()
    }

    // Update body header element
    #updateBodyHeader() {
        while (this.#bodyHeaderColumnsContainer.firstChild)
            this.#bodyHeaderColumnsContainer.removeChild(this.#bodyHeaderColumnsContainer.firstChild)

        if (!this.#columnsSortedKeys)
            throw new Error("JSON CompJS Grid columns property is not defined...")

        // Set columns' data
        this.#columnsSortedKeys.forEach(([key, dataMap]) => {
            const columnElement = this.CompJS.createDiv(this.#bodyHeaderColumnsContainer, GRID_SELECTORS.BODY_HEADER_COLUMN);

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

        // Clear body content pages
        if (this.#bodyContentPagesContainer !== undefined)
            while ((firstChild = this.#bodyContentPagesContainer.firstChild))
                this.#bodyContentPagesContainer.removeChild(firstChild)

        // Hide checkboxes
        if (!this.#hasRemove && this.#bodyContentCheckboxesContainer !== undefined)
            this.#bodyContentCheckboxesContainer.childNodes.forEach(element => element.classList.add(COMPJS_SELECTORS.HIDE))

        if (this.#pageSize === undefined)
            this.#throwMissingPropertyError("page size")

        if (this.#data === undefined)
            this.#throwMissingPropertyError("data")

        // Update rows data
        this.#pagesNumber = 0
        this.#bodyContentPagesHeight = new Map()

        // Get total height size in rems
        const totalPages = this.#data.length / this.#pageSize + (this.#data.length % this.#pageSize > 0 ? 1 : 0)
        for (let pageNumber = 0; pageNumber < totalPages; pageNumber++) {
            const pageElement = this.#addBodyContentPage()
            this.#addBodyContentPageRows(pageElement, pageNumber)
        }
    }

    // Update body content element height according to its child elements
    #updateBodyContent() {
        const maxHeight = this.#getBodyContentPageHeight(this.#maxHeightElement)
        const remsMaxHeight = this.CompJS.convertPixelsToRem(maxHeight) + "rem"
        const classNames = [GRID_SELECTORS.BODY_CONTENT, GRID_SELECTORS.BODY_CONTENT_PAGES_CONTAINER, GRID_SELECTORS.BODY_CONTENT_CHECKBOXES_CONTAINER]

        // Set body content data height
        for (let className of classNames) {
            const id = this.getFormattedIdFromSelector(className)
            this.setIdProperty(id, "height", remsMaxHeight)
        }

        this.CompJS.applyStyles()
    }

    // Update body content checkboxes
    #updateBodyContentCheckboxes() {
        if (this.#bodyContentCheckboxesContainer === undefined)
            return

        // Get checkboxes
        const checkboxes = this.#bodyContentCheckboxesContainer.childNodes

        // Get number of rows
        const rowsNumber = this.#lastPage.childNodes.length
        let checkboxIdx = this.#currentPage * this.#pageSize

        // Change checkboxes visibility
        if (this.#currentPage !== this.#pagesNumber - 1)
            checkboxes.forEach(checkbox => checkbox.classList.remove(COMPJS_SELECTORS.HIDE))

        else {
            for (let i = 0; i < rowsNumber; i++)
                checkboxes[i].classList.remove(COMPJS_SELECTORS.HIDE)

            for (let i = rowsNumber; i < checkboxes.length; i++)
                checkboxes[i].classList.add(COMPJS_SELECTORS.HIDE)
        }

        // Change checkboxes value
        checkboxes.forEach(checkbox => checkbox.value = checkboxIdx++)
    }

    // Update footer
    #updateFooter() {
        if (this.#pagesNumber === 1) {
            this.#footer.classList.add(COMPJS_SELECTORS.HIDE)
            return
        }

        if (this.#innerButtonsContainer !== undefined)
            this.#innerButtonsContainer.remove()

        // Add page buttons
        if (this.#pagesNumber > 2)
            this.#updateInnerPageButtons()

        // Update pagination buttons page
        this.#updatePaginationButtonsPage()

        // Remove hide class from footer
        this.#footer.classList.remove(COMPJS_SELECTORS.HIDE)
    }

    // Update inner pagination buttons
    #updateInnerPageButtons() {
        if (this.#pagesNumber <= 2)
            return

        // Page button container
        if (this.#innerButtonsContainer === undefined)
            this.#innerButtonsContainer = this.CompJS.createDiv(this.#middleButtonsContainer, GRID_SELECTORS.FOOTER_INNER_BTN_CONTAINER)

        const numberButtons = 2 * this.#pageButtonOffset + 1 < this.#pagesNumber - 2 ? 2 * this.#pageButtonOffset + 1 : this.#pagesNumber - 2

        // Add inner buttons, if needed
        for (let i = this.#innerButtonsNumber; i < numberButtons; i++) {
            const paginationButton = this.CompJS.createButton(this.#innerButtonsContainer, GRID_SELECTORS.FOOTER_INNER_BTN);
            this.#addPaginationButtonClickEvent(paginationButton)
        }

        // Add warning class, if needed
        if (this.#globalWarning) {
            const innerButtons = this.#innerButtonsContainer.childNodes

            for (let i = this.#innerButtonsNumber; i < numberButtons; i++)
                innerButtons[i].classList.add(GRID_SELECTORS.FOOTER_INNER_BTN_WARNING)
        }

        // Update pagination inner buttons counter
        this.#innerButtonsNumber = numberButtons
    }

    // Update pagination buttons range
    #updatePaginationButtonsRange() {
        if (this.#pagesNumber - 2 <= 2 * this.#pageButtonOffset + 1) {
            this.#btnStartIdx = 1
            return
        }

        this.#btnStartIdx = this.#currentPage - this.#pageButtonOffset
        if (this.#btnStartIdx < 1)
            this.#btnStartIdx = 1

        else if (this.#currentPage + this.#pageButtonOffset >= this.#pagesNumber - 1)
            this.#btnStartIdx = this.#pagesNumber - 2 * this.#pageButtonOffset - 2
    }

    // Update outer pagination buttons page
    #updatePaginationOuterButtonsPage() {
        this.#setPreviousPageButtonPage()
        this.#setNextPageButtonPage()
    }

    // Update middle pagination buttons page
    #updatePaginationMiddleButtonsPage() {
        this.#setPaginationButtonPage(this.#lastPageButton, this.#pagesNumber - 1)
        this.#setPaginationButtonPageContent(this.#lastPageButton, this.#pagesNumber)
    }

    // Update inner pagination buttons page
    #updatePaginationInnerButtonsPage() {
        if (this.#pagesNumber <= 2)
            return

        this.#updatePaginationButtonsRange()
        let i = this.#btnStartIdx

        for (const paginationButton of this.#innerButtonsContainer.childNodes) {
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
        this.#lockStatus = Boolean(jsonObject[GRID_JSON.LOCKED]);
        this.#title = String(jsonObject[GRID_JSON.TITLE]);

        // Data
        this.#pageSize = parseInt(jsonObject[GRID_JSON.PAGE_SIZE]);
        this.#columns = this.#loadJSONColumnsData(jsonObject[GRID_JSON.COLUMNS]);
        this.#data = this.#loadJSONBodyData(jsonObject[GRID_JSON.DATA]);

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
        this.#columnsSortedKeys = []

        for (let key of this.#columns.keys())
            this.#columnsSortedKeys.push([key, this.#columns.get(key)])

        this.#columnsSortedKeys.sort((a, b) => a[1].get(GRID_JSON.COLUMN_DATA_INDEX) - b[1].get(GRID_JSON.COLUMN_DATA_INDEX));
    }

    // Get JSON props
    getJSON() {
        const obj = {}

        // Header
        obj.locked = this.#lockStatus
        obj.title = this.#title

        // Data
        obj.pageSize = this.#pageSize
        obj.columns = this.#columns
        obj.data = this.#data
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

    // Get body content page height
    #getBodyContentPageHeight(element) {
        if (!this.#bodyContentPagesHeight.has(element))
            this._throwUndefinedElementError("page")

        return this.#bodyContentPagesHeight.get(element)
    }

    // Get body header columns
    _getBodyHeaderColumns() {
        const className = this.CompJS.getFormattedClassName(GRID_SELECTORS.BODY_HEADER_COLUMN)
        return this._querySelectorAll(this.#bodyHeaderColumnsContainer, "body header columns container", className)
    }

    // Get body content page rows
    #getBodyContentPageRows() {
        const className = this.CompJS.getFormattedClassName(GRID_SELECTORS.BODY_CONTENT_PAGE_ROW)
        return this._querySelectorAll(this.#bodyContentPagesContainer, "body content pages container", className)
    }

    // Get body content page cells
    #getBodyContentPageRowCells() {
        const className = this.CompJS.getFormattedClassName(GRID_SELECTORS.BODY_CONTENT_PAGE_ROW_CELL)
        return this._querySelectorAll(this.#bodyContentPagesContainer, "body content pages container", className)
    }

    // Get page element by index
    #getPageElementByIndex(idx) {
        const className = this.CompJS.getFormattedClassName(GRID_SELECTORS.BODY_CONTENT_PAGE)
        return this._querySelectorWithData(this.#bodyContentPagesContainer, "body content pages container", className, GRID_CONSTANTS.PAGE_IDX, idx)
    }

    // Get last page row index
    #getLastPageRowIndex() {
        return parseInt(this.#lastPage.lastElementChild.dataset[GRID_CONSTANTS.ROW_IDX])
    }

    // Get pagination button element class name by index
    #getPaginationButtonClassNameByIndex(idx) {
        // Get the class name for either the middle or inner buttons
        for (let middleBtn of [this.#firstPageButton, this.#lastPageButton])
            if (idx === parseInt(middleBtn.dataset[GRID_CONSTANTS.PAGE_IDX]))
                return GRID_SELECTORS.FOOTER_MIDDLE_BTN

        return GRID_SELECTORS.FOOTER_INNER_BTN
    }

    // Get pagination button active class name by index
    #getPaginationButtonActiveElementByIndex(idx, isWarning) {
        const baseClassName = this.#getPaginationButtonClassNameByIndex(idx)
        let classModifiers

        if (isWarning)
            classModifiers = [baseClassName, "warning", "active"]
        else
            classModifiers = [baseClassName, "active"]

        return classModifiers.join("--")
    }

    // Get pagination button element by index
    #getPaginationButtonByIndex(idx) {
        const className = this.#getPaginationButtonClassNameByIndex(idx)
        const formattedClassName = this.CompJS.getFormattedClassName(className)
        return this._querySelectorWithData(this.#footerPagination, "footer pagination", formattedClassName, GRID_CONSTANTS.PAGE_IDX, idx)
    }

    // - Setters

    // Set page element index
    #setPageElementIndex(element, idx) {
        element.dataset[GRID_CONSTANTS.PAGE_IDX] = idx
    }

    // Set page row element index
    #setPageRowElementIndex(element, idx) {
        element.dataset[GRID_CONSTANTS.ROW_IDX] = idx
    }

    // Set cell column ID
    #setCellElementColumnId(element, id) {
        element.dataset[GRID_CONSTANTS.COLUMN_ID] = id
    }

    // Set pagination button page
    #setPaginationButtonPage(element, idx) {
        if (idx < 0)
            idx = this.#pagesNumber - 1

        if (idx >= this.#pagesNumber)
            idx = 0

        element.dataset[GRID_CONSTANTS.PAGE_IDX] = idx
    }

    // Set pagination button page index
    #setPaginationButtonPageContent(element, content) {
        element.innerHTML = content
    }

    // Set previous page button page index
    #setPreviousPageButtonPage() {
        this.#setPaginationButtonPage(this.#previousPageButton, this.#currentPage - 1)
    }

    // Set next page button page index
    #setNextPageButtonPage() {
        this.#setPaginationButtonPage(this.#nextPageButton, this.#currentPage + 1)
    }

    // - Icons

    // Load SVG
    async #loadSVG(parentElement, url, id, onLoad) {
        this.CompJS.loadHiddenSVG(url, COMPJS_CONSTANTS.VIEW_BOX, id)
            .then(() => this.CompJS.loadSVG(parentElement, id, GRID_SELECTORS.HEADER_ICON))
            .then(svgElement => {
                if (onLoad)
                    onLoad(svgElement)
            })
            .catch(err => console.error(err))
    }

    // Toggle lock status
    #toggleLockStatus() {
        // Change lock status
        this.#lockStatus = !this.#lockStatus;

        // Change content editable status
        const isEditable = this.isContentEditable()
        this.setEditable(this.#headerTitle, isEditable)
        this._getBodyHeaderColumns().forEach(element => this.setEditable(element, isEditable))
        this.#getBodyContentPageRowCells().forEach(element => this.setEditable(element, isEditable))

        if (this.#hasLock)
            this.#headerEditIconContainer.childNodes.forEach(child => child.classList.toggle(COMPJS_SELECTORS.HIDE))
    }

    // Add lock icon
    addLockIcon() {
        if (this.#hasLock)
            return;

        if (this.#lockStatus === undefined)
            this.#throwMissingJSONPropertyError("lock status")

        this.#hasLock = true

        // Lock icons container
        this.#headerEditIconContainer = this.CompJS.createDiv(this.#headerIconsContainer, GRID_SELECTORS.HEADER_ICON_CONTAINER, GRID_SELECTORS.HEADER_ICON_CONTAINER_EDIT);

        // Lock icon click event
        this.#headerEditIconContainer.addEventListener('click', event => {
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
            this.#loadSVG(this.#headerEditIconContainer, icon.url, icon.id, svgElement => {
                if (icon.changeOnLock)
                    this.CompJS.addClassNames(svgElement, COMPJS_SELECTORS.HIDE)
            })
    }

    // Add insert icon
    addInsertIcon() {
        if (this.#hasInsertion)
            return;

        this.#hasInsertion = true

        // Insert icon container
        const headerInsertIconContainer = this.CompJS.createDiv(this.#headerIconsContainer, GRID_SELECTORS.HEADER_ICON_CONTAINER, GRID_SELECTORS.HEADER_ICON_CONTAINER_INSERT);

        // Load insert SVG
        this.#loadSVG(headerInsertIconContainer, COMPJS_URLS.PLUS_SVG, GRID_SELECTORS.ICON_INSERT)

        // Insert icon click event
        headerInsertIconContainer.addEventListener('click', event => {
            event.preventDefault()

            // Check if there's enough space for a new row
            const rowIndex = this.#getLastPageRowIndex()

            if (this.#lastPage.childNodes.length >= this.#pageSize)
                this.#addBodyContentPage()

            // Add new row
            this.#addBodyContentPageRow(this.#lastPage, rowIndex + 1)

            // Make the new row editable
            const lastRow = this.#lastPage.lastElementChild
            lastRow.childNodes.forEach(element => this.setEditable(element, true))

            // Focus first row cell
            let cellFocused = lastRow.firstElementChild
            cellFocused.focus()

            const focusOutListener = event => {
                event.preventDefault()

                // Remove focus out listener
                event.target.removeEventListener("focusout", focusOutListener)

                // Element that receives the focus
                const focusElement = event.relatedTarget

                // Check if the focus is still on the new row
                if (!focusElement || focusElement.parentElement !== lastRow) {
                    lastRow.childNodes.forEach(element => this.setEditable(element, this.isContentEditable()))
                    return
                }

                focusElement.addEventListener("focusout", focusOutListener)
            }
            cellFocused.addEventListener("focusout", focusOutListener)

            // Change page
            this.#changePage(this.#pagesNumber - 1)
        })
    }

    // Add remove icon
    addRemoveIcon() {
        if (this.#hasRemove)
            return;

        this.#hasRemove = true

        // Remove classes when there is no lock icon
        this.#header.classList.remove(GRID_SELECTORS.HEADER_NO_CHECKBOXES)
        this.#bodyHeader.classList.remove(GRID_SELECTORS.BODY_HEADER_NO_CHECKBOXES)
        this.#bodyHeaderColumnsContainer.classList.remove(GRID_SELECTORS.BODY_HEADER_COLUMNS_CONTAINER_NO_CHECKBOXES)
        this.#bodyContentPagesContainer.classList.remove(GRID_SELECTORS.BODY_CONTENT_PAGES_CONTAINER_NO_CHECKBOXES)
        this.#footer.classList.remove(GRID_SELECTORS.FOOTER_NO_CHECKBOXES)

        // Add checkboxes container
        this.#bodyContentCheckboxesContainer = this.createDivWithId(this.#bodyContent, GRID_SELECTORS.BODY_CONTENT_CHECKBOXES_CONTAINER, GRID_SELECTORS.BODY_CONTENT_CHECKBOXES_CONTAINER)

        // Update body content checkboxes
        this.#addBodyContentCheckboxes()

        // Remove icon container
        const headerRemoveIconContainer = this.CompJS.createDiv(this.#headerIconsContainer, GRID_SELECTORS.HEADER_ICON_CONTAINER, GRID_SELECTORS.HEADER_ICON_CONTAINER_REMOVE);

        // Load remove SVG
        this.#loadSVG(headerRemoveIconContainer, COMPJS_URLS.TRASH_SVG, GRID_SELECTORS.ICON_REMOVE)

        // Remove icon click event
        headerRemoveIconContainer.addEventListener('click', event => {
            event.preventDefault()

            console.log(1)
        })
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

                const pageIdx = parseInt(button.dataset[GRID_CONSTANTS.PAGE_IDX])
                this.#changePage(pageIdx)
            })
    }

    // - Active elements

    // Toggle active class from pagination button
    #togglePaginationButtonActive() {
        // Get the current page button
        const idx = this.#currentPage
        const element = this.#getPaginationButtonByIndex(idx)
        const activeClassModifiers = this.#globalWarning ? [false, true] : [false]

        for (let isWarning of activeClassModifiers) {
            const activeClassName = this.#getPaginationButtonActiveElementByIndex(idx, isWarning)
            element.classList.toggle(activeClassName)
        }
    }

    // - Checkers

    // Check if the grid is locked
    isContentEditable() {
        return !this.#lockStatus
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
        if (this.#hasObserver(GRID_CONSTANTS.PAGE_ELEMENT_RESIZE_OBSERVER))
            return

        const pageElementResizeObserverCallback = entries => {
            for (let entry of entries) {
                let maxHeight
                const height = this.CompJS.getElementTotalHeight(entry.target)
                const isNull = this.#maxHeightElement === null

                if (!isNull)
                    maxHeight = this.#getBodyContentPageHeight(this.#maxHeightElement)

                if (isNull || height > maxHeight) {
                    // Update page element with the maximum height
                    this.#maxHeightElement = entry.target

                    // Update body content data page height
                    this.#bodyContentPagesHeight.set(this.#maxHeightElement, height)

                    this.#updateBodyContent()
                    continue
                }

                if (height === maxHeight)
                    continue

                if (entry.target === this.#maxHeightElement) {
                    // Update body content data page height
                    this.#bodyContentPagesHeight.set(this.#maxHeightElement, height)

                    // Update page element with the maximum height
                    for (let [element, height] of this.#bodyContentPagesHeight.entries())
                        if (height > maxHeight) {
                            this.#maxHeightElement = element
                            maxHeight = height
                        }

                    this.#updateBodyContent()
                }
            }
        }

        const pageElementResizeObserver = new ResizeObserver(pageElementResizeObserverCallback)
        this.#setObserver(GRID_CONSTANTS.PAGE_ELEMENT_RESIZE_OBSERVER, pageElementResizeObserver)
    }

    // - Mutation observers

    // Initialize Title Observer
    #initTitleObserver() {
        if (this.#hasObserver(GRID_CONSTANTS.TITLE_OBSERVER))
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

                else if (this.#globalWarning)
                    this.#toggleWarnings()
            })
        })

        this.#setObserver(GRID_CONSTANTS.TITLE_OBSERVER, titleObserver)
        this.#setObserverOptions(GRID_CONSTANTS.TITLE_OBSERVER, titleObserverOptions)
    }

    // Columns Observer
    #initColumnsObserver() {
        if (this.#hasObserver(GRID_CONSTANTS.COLUMNS_OBSERVER))
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

                else if (this.#WARNING_COLUMNS.get(element) && !this.#globalWarning)
                    this.#toggleColumnWarning(element)
            })
        })

        this.#setObserver(GRID_CONSTANTS.COLUMNS_OBSERVER, columnsObserver)
        this.#setObserverOptions(GRID_CONSTANTS.COLUMNS_OBSERVER, columnsObserverOptions)
    }

    // Initialize Cells Observer
    #initCellsObserver() {
        if (this.#hasObserver(GRID_CONSTANTS.CELLS_OBSERVER))
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
                const columnId = element.dataset[GRID_CONSTANTS.COLUMN_ID]
                const columnData = this.#columns.get(columnId)
                const textContent = mutation.target.textContent

                // Validate empty cell
                if (textContent.length === 0 && !columnData.get(GRID_JSON.COLUMN_DATA_NULLABLE)) {
                    if (!this.#WARNING_CELLS.get(element))
                        this.#toggleCellWarning(element)
                    return
                }

                // Validate cell data type
                const columnDataType = columnData.get(GRID_JSON.COLUMN_DATA_TYPE)
                const regularExpression = this.CompJS.getDataTypeRegExp(columnDataType)

                if (regularExpression !== undefined)
                    if (!regularExpression.test(textContent)) {
                        if (!this.#WARNING_CELLS.get(element))
                            this.#toggleCellWarning(element)
                        return
                    }

                // Remove cell warning
                if (this.#WARNING_CELLS.get(element))
                    this.#toggleCellWarning(element)
            })
        })

        this.#setObserver(GRID_CONSTANTS.CELLS_OBSERVER, cellsObserver)
        this.#setObserverOptions(GRID_CONSTANTS.CELLS_OBSERVER, cellsObserverOptions)
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
        this.#globalWarning = !this.#globalWarning

        // Title
        this.#headerTitle.classList.toggle(GRID_SELECTORS.HEADER_TITLE_WARNING)

        // Body
        this.#bodyHeader.classList.toggle(GRID_SELECTORS.BODY_HEADER_WARNING)

        // Body content checkboxes
        if (this.#bodyContentCheckboxesContainer !== undefined)
            this.#bodyContentCheckboxesContainer.childNodes.forEach(checkboxContainer => {
                checkboxContainer.classList.toggle(GRID_SELECTORS.BODY_CONTENT_CHECKBOX_CONTAINER_WARNING)
                checkboxContainer.firstElementChild.classList.toggle(COMPJS_SELECTORS.CHECKBOX_WARNING)
            })

        //  Body content page rows
        this.#getBodyContentPageRows().forEach(cell => {
            cell.classList.toggle(GRID_SELECTORS.BODY_CONTENT_PAGE_ROW_WARNING)
        })

        // Pagination buttons
        for (let button of [this.#previousPageButton, this.#nextPageButton])
            button.classList.toggle(GRID_SELECTORS.FOOTER_OUTER_BTN_WARNING)

        for (let button of [this.#firstPageButton, this.#lastPageButton])
            button.classList.toggle(GRID_SELECTORS.FOOTER_MIDDLE_BTN_WARNING)

        if (this.#innerButtonsContainer !== undefined)
            for (let button of this.#innerButtonsContainer.childNodes)
                button.classList.toggle(GRID_SELECTORS.FOOTER_INNER_BTN_WARNING)

        const activeButton = this.#getPaginationButtonByIndex(this.#currentPage)
        const className = this.#getPaginationButtonActiveElementByIndex(this.#currentPage, this.#globalWarning)
        activeButton.classList.toggle(className)
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
        element.classList.toggle(GRID_SELECTORS.BODY_CONTENT_PAGE_ROW_CELL_WARNING)
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
        this.disconnectObserver(GRID_CONSTANTS.PAGE_ELEMENT_RESIZE_OBSERVER)
    }

    // Disconnect title observer
    disconnectTitleObserver() {
        this.disconnectObserver(GRID_CONSTANTS.TITLE_OBSERVER)
    }

    // Disconnect columns observer
    disconnectColumnsObserver() {
        this.disconnectObserver(GRID_CONSTANTS.COLUMNS_OBSERVER)
    }

    // Disconnect body content data cells observer
    disconnectCellsObserver() {
        this.disconnectObserver(GRID_CONSTANTS.CELLS_OBSERVER)
    }

    // Disconnect title, columns and cells observers
    disconnectNonEssentialObservers() {
        this.disconnectTitleObserver()
        this.disconnectColumnsObserver()
        this.disconnectCellsObserver()
    }
}