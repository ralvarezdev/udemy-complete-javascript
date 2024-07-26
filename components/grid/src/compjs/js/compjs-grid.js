'use strict';

import {compJS} from "./compjs.js";
import {COMPJS} from "./compjs-props.js";
import {CompJSElement} from "./compjs-element.js";
import {GRID} from "./compjs-grid-props.js";
import {getListFromObject, getMapFromObject} from "./compjs-utils.js";

export class CompJSGrid extends CompJSElement {
    static COUNTER = 0

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
    #pageButtonOffset = 2
    #btnStartIdx

    // Checkboxes
    #selectedPageRows = new Map()

    // Empty elements and warning flags
    #globalWarning = false
    #WARNING_COLUMNS = new Map()
    #WARNING_CELLS = new Map()

    // Observers
    #OBSERVERS = new Map()
    #OBSERVERS_OPTIONS = new Map()

    static {
        compJS.addStyleSheet(GRID.PATHS.MAIN_STYLE);
    }

    constructor(elementId, parentElement) {
        super(elementId, parentElement)

        // Set root element
        this.#ROOT = this.createDivWithId(this.parentElement, GRID.SELECTORS.ROOT, GRID.SELECTORS.ROOT, COMPJS.SELECTORS.UTILITIES.HIDE, COMPJS.SELECTORS.UTILITIES.NO_TRANSITION, COMPJS.SELECTORS.UTILITIES.NO_TRANSFORM, COMPJS.SELECTORS.UTILITIES.NO_ANIMATION, COMPJS.SELECTORS.UTILITIES.PRELOAD);

        // CompJS Grid observers
        this.#initObservers();

        // CompJS Grid elements initialization
        this.#initHeader();
        this.#initBody();
        this.#initFooter();
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
        /*
        if (toIdx === this.#currentPage)
            return
        */

        if (this.#pagesNumber === 0)
            return

        if (toIdx >= this.#pagesNumber)
            toIdx = 0

        else if (toIdx < 0)
            toIdx = this.#pagesNumber - 1

        // Disconnect page row element resize observer
        this.#disconnectPageRowElementResizeObserver()

        // Change of the current pagination active button
        this.#togglePaginationButtonActive()

        // Get page elements
        const currentPageElement = this.#getCurrentPageElement()
        const toPageElement = this.#getPageElement(toIdx)

        // Update current page
        const fromIdx = this.#currentPage
        this.#currentPage = toIdx

        // Update selected page rows
        this.#updateSelectedPageRows()

        // Update body content checkboxes and checkbox containers size
        this.#updateBodyContentCheckboxContainersHeight()
        this.#updateBodyContentCheckboxContainers()
        this.#updateBodyContentCheckboxes()

        // Update footer
        this.#updateFooter()

        // Change of the next pagination active button
        this.#togglePaginationButtonActive()

        // Change page
        // TO CHECK
        if (toIdx === fromIdx) {
            currentPageElement.classList.remove(GRID.SELECTORS.BODY.CONTENT.PAGE_HIDE_LEFT, GRID.SELECTORS.BODY.CONTENT.PAGE_HIDE_RIGHT)
            toPageElement.classList.add(GRID.SELECTORS.BODY.CONTENT.PAGE_SHOW_LEFT, GRID.SELECTORS.BODY.CONTENT.PAGE_SHOW_RIGHT)
            return
        }

        currentPageElement.classList.remove(GRID.SELECTORS.BODY.CONTENT.PAGE_SHOW_LEFT, GRID.SELECTORS.BODY.CONTENT.PAGE_SHOW_RIGHT)
        toPageElement.classList.remove(GRID.SELECTORS.BODY.CONTENT.PAGE_HIDE_LEFT, GRID.SELECTORS.BODY.CONTENT.PAGE_HIDE_RIGHT)

        // Show from left side
        if (toIdx < fromIdx) {
            currentPageElement.classList.add(GRID.SELECTORS.BODY.CONTENT.PAGE_HIDE_RIGHT)
            toPageElement.classList.add(GRID.SELECTORS.BODY.CONTENT.PAGE_SHOW_LEFT)
        }

        // Show from right side
        else {
            currentPageElement.classList.add(GRID.SELECTORS.BODY.CONTENT.PAGE_HIDE_LEFT)
            toPageElement.classList.add(GRID.SELECTORS.BODY.CONTENT.PAGE_SHOW_RIGHT)
        }
    }

    // Show grid
    #showGrid() {
        // Remove preload class
        this.#ROOT.classList.remove(COMPJS.SELECTORS.UTILITIES.NO_TRANSITION, COMPJS.SELECTORS.UTILITIES.NO_TRANSFORM, COMPJS.SELECTORS.UTILITIES.NO_ANIMATION, COMPJS.SELECTORS.UTILITIES.HIDE)

        // Sleep for a while to prevent animations on page load
        compJS.sleep(COMPJS.DELAYS.LOAD).then(() => this.#ROOT.classList.remove(COMPJS.SELECTORS.UTILITIES.PRELOAD))
    }

    // - Element initializers

    // Header initializer
    #initHeader() {
        // Header
        this.#header = compJS.createDiv(this.#ROOT, GRID.SELECTORS.HEADER.BASE, GRID.SELECTORS.HEADER.BASE_NO_CHECKBOXES);

        // Title
        this.#headerTitleContainer = compJS.createDiv(this.#header, GRID.SELECTORS.HEADER.TITLE_CONTAINER);

        this.#headerTitle = compJS.createElement("h2", this.#headerTitleContainer, GRID.SELECTORS.HEADER.TITLE);
        this.#headerTitle.contentEditable = this.isContentEditable()

        // Icons
        this.#headerIconsContainer = compJS.createDiv(this.#header, GRID.SELECTORS.HEADER.ICONS_CONTAINER);
    }

    // Body initializer
    #initBody() {
        // Body
        this.#body = compJS.createDiv(this.#ROOT, GRID.SELECTORS.BODY.BASE);

        // Body header
        this.#bodyHeader = compJS.createDiv(this.#body, GRID.SELECTORS.BODY.HEADER.BASE, GRID.SELECTORS.BODY.HEADER.BASE_NO_CHECKBOXES);
        this.#bodyHeaderColumnsContainer = compJS.createDiv(this.#bodyHeader, GRID.SELECTORS.BODY.HEADER.COLUMNS_CONTAINER, GRID.SELECTORS.BODY.HEADER.COLUMNS_CONTAINER_NO_CHECKBOXES);

        // Body content
        const selector1 = GRID.SELECTORS.BODY.CONTENT.BASE
        this.#bodyContent = this.createDivWithId(this.#body, selector1, selector1);

        // Add checkboxes container
        const selector2 = GRID.SELECTORS.BODY.CONTENT.CHECKBOXES_CONTAINER
        this.#bodyContentCheckboxesContainer = this.createDivWithId(this.#bodyContent, selector2, selector2, COMPJS.SELECTORS.UTILITIES.HIDE)

        // Body content pages container
        const selector3 = GRID.SELECTORS.BODY.CONTENT.PAGES_CONTAINER
        this.#bodyContentPagesContainer = this.createDivWithId(this.#bodyContent, selector3, selector3, GRID.SELECTORS.BODY.CONTENT.PAGES_CONTAINER_NO_CHECKBOXES);

        // Add observers
        this.#addMutationObserverToElement(this.#headerTitle, GRID.OBSERVERS.MUTATION.TITLE)
        this.#addMutationObserverToElement(this.#bodyHeaderColumnsContainer, GRID.OBSERVERS.MUTATION.COLUMNS)
        this.#addMutationObserverToElement(this.#bodyContentPagesContainer, GRID.OBSERVERS.MUTATION.CELLS)
    }

    // Footer initializer
    #initFooter() {
        // Footer
        this.#footer = compJS.createDiv(this.#ROOT, GRID.SELECTORS.FOOTER.BASE, GRID.SELECTORS.FOOTER.BASE_NO_CHECKBOXES, COMPJS.SELECTORS.UTILITIES.HIDE);

        // Pagination
        this.#footerPagination = compJS.createDiv(this.#footer, GRID.SELECTORS.FOOTER.PAGINATION);

        // Previous and next buttons
        this.#previousPageButton = compJS.createButton(this.#footerPagination, GRID.SELECTORS.FOOTER.OUTER_BTN);
        this.#setPaginationButtonPageContent(this.#previousPageButton, "Previous")
        this.#setPreviousPageButtonPage()

        // Next button
        this.#nextPageButton = compJS.createButton(this.#footerPagination, GRID.SELECTORS.FOOTER.OUTER_BTN);
        this.#setPaginationButtonPageContent(this.#nextPageButton, "Next")
        this.#setNextPageButtonPage()

        // Middle buttons container
        this.#middleButtonsContainer = compJS.createDiv(this.#footerPagination, GRID.SELECTORS.FOOTER.MIDDLE_BTN_CONTAINER);

        // First page and last page buttons
        this.#firstPageButton = compJS.createButton(this.#middleButtonsContainer, GRID.SELECTORS.FOOTER.MIDDLE_BTN, GRID.SELECTORS.FOOTER.MIDDLE_BTN_ACTIVE)
        this.#setPaginationButtonPage(this.#firstPageButton, 0)
        this.#setPaginationButtonPageContent(this.#firstPageButton, 1)

        this.#lastPageButton = compJS.createButton(this.#middleButtonsContainer, GRID.SELECTORS.FOOTER.MIDDLE_BTN)

        // Add pagination buttons click event
        this.#addPaginationButtonClickEvent(this.#previousPageButton, this.#nextPageButton, this.#firstPageButton, this.#lastPageButton)
    }

    // - Additional elements

    // Add body content checkboxes
    #addBodyContentCheckboxes() {
        // Get number of checkboxes
        let checkboxesNumber = this.#bodyContentCheckboxesContainer.childNodes.length

        // Add checkboxes
        for (; checkboxesNumber < this.#pageSize && checkboxesNumber < this.#getLastPageRowIndex(); checkboxesNumber++)
            this.#addBodyContentCheckbox(checkboxesNumber)
    }

    // Add body content checkbox
    #addBodyContentCheckbox(rowIdx) {
        // Create checkbox container and checkbox
        const checkboxContainer = compJS.createDiv(this.#bodyContentCheckboxesContainer, GRID.SELECTORS.BODY.CONTENT.CHECKBOX_CONTAINER);
        const checked = false
        const checkbox = compJS.createInputCheckbox(checkboxContainer, null, null, checked, GRID.SELECTORS.BODY.CONTENT.CHECKBOX)

        // Set checkbox page row index
        this.#setPageRowElementIndex(checkbox, rowIdx)

        // Store checkbox checked status
        this.#selectedPageRows.set(rowIdx, checked)

        // Add warning class, if needed
        if (this.#globalWarning)
            checkbox.classList.add(COMPJS.SELECTORS.ELEMENTS.CHECKBOX_WARNING)

        return checkboxContainer
    }

    // Add body content page element
    #addBodyContentPage() {
        // Create page element
        const pageNumber = this.#pagesNumber++
        const pageElement = compJS.createDiv(this.#bodyContentPagesContainer, GRID.SELECTORS.BODY.CONTENT.PAGE, GRID.SELECTORS.BODY.CONTENT.PAGE_HIDE_RIGHT);

        // Set first and last page
        this.#lastPage = pageElement

        if (pageNumber === 0)
            this.#firstPage = pageElement

        // Set page element index
        this.#setPageElementIndex(pageElement, pageNumber)

        // Set page height
        this.#bodyContentPagesHeight.set(pageElement, compJS.getElementTotalHeight(pageElement))

        // Remove hide class from current page
        if (pageNumber === this.#currentPage)
            pageElement.classList.remove(GRID.SELECTORS.BODY.CONTENT.PAGE_HIDE_RIGHT)

        // Add observer
        this.#addResizeObserverToElement(pageElement, GRID.OBSERVERS.RESIZE.PAGE_ELEMENT)

        return pageElement
    }

    // Add body content page element rows
    #addBodyContentPageRows(pageElement, pageNumber, loadFromData) {
        let rowIndex = pageNumber * this.#pageSize

        for (let i = 0; i < this.#pageSize; rowIndex++, i++) {
            if (loadFromData && rowIndex >= this.#data.length)
                break

            this.#addBodyContentPageRow(pageElement, rowIndex, loadFromData)
        }
    }

    // Add body content page row
    #addBodyContentPageRow(pageElement, rowIndex, loadFromData) {
        // Get row data and create row element
        const rowElement = compJS.createDiv(pageElement, GRID.SELECTORS.BODY.CONTENT.PAGE_ROW);

        // Add warning class, if needed
        if (this.#globalWarning)
            rowElement.classList.add(GRID.SELECTORS.BODY.CONTENT.PAGE_ROW_WARNING)

        // Set row element index, selected flag, and add page cells
        this.#setPageRowElementIndex(rowElement, rowIndex)
        this.#addBodyContentPageCells(rowElement, rowIndex, loadFromData)

        // Add checkboxes, if needed
        if (this.#hasRemove) {
            if (rowIndex < this.#pageSize)
                this.#addBodyContentCheckboxes()

            // Update checkboxes
            this.#updateBodyContentCheckboxContainers()
            this.#updateBodyContentCheckboxes()
        }

        return rowElement
    }

    // Add body content page row cells
    #addBodyContentPageCells(rowElement, rowIndex, loadFromData) {
        this.#columnsSortedKeys.forEach(([key, dataMap]) => {
            const cellElement = compJS.createDiv(rowElement, GRID.SELECTORS.BODY.CONTENT.PAGE_ROW_CELL);
            this.#setCellElementColumnId(cellElement, key)

            if (loadFromData) {
                const rowData = this.#data[rowIndex]
                const cellData = rowData.get(key)

                if (cellData !== undefined)
                    cellElement.innerHTML = cellData;

                else if (!dataMap.get(GRID.JSON.COLUMN.NULLABLE))
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
        this.#columnsSortedKeys.forEach(([id, dataMap]) => {
            const columnElement = compJS.createDiv(this.#bodyHeaderColumnsContainer, GRID.SELECTORS.BODY.HEADER.COLUMN);

            // Set column element data
            columnElement.dataset[GRID.JSON.COLUMN.ID] = id
            columnElement.dataset[GRID.JSON.COLUMN.DATA_TYPE] = dataMap.get(GRID.JSON.COLUMN.DATA_TYPE)

            // Set column element order
            columnElement.style.order = dataMap.get(GRID.JSON.COLUMN.INDEX);

            const columnTitle = dataMap.get(GRID.JSON.COLUMN.TITLE)
            if (columnTitle.length)
                columnElement.innerHTML = columnTitle;

            else
                this.#toggleColumnWarning(columnElement)
        })
    }

    // Update body element
    #updateBody() {
        // Check if there are missing properties
        for (let [prop, propName] of [[this.#pageSize, "page size"], [this.#data, "data"]])
            if (prop === undefined)
                this.#throwMissingPropertyError(propName)

        // Clear rows
        this.#disconnectPageElementResizeObserver()

        // Clear body content pages
        if (this.#bodyContentPagesContainer !== undefined)
            this.#bodyContentPagesContainer.childNodes.forEach(element => element.remove())

        // Hide checkboxes
        if (!this.#hasRemove && this.#bodyContentCheckboxesContainer !== undefined)
            this.#bodyContentCheckboxesContainer.childNodes.forEach(element => element.classList.add(COMPJS.SELECTORS.UTILITIES.HIDE))

        // Update rows data
        this.#pagesNumber = 0
        this.#bodyContentPagesHeight = new Map()

        // Get total height size in rems
        const filledPages = this.#data.length / this.#pageSize
        const partialFilledPage = this.#data.length % this.#pageSize > 0
        const totalPages = filledPages + (partialFilledPage ? 1 : 0)

        for (let pageNumber = 0; pageNumber < totalPages; pageNumber++) {
            const pageElement = this.#addBodyContentPage()
            this.#addBodyContentPageRows(pageElement, pageNumber, true)
        }
    }

    // Update body content element height according to its child elements
    #updateBodyContent() {
        const maxHeight = this.#getBodyContentPageHeight(this.#maxHeightElement)
        const remsMaxHeight = compJS.convertPixelsToRem(maxHeight) + "rem"
        const classNames = [GRID.SELECTORS.BODY.CONTENT.BASE, GRID.SELECTORS.BODY.CONTENT.PAGES_CONTAINER, GRID.SELECTORS.BODY.CONTENT.CHECKBOXES_CONTAINER]

        // Set body content data height
        for (let className of classNames) {
            const id = this.getFormattedIdFromSelector(className)
            this.setIdProperty(id, "height", remsMaxHeight)
        }
        compJS.applyStyles()
    }

    // Update body content checkbox containers height
    #updateBodyContentCheckboxContainersHeight() {
        if (this.#pagesNumber === 0)
            return

        const pageRows = this.#getCurrentPageElement().childNodes
        const checkboxContainers = this.#bodyContentCheckboxesContainer.childNodes

        // Update page row related checkbox container height
        for (let i = 0, pageRowHeightPx; i < pageRows.length; i++) {
            pageRowHeightPx = compJS.getElementTotalHeight(pageRows[i])
            checkboxContainers[i].style.height = compJS.convertPixelsToRem(pageRowHeightPx) + "rem"
        }

        /*
        // Remove height style if there is minor number of page rows than the page size
        for(let i=pageRows.length;i<checkboxContainers.length;i++)
            checkboxContainers[i].style.height=""
         */
    }

    // Update body content checkbox containers
    #updateBodyContentCheckboxContainers() {
        // Get checkbox containers and checkboxes
        const checkboxContainers = this.#getBodyContentCheckboxContainerElements()

        if (this.#pagesNumber === 0) {
            checkboxContainers.forEach(c => c.classList.add(COMPJS.SELECTORS.UTILITIES.HIDE))
            return
        }

        // Get number of rows
        const rowsNumber = this.#getCurrentPageElement().childElementCount

        // Observe page rows
        const currentPageElement = this.#getCurrentPageElement()

        currentPageElement.childNodes.forEach(row => this.#addResizeObserverToElement(row, GRID.OBSERVERS.RESIZE.PAGE_ROW_ELEMENT))

        // Change checkboxes visibility
        for (let i = 0; i < rowsNumber; i++)
            for (let element of [checkboxContainers[i], ...checkboxContainers[i].childNodes])
                element.classList.remove(COMPJS.SELECTORS.UTILITIES.HIDE)

        for (let i = rowsNumber; i < checkboxContainers.length; i++)
            for (let element of [checkboxContainers[i], ...checkboxContainers[i].childNodes])
                element.classList.add(COMPJS.SELECTORS.UTILITIES.HIDE)
    }

    // Update body content checkboxes
    #updateBodyContentCheckboxes() {
        const checkboxes = this.#getBodyContentCheckboxElements()

        // Hide checkboxes if the number of page rows is less than page size and there's a single page
        if (this.#currentPage === 0 && this.#pagesNumber === 1) {
            const rowsNumber = this.#getLastPageRowIndex() + 1

            // Hide checkbox and checkbox container
            for (let i = rowsNumber; i < checkboxes.length; i++)
                for (let element of [checkboxes[i], checkboxes[i].parentElement]) {
                    element.classList.add(COMPJS.SELECTORS.UTILITIES.HIDE)
                    element.style.height = ""
                }
        }

        // Get page row index
        let pageRowIdx = this.#currentPage * this.#pageSize

        // Update page row index and checked status
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.#selectedPageRows.get(pageRowIdx)
            this.#setPageRowElementIndex(checkbox, pageRowIdx++)
        })
    }

    // Update selected page rows
    #updateSelectedPageRows() {
        const checkboxes = this.#getBodyContentCheckboxElements()

        // Store selected checkboxes
        checkboxes.forEach(checkbox => {
            const fromRowIdx = this.#getPageRowIndex(checkbox)
            this.#selectedPageRows.set(fromRowIdx, checkbox.checked)
        })
    }

    // Update footer
    #updateFooter() {
        if (this.#pagesNumber < 2) {
            this.#footer.classList.add(COMPJS.SELECTORS.UTILITIES.HIDE)
            return
        }

        // Update pagination inner buttons
        this.#updatePaginationInnerButtons()

        // Update pagination buttons page
        this.#updatePaginationButtonsPage()

        // Remove hide class from footer
        this.#footer.classList.remove(COMPJS.SELECTORS.UTILITIES.HIDE)
    }

    // Update inner pagination buttons
    #updatePaginationInnerButtons() {
        if (this.#pagesNumber <= 2) {
            // Remove inner buttons container
            if (this.#innerButtonsContainer !== undefined) {
                this.#innerButtonsContainer.remove()
                this.#innerButtonsContainer = undefined
            }

            return
        }

        // Page inner buttons container
        if (this.#innerButtonsContainer === undefined)
            this.#innerButtonsContainer = compJS.createDiv(this.#middleButtonsContainer, GRID.SELECTORS.FOOTER.INNER_BTN_CONTAINER)

        // Get number of required inner buttons
        const isInsideOffsetRange = 2 * this.#pageButtonOffset + 1 < this.#pagesNumber - 2
        const currentNumberButtons=this.#innerButtonsContainer.childElementCount
        const requiredNumberButtons = isInsideOffsetRange ? 2 * this.#pageButtonOffset + 1 : this.#pagesNumber - 2
        const innerButtons = this.#innerButtonsContainer.childNodes

        // Delete inner buttons, if needed
        for (let i = requiredNumberButtons; i < currentNumberButtons; i++)
            this.#innerButtonsContainer.lastElementChild.remove()

        // Add inner buttons, if needed
        for (let i = currentNumberButtons; i < requiredNumberButtons; i++) {
            const paginationButton = compJS.createButton(this.#innerButtonsContainer, GRID.SELECTORS.FOOTER.INNER_BTN);
            this.#addPaginationButtonClickEvent(paginationButton)
        }

        // Add warning class, if needed
        if (this.#globalWarning)
            for (let i = 0; i < requiredNumberButtons; i++)
                innerButtons[i].classList.add(GRID.SELECTORS.FOOTER.INNER_BTN_WARNING)
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
    #updatePaginationOuterButtonsContent() {
        this.#setPreviousPageButtonPage()
        this.#setNextPageButtonPage()
    }

    // Update middle pagination buttons page
    #updatePaginationMiddleButtonsContent() {
        this.#setPaginationButtonPage(this.#lastPageButton, this.#pagesNumber - 1)
        this.#setPaginationButtonPageContent(this.#lastPageButton, this.#pagesNumber)
    }

    // Update inner pagination buttons page
    #updatePaginationInnerButtonsContent() {
        if (this.#pagesNumber <= 2)
            return

        this.#updatePaginationButtonsRange()
        let i = this.#btnStartIdx

        this.#innerButtonsContainer.childNodes.forEach(innerButton => {
            this.#setPaginationButtonPage(innerButton, i++)
            this.#setPaginationButtonPageContent(innerButton, i)
        })
    }

    // Update pagination buttons page
    #updatePaginationButtonsPage() {
        this.#updatePaginationOuterButtonsContent()
        this.#updatePaginationMiddleButtonsContent()
        this.#updatePaginationInnerButtonsContent()
    }

    // - Delete

    // Delete selected rows
    #deleteSelectedPageRows() {
        const pagesContainer = this.#bodyContentPagesContainer
        const pages = pagesContainer.childNodes
        const oldCurrentPageIdx=this.#currentPage
        let changedPage=false, oldPageIdx , newPageIdx = 0, newPageRowIdx = 0,pageIdx=0,page,nextPage

        // Disconnect page element resize observer
        this.#disconnectPageElementResizeObserver()

        // Disconnect row element resize observer
        this.#disconnectPageRowElementResizeObserver()

        // Check page. Returns 'true' if the page should be skipped from being checked
        const checkPage=pageIdx=> {
            if (!pages[pageIdx].childElementCount) {
                deletePage(pageIdx)
                return true
            }
            this.#setPageElementIndex(pages[pageIdx], newPageIdx++)
            //console.log(pageIdx,newPageIdx,newPageRowIdx)

            return false
        }

        // Check page rows
        const checkPageRows = pageRows => {
            for (let j = 0; j < pageRows.length;)
                if(!checkPageRow(pageRows[j]))
                    j++
        }

        // Check page row
        const checkPageRow=pageRow=> {
            const pageRowIdx = this.#getPageRowIndex(pageRow)
            let removed = false

            if (!this.#selectedPageRows.get(pageRowIdx))
                this.#setPageRowElementIndex(pageRow, newPageRowIdx++)

            else{
                pageRow.remove()
                removed = true
            }

            this.#selectedPageRows.delete(pageRowIdx)
            return removed
        }

        // Delete page
        const deletePage = () => {
            // Check if it's the current page
            if(this.#currentPage===pageIdx)
                changedPage=true

            // Update page index and number of pages
            if (oldPageIdx <= oldCurrentPageIdx && this.#currentPage > 0)
                this.#currentPage--
            this.#pagesNumber--

            pages[pageIdx].remove()
        }


        // Traverse pages
        while(pageIdx < pagesContainer.childElementCount) {
            // Update page element index
            page = pages[pageIdx]
            oldPageIdx=this.#getPageIndex(page)

            // Check page rows
            checkPageRows(page.childNodes)

            // Check page
            if(checkPage(pageIdx))
                continue

            // Check if there has been removed some page rows
            if (page.childElementCount === this.#pageSize){
                pageIdx++
                continue
            }

            // Observe page
            this.#addResizeObserverToElement(page, GRID.OBSERVERS.RESIZE.PAGE_ELEMENT)

            // Remove page if it is missing some rows
            while ( page.childElementCount < this.#pageSize && ++pageIdx < this.#pagesNumber) {
                 nextPage = pages[pageIdx]
                oldPageIdx=this.#getPageIndex(nextPage)

                // Check next page rows
                checkPageRows(nextPage.childNodes)

                // Check next page
                if(checkPage(pageIdx))
                    continue

                // Append rows to the current page
                while (page.childElementCount < this.#pageSize && nextPage.childElementCount > 0) {
                    const nextPageRow=nextPage.firstElementChild
                    nextPageRow.remove()

                    // Update next page row index
                    page.appendChild(nextPageRow)
                }

                page = nextPage
            }

            // Check if the last page is empty
            if (page.childElementCount === 0) {
                deletePage(this.#pagesNumber - 1)
                break
            }
        }

        // Check if there are no pages
        if(!pagesContainer.childElementCount)
            return changedPage

        // Add resize observer
        this.#getCurrentPageElement().childNodes.forEach(row => this.#addResizeObserverToElement(row, GRID.OBSERVERS.RESIZE.PAGE_ROW_ELEMENT))

        // Update last page
        this.#lastPage = pages[pages.length - 1]

        return changedPage
    }

    // - JSON

    // Load JSON props
    async loadJSON(jsonObject) {
        if (!jsonObject instanceof Object)
            throw new Error("JSON is not an object...")

        // Header
        this.#lockStatus = Boolean(jsonObject[GRID.JSON.LOCKED]);
        this.#title = String(jsonObject[GRID.JSON.TITLE]);

        // Data
        this.#pageSize = parseInt(jsonObject[GRID.JSON.PAGE_SIZE]);
        this.#columns = this.#loadJSONColumnsData(jsonObject[GRID.JSON.COLUMNS]);
        this.#data = this.#loadJSONBodyData(jsonObject[GRID.JSON.DATA]);

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
        const requiredProps = [GRID.JSON.COLUMN.ID, GRID.JSON.COLUMN.INDEX, GRID.JSON.COLUMN.TITLE, GRID.JSON.COLUMN.DATA_TYPE, GRID.JSON.COLUMN.NULLABLE]
        let id,columnMap

        // Check for required properties
        for (let column of columnsList) {
            // Get and check column map
            columnMap=getMapFromObject(column)
            requiredProps.forEach((prop) => {
                if (!columnMap.has(prop))
                    this.#throwMissingJSONPropertyError(prop)
            })

            // Store column map
            id = columnMap.get(GRID.JSON.COLUMN.ID)
            columnMap.delete(GRID.JSON.COLUMN.ID)

            columnsMap.set(id, columnMap)
        }

        return columnsMap
    }

    // Sort JSON Columns Keys
    #sortJSONColumnsKeys() {
        this.#columnsSortedKeys = []

        for (let key of this.#columns.keys())
            this.#columnsSortedKeys.push([key, this.#columns.get(key)])

        this.#columnsSortedKeys.sort((a, b) => a[1].get(GRID.JSON.COLUMN.INDEX) - b[1].get(GRID.JSON.COLUMN.INDEX));
    }

    /*
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
    */

    /*
    // - Grid properties getters
    // NOTE: Objects must be flatted

    // Get grid root class properties values
    getGridProperties() {
        return this.getSelectorProperties(GRID.SELECTORS.ROOT, ...Object.values(GRID.SELECTORS));
    }

    // Get grid root class properties values to the given element ID
    getGridIdProperties() {
        return this.getSelectorProperties(GRID.SELECTORS.ROOT, ...Object.values(GRID.SELECTORS));
    }
     */

    // - Element getters

    // Get body content page height
    #getBodyContentPageHeight(element) {
        if (!this.#bodyContentPagesHeight.has(element))
            this._throwUndefinedElementError("page")

        return this.#bodyContentPagesHeight.get(element)
    }

    // Get body content page checkbox container elements
    #getBodyContentCheckboxContainerElements() {
        const className = compJS.getFormattedClassName(GRID.SELECTORS.BODY.CONTENT.CHECKBOX_CONTAINER)
        return this._querySelectorAll(this.#bodyContentCheckboxesContainer, "body content checkboxes container", className)
    }

    // Get body content page checkbox elements
    #getBodyContentCheckboxElements() {
        const className = compJS.getFormattedClassName(GRID.SELECTORS.BODY.CONTENT.CHECKBOX)
        return this._querySelectorAll(this.#bodyContentCheckboxesContainer, "body content checkboxes container", className)
    }

    // Get body content page row elements
    #getBodyContentPageRowElements() {
        const className = compJS.getFormattedClassName(GRID.SELECTORS.BODY.CONTENT.PAGE_ROW)
        return this._querySelectorAll(this.#bodyContentPagesContainer, "body content pages container", className)
    }

    // Get body content page cell elements
    #getBodyContentPageRowCellElements() {
        const className = compJS.getFormattedClassName(GRID.SELECTORS.BODY.CONTENT.PAGE_ROW_CELL)
        return this._querySelectorAll(this.#bodyContentPagesContainer, "body content pages container", className)
    }

    // Get page element 
    #getPageElement(idx) {
        const className = compJS.getFormattedClassName(GRID.SELECTORS.BODY.CONTENT.PAGE)
        return this._querySelectorWithData(this.#bodyContentPagesContainer, "body content pages container", className, GRID.DATASETS.PAGE_IDX, idx)
    }

    // Get current page element
    #getCurrentPageElement() {
        return this.#getPageElement(this.#currentPage)
    }

    // Get page row element
    #getPageRowElement(idx) {
        const className = compJS.getFormattedClassName(GRID.SELECTORS.BODY.CONTENT.PAGE_ROW)
        return this._querySelectorWithData(this.#bodyContentPagesContainer, "body content pages container", className, GRID.DATASETS.ROW_IDX, idx)
    }

    // Get checkbox element
    #getCheckboxElement(idx) {
        const className = compJS.getFormattedClassName(GRID.SELECTORS.BODY.CONTENT.CHECKBOX)
        return this._querySelectorWithData(this.#bodyContentCheckboxesContainer, "body content checkboxes container", className, GRID.DATASETS.ROW_IDX, idx)
    }

    // Get page index
    #getPageIndex(element) {
        return parseInt(element.dataset[GRID.DATASETS.PAGE_IDX])
    }

    // Get page row index
    #getPageRowIndex(element) {
        return parseInt(element.dataset[GRID.DATASETS.ROW_IDX])
    }

    // Get last page row index
    #getLastPageRowIndex() {
        return this.#pagesNumber > 0 ? this.#getPageRowIndex(this.#lastPage.lastElementChild) : 0
    }

    // Get pagination button element class name
    #getPaginationButtonClassName(idx) {
        // Get the class name for either the middle or inner buttons
        for (let middleBtn of [this.#firstPageButton, this.#lastPageButton])
            if (idx === parseInt(middleBtn.dataset[GRID.DATASETS.PAGE_IDX]))
                return GRID.SELECTORS.FOOTER.MIDDLE_BTN

        return GRID.SELECTORS.FOOTER.INNER_BTN
    }

    // Get pagination button active class name
    #getPaginationButtonActiveClassName(idx, isWarning) {
        const baseClassName = this.#getPaginationButtonClassName(idx)
        let classModifiers

        if (isWarning)
            classModifiers = [baseClassName, "warning", "active"]
        else
            classModifiers = [baseClassName, "active"]

        return classModifiers.join("--")
    }

    // Get pagination button element
    #getPaginationButtonElement(idx) {
        const className = this.#getPaginationButtonClassName(idx)
        const formattedClassName = compJS.getFormattedClassName(className)
        return this._querySelectorWithData(this.#footerPagination, "footer pagination", formattedClassName, GRID.DATASETS.PAGE_IDX, idx)
    }

    // - Setters

    // Set page element index
    #setPageElementIndex(element, idx) {
        element.dataset[GRID.DATASETS.PAGE_IDX] = idx
    }

    // Set page row element index
    #setPageRowElementIndex(element, idx) {
        element.dataset[GRID.DATASETS.ROW_IDX] = idx
    }

    // Set cell column ID
    #setCellElementColumnId(element, id) {
        element.dataset[GRID.DATASETS.COLUMN_ID] = id
    }

    // Set pagination button page
    #setPaginationButtonPage(element, idx) {
        if (idx < 0)
            idx = this.#pagesNumber - 1

        if (idx >= this.#pagesNumber)
            idx = 0

        element.dataset[GRID.DATASETS.PAGE_IDX] = idx
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
        compJS.loadHiddenSVG(url, COMPJS.ATTRIBUTES.VIEW_BOX, id)
            .then(() => compJS.loadSVG(parentElement, id, GRID.SELECTORS.HEADER.ICON))
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
        this.#bodyHeaderColumnsContainer.childNodes.forEach(element => this.setEditable(element, isEditable))
        this.#getBodyContentPageRowCellElements().forEach(element => this.setEditable(element, isEditable))

        if (this.#hasLock)
            this.#headerEditIconContainer.childNodes.forEach(child => child.classList.toggle(COMPJS.SELECTORS.UTILITIES.HIDE))
    }

    // Add lock icon
    addLockIcon() {
        if (this.#hasLock)
            return;

        if (this.#lockStatus === undefined)
            this.#throwMissingJSONPropertyError("lock status")

        this.#hasLock = true

        // Lock icons container
        this.#headerEditIconContainer = compJS.createDiv(this.#headerIconsContainer, GRID.SELECTORS.HEADER.ICON_CONTAINER, GRID.SELECTORS.HEADER.ICON_CONTAINER_EDIT);

        // Lock icon click event
        this.#headerEditIconContainer.addEventListener('click', event => {
            event.preventDefault();
            this.#toggleLockStatus()
        })

        // Icons objects
        const unlockIcon = {
            url: COMPJS.URLS.SVG.UNLOCK,
            id: GRID.SELECTORS.ICON.UNLOCK,
            changeOnLock: true
        }

        const lockIcon = {
            url: COMPJS.URLS.SVG.LOCK,
            id: GRID.SELECTORS.ICON.LOCK,
            changeOnLock: false
        }

        // Load lock SVG
        for (let icon of [unlockIcon, lockIcon])
            this.#loadSVG(this.#headerEditIconContainer, icon.url, icon.id, svgElement => {
                if (icon.changeOnLock)
                    compJS.addClassNames(svgElement, COMPJS.SELECTORS.UTILITIES.HIDE)
            })
    }

    // Add insert icon
    addInsertIcon() {
        if (this.#hasInsertion)
            return;

        this.#hasInsertion = true

        // Insert icon container
        const headerInsertIconContainer = compJS.createDiv(this.#headerIconsContainer, GRID.SELECTORS.HEADER.ICON_CONTAINER, GRID.SELECTORS.HEADER.ICON_CONTAINER_INSERT);

        // Load insert SVG
        this.#loadSVG(headerInsertIconContainer, COMPJS.URLS.SVG.PLUS, GRID.SELECTORS.ICON.INSERT)

        // Insert icon click event
        headerInsertIconContainer.addEventListener('click', event => {
            event.preventDefault()

            // Check if there's no row
            if(this.#pagesNumber===0){
                this.#addBodyContentPage()
                 this.#addBodyContentPageRow(this.#lastPage, 0, false)
            }
            else{
                // Check if there's enough space for a new row
                const rowIndex = this.#getLastPageRowIndex()

                if (this.#lastPage.childNodes.length >= this.#pageSize)
                    this.#addBodyContentPage()

                // Add new row
                this.#addBodyContentPageRow(this.#lastPage, rowIndex + 1, false)
            }

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

            // Change page (if needed)
            if (this.#currentPage !== this.#pagesNumber - 1)
                this.#changePage(this.#pagesNumber - 1)
        })
    }

    // Add remove icon
    addRemoveIcon() {
        if (this.#hasRemove)
            return;

        this.#hasRemove = true

        // Remove classes when there is no remove icon
        this.#header.classList.remove(GRID.SELECTORS.HEADER.BASE_NO_CHECKBOXES)
        this.#bodyHeader.classList.remove(GRID.SELECTORS.BODY.HEADER.BASE_NO_CHECKBOXES)
        this.#bodyHeaderColumnsContainer.classList.remove(GRID.SELECTORS.BODY.HEADER.COLUMNS_CONTAINER_NO_CHECKBOXES)
        this.#bodyContentPagesContainer.classList.remove(GRID.SELECTORS.BODY.CONTENT.PAGES_CONTAINER_NO_CHECKBOXES)
        this.#footer.classList.remove(GRID.SELECTORS.FOOTER.BASE_NO_CHECKBOXES)

        // Show checkboxes container
        this.#bodyContentCheckboxesContainer.classList.remove(COMPJS.SELECTORS.UTILITIES.HIDE)

        // Update body content checkboxes
        this.#addBodyContentCheckboxes()
        this.#updateBodyContentCheckboxContainersHeight()
        this.#updateBodyContentCheckboxContainers()
        this.#updateBodyContentCheckboxes()

        // Remove icon container
        const headerRemoveIconContainer = compJS.createDiv(this.#headerIconsContainer, GRID.SELECTORS.HEADER.ICON_CONTAINER, GRID.SELECTORS.HEADER.ICON_CONTAINER_REMOVE);

        // Load remove SVG
        this.#loadSVG(headerRemoveIconContainer, COMPJS.URLS.SVG.TRASH, GRID.SELECTORS.ICON.REMOVE)

        // Remove icon click event
        headerRemoveIconContainer.addEventListener('click', event => {
            event.preventDefault()

            // Update selected page rows
            this.#updateSelectedPageRows()

            // Change of the current pagination active button
            this.#togglePaginationButtonActive()

            // Remove selected rows
            const changedCurrentPage = this.#deleteSelectedPageRows()

            // Update body content checkboxes
            this.#updateBodyContentCheckboxContainersHeight()
            this.#updateBodyContentCheckboxContainers()
            this.#updateBodyContentCheckboxes()

            // Update footer
            this.#updateFooter()

            // Change of the current pagination active button
            this.#togglePaginationButtonActive()

            // Change to the current page (in case it was deleted)
            if (changedCurrentPage&&this.#pagesNumber>0)
                this.#changePage(this.#currentPage)
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

                const pageIdx = parseInt(button.dataset[GRID.DATASETS.PAGE_IDX])
                this.#changePage(pageIdx)
            })
    }

    // - Active elements

    // Toggle active class from pagination button
    #togglePaginationButtonActive() {
        // Get the current page button
        const idx = this.#currentPage
        const element = this.#getPaginationButtonElement(idx)
        const activeClassModifiers = this.#globalWarning ? [false, true] : [false]

        for (let isWarning of activeClassModifiers) {
            const activeClassName = this.#getPaginationButtonActiveClassName(idx, isWarning)
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
        this.setClassProperty(GRID.SELECTORS.ROOT, propertyName, propertyValue);
    }

    // Set grid root class property value to the given element ID
    setGridIdProperty(propertyName, propertyValue) {
        this.setIdFromSelectorProperty(GRID.SELECTORS.ROOT, propertyName, propertyValue);
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
        if (this.#hasObserver(GRID.OBSERVERS.RESIZE.PAGE_ELEMENT))
            return

        const pageElementResizeObserverCallback = entries => {
            for (let entry of entries) {
                let maxHeight
                const height = compJS.getElementTotalHeight(entry.target)
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
        this.#setObserver(GRID.OBSERVERS.RESIZE.PAGE_ELEMENT, pageElementResizeObserver)
    }

    // Initialize Page Row Element Resize Observer
    #iniPageRowElementResizeObserver() {
        if (this.#hasObserver(GRID.OBSERVERS.RESIZE.PAGE_ROW_ELEMENT))
            return

        const pageRowElementResizeObserverCallback = entries => {
            for (let entry of entries) {
                // Get page row element
                const pageRow = entry.target
                const height = compJS.getElementTotalHeight(pageRow)
                const pageRowIndex = this.#getPageRowIndex(pageRow)

                // Update checkbox container height
                //console.log(pageRowIndex, pageRow, height)
                const checkboxContainer = this.#getCheckboxElement(pageRowIndex).parentElement
                checkboxContainer.style.height = compJS.convertPixelsToRem(height) + "rem"
            }
        }

        const rowElementResizeObserver = new ResizeObserver(pageRowElementResizeObserverCallback)
        this.#setObserver(GRID.OBSERVERS.RESIZE.PAGE_ROW_ELEMENT, rowElementResizeObserver)
    }

    // - Mutation observers

    // Initialize Title Observer
    #initTitleObserver() {
        if (this.#hasObserver(GRID.OBSERVERS.MUTATION.TITLE))
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

        this.#setObserver(GRID.OBSERVERS.MUTATION.TITLE, titleObserver)
        this.#setObserverOptions(GRID.OBSERVERS.MUTATION.TITLE, titleObserverOptions)
    }

    // Columns Observer
    #initColumnsObserver() {
        if (this.#hasObserver(GRID.OBSERVERS.MUTATION.COLUMNS))
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

                else if (this.#WARNING_COLUMNS.get(element))
                    this.#toggleColumnWarning(element)
            })
        })

        this.#setObserver(GRID.OBSERVERS.MUTATION.COLUMNS, columnsObserver)
        this.#setObserverOptions(GRID.OBSERVERS.MUTATION.COLUMNS, columnsObserverOptions)
    }

    // Initialize Cells Observer
    #initCellsObserver() {
        if (this.#hasObserver(GRID.OBSERVERS.MUTATION.CELLS))
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
                const columnId = element.dataset[GRID.JSON.COLUMN.ID]
                const columnData = this.#columns.get(columnId)
                const textContent = mutation.target.textContent

                // Validate empty cell
                if (textContent.length === 0 && !columnData.get(GRID.JSON.COLUMN.NULLABLE)) {
                    if (!this.#WARNING_CELLS.get(element))
                        this.#toggleCellWarning(element)
                    return
                }

                // Validate cell data type
                const columnDataType = columnData.get(GRID.JSON.COLUMN.DATA_TYPE)
                const regularExpression = COMPJS.DATA_TYPES[columnDataType].REGEXP

                // Test regular expression for the given data type
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

        this.#setObserver(GRID.OBSERVERS.MUTATION.CELLS, cellsObserver)
        this.#setObserverOptions(GRID.OBSERVERS.MUTATION.CELLS, cellsObserverOptions)
    }

    // Initialize Observers
    #initObservers() {
        this.#initPageElementResizeObserver()
        this.#iniPageRowElementResizeObserver()
        this.#initTitleObserver()
        this.#initColumnsObserver()
        this.#initCellsObserver()
    }

    // - Warnings

    // Add or remove element warning status from a given map
    #toggleElementWarningStatus(map, element) {
        if (!element)
            return

        // Toggle warning status
        const value = map.get(element)
        map.set(element, value === undefined ? true : !value)
    }

    // Add or remove global warning classes
    #toggleWarnings() {
        this.#globalWarning = !this.#globalWarning

        // Title
        this.#headerTitle.classList.toggle(GRID.SELECTORS.HEADER.TITLE_WARNING)

        // Body
        this.#bodyHeader.classList.toggle(GRID.SELECTORS.BODY.HEADER.BASE_WARNING)

        // Body content checkboxes
        if (this.#bodyContentCheckboxesContainer !== undefined)
            this.#bodyContentCheckboxesContainer.childNodes.forEach(checkboxContainer => {
                checkboxContainer.classList.toggle(GRID.SELECTORS.BODY.CONTENT.CHECKBOX_CONTAINER_WARNING)

                const checkbox = checkboxContainer.firstElementChild
                checkbox.classList.toggle(COMPJS.SELECTORS.ELEMENTS.CHECKBOX_WARNING)
            })

        //  Body content page rows
        this.#getBodyContentPageRowElements().forEach(cell => cell.classList.toggle(GRID.SELECTORS.BODY.CONTENT.PAGE_ROW_WARNING))

        // Pagination buttons
        for (let button of [this.#previousPageButton, this.#nextPageButton])
            button.classList.toggle(GRID.SELECTORS.FOOTER.OUTER_BTN_WARNING)

        for (let button of [this.#firstPageButton, this.#lastPageButton])
            button.classList.toggle(GRID.SELECTORS.FOOTER.MIDDLE_BTN_WARNING)

        if (this.#innerButtonsContainer !== undefined)
            for (let button of this.#innerButtonsContainer.childNodes)
                button.classList.toggle(GRID.SELECTORS.FOOTER.INNER_BTN_WARNING)

        const activeButton = this.#getPaginationButtonElement(this.#currentPage)
        const className = this.#getPaginationButtonActiveClassName(this.#currentPage, true)
        activeButton.classList.toggle(className)
    }

    // Add or remove column warning classes
    #toggleColumnWarning(element) {
        if (!element)
            return

        this.#toggleElementWarningStatus(this.#WARNING_COLUMNS, element)
        element.classList.toggle(GRID.SELECTORS.BODY.HEADER.COLUMN_WARNING)
    }

    // Add or remove cell warning classes
    #toggleCellWarning(element) {
        if (!element)
            return

        this.#toggleElementWarningStatus(this.#WARNING_CELLS, element)
        element.classList.toggle(GRID.SELECTORS.BODY.CONTENT.PAGE_ROW_CELL_WARNING)
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
        this.disconnectObserver(GRID.OBSERVERS.RESIZE.PAGE_ELEMENT)
    }

    // Disconnect page row element resize observer
    #disconnectPageRowElementResizeObserver() {
        this.disconnectObserver(GRID.OBSERVERS.RESIZE.PAGE_ROW_ELEMENT)
    }

    // Disconnect title observer
    disconnectTitleObserver() {
        this.disconnectObserver(GRID.OBSERVERS.MUTATION.TITLE)
    }

    // Disconnect columns observer
    disconnectColumnsObserver() {
        this.disconnectObserver(GRID.OBSERVERS.MUTATION.COLUMNS)
    }

    // Disconnect body content data cells observer
    disconnectCellsObserver() {
        this.disconnectObserver(GRID.OBSERVERS.MUTATION.CELLS)
    }

    // Disconnect title, columns and cells observers
    disconnectNonEssentialObservers() {
        this.disconnectTitleObserver()
        this.disconnectColumnsObserver()
        this.disconnectCellsObserver()
    }
}