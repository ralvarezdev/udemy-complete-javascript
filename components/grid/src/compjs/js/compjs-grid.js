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
    #HAS_TRASH = false
    #HAS_INSERTION = false

    // DOM Elements
    #ROOT;
    #HEADER;
    #HEADER_TITLE_CONTAINER;
    #HEADER_TITLE;
    #HEADER_ICONS;
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

    // Pagination
    #NUMBER_PAGES
    #NUMBER_PAGES_OLD
    #CURRENT_PAGE = 0

    // Pagination buttons
    #PREVIOUS_BTN
    #INNER_BTN_CONTAINER
    #FIRST_PAGE_BTN
    #LAST_PAGE_BTN
    #NEXT_BTN
    #PAGE_BTN_CONTAINER

    // Empty elements and warning flags
    #GLOBAL_WARNING = false
    #EMPTY_COLUMNS = new Map()
    #EMPTY_CELLS = new Map()

    // Observers
    #OBSERVERS = new Map()

    // Resize observers
    #PAGE_ELEMENT_RESIZE_OBSERVER = "pageElementResize"

    // Mutation observers
    #TITLE_OBSERVER = "title"
    #COLUMNS_OBSERVER = "columns"
    #BODY_CONTENT_DATA_OBSERVER = "bodyContentData"
    #CELLS_OBSERVER = "cells"

    static {
        CompJSElement.CompJS.addStyleSheet(COMPJS_PATHS.GRID_STYLE);
    }

    constructor(elementId, parentElement) {
        super(elementId, parentElement)

        // Set root element
        this.#ROOT = this.createDivWithId(this.parentElement, GRID_SELECTORS.ROOT, GRID_SELECTORS.ROOT);

        // CompJS Grid elements initialization
        this.#initHeader();
        this.#initBody();
        this.#initFooter();

        // Additional elements
        if (this.#HAS_TRASH)
            this.addTrashIcon()

        if (this.#HAS_LOCK)
            this.addLockIcon()

        // CompJS Grid observers
        this.addObservers();
    }

    // - Error handling

    // Throw undefined element error
    #throwUndefinedElementError(elementName){
        throw new Error(`CompJS Grid ${elementName} element is not defined...`)
    }

    // Throw missing property error
    #throwMissingPropertyError(propertyName){
        throw new Error(`CompJS Grid ${propertyName} property is not defined...`)
    }

    // Throw missing JSON property error
    #throwMissingJSONPropertyError(propertyName){
        throw new Error(`JSON CompJS Grid ${propertyName} property is not defined...`)
    }

    // - Element initializers

    // Header initializer
    #initHeader() {
        // Header
        this.#HEADER = this.CompJS.createDiv( this.#ROOT, GRID_SELECTORS.HEADER, GRID_SELECTORS.HEADER_NO_CHECKBOXES);

        // Title
        this.#HEADER_TITLE_CONTAINER= this.CompJS.createDiv( this.#HEADER, GRID_SELECTORS.HEADER_TITLE_CONTAINER);

        this.#HEADER_TITLE = this.CompJS.createElement("h2",this.#HEADER_TITLE_CONTAINER, GRID_SELECTORS.HEADER_TITLE);
        this.#HEADER_TITLE.contentEditable=this.isContentEditable()
    }

    // Body initializer
    #initBody() {
        // Body
        this.#BODY = this.CompJS.createDiv(this.#ROOT, GRID_SELECTORS.BODY);
        this.#BODY_HEADER = this.CompJS.createDiv(this.#BODY, GRID_SELECTORS.BODY_HEADER, GRID_SELECTORS.BODY_HEADER_NO_CHECKBOXES);

        // Body content
        this.#BODY_CONTENT = this.createDivWithId(this.#BODY, GRID_SELECTORS.BODY_CONTENT, GRID_SELECTORS.BODY_CONTENT);

        // Body content data
        this.#BODY_CONTENT_DATA = this.createDivWithId( this.#BODY_CONTENT,GRID_SELECTORS.BODY_CONTENT_DATA, GRID_SELECTORS.BODY_CONTENT_DATA, GRID_SELECTORS.BODY_CONTENT_DATA_NO_CHECKBOXES);
    }

    // Footer initializer
    #initFooter() {
        // Footer
        this.#FOOTER = this.CompJS.createDiv( this.#ROOT, GRID_SELECTORS.FOOTER, GRID_SELECTORS.FOOTER_NO_CHECKBOXES,COMPJS_SELECTORS.HIDE);

        // Pagination
        this.#FOOTER_PAGINATION = this.CompJS.createDiv( this.#FOOTER, GRID_SELECTORS.FOOTER_PAGINATION);

        // Previous and next buttons
        this.#PREVIOUS_BTN = this.CompJS.createButton( this.#FOOTER_PAGINATION,GRID_SELECTORS.FOOTER_OUTER_BTN);
        this.#PREVIOUS_BTN.innerHTML="Previous"

        // Next button
        this.#NEXT_BTN = this.CompJS.createButton( this.#FOOTER_PAGINATION,GRID_SELECTORS.FOOTER_OUTER_BTN);
        this.#NEXT_BTN.innerHTML= "Next"

        // Inner buttons container
        this.#INNER_BTN_CONTAINER = this.CompJS.createDiv( this.#FOOTER_PAGINATION, GRID_SELECTORS.FOOTER_INNER_BTN_CONTAINER);

        // First page and last page buttons
        this.#FIRST_PAGE_BTN=this.CompJS.createButton(this.#INNER_BTN_CONTAINER,GRID_SELECTORS.FOOTER_INNER_BTN)

        this.#LAST_PAGE_BTN=this.CompJS.createButton(this.#INNER_BTN_CONTAINER,GRID_SELECTORS.FOOTER_INNER_BTN)

        // Page button container
        this.#PAGE_BTN_CONTAINER = this.CompJS.createDiv( this.#INNER_BTN_CONTAINER, GRID_SELECTORS.FOOTER_PAGE_BTN_CONTAINER)
    }

    // - Updates

    // Update header element
    #updateHeader() {
        if(this.#TITLE===undefined)
            this.#throwMissingPropertyError("title")

        if(!this.#TITLE.length)
            this.#toggleWarnings()

        this.#HEADER_TITLE.innerHTML = String(this.#TITLE);
        this.#HEADER_TITLE.contentEditable=this.isContentEditable()
    }

    // Update body header element
    #updateBodyHeader() {
        while (this.#BODY_HEADER.firstChild)
            this.#BODY_HEADER.removeChild(this.#BODY_HEADER.firstChild)

        if(!this.#COLUMNS_SORTED_KEYS)
            throw new Error("JSON CompJS Grid columns property is not defined...")

        // Set columns' data
        this.#COLUMNS_SORTED_KEYS.forEach(([key, dataMap]) => {
            const columnElement = this.CompJS.createDiv( this.#BODY_HEADER, GRID_SELECTORS.BODY_HEADER_COLUMN);

            columnElement.dataset[GRID_JSON.COLUMN_DATA_TYPE]=dataMap.get(GRID_JSON.COLUMN_DATA_TYPE)
            columnElement.dataset[GRID_JSON.COLUMN_ID]=key

            const columnTitle = dataMap.get(GRID_JSON.COLUMN_DATA_TITLE)

            if(columnTitle.length)
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

        if(this.#BODY_CONTENT_DATA!==undefined)
            while ((firstChild = this.#BODY_CONTENT_DATA.firstChild))
                this.#BODY_CONTENT_DATA.removeChild(firstChild)

        if (!this.#HAS_TRASH&&this.#BODY_CONTENT_CHECKBOXES!==undefined)
            while ((firstChild = this.#BODY_CONTENT_CHECKBOXES.firstChild))
                this.#BODY_CONTENT_CHECKBOXES.removeChild(firstChild)

        if(this.#PAGE_SIZE===undefined)
            this.#throwMissingPropertyError("page size")

        if(this.#DATA===undefined)
            this.#throwMissingPropertyError("data"            )

        // Update rows data
        if(this.#NUMBER_PAGES!==undefined)
            this.#NUMBER_PAGES_OLD=this.#NUMBER_PAGES

        this.#NUMBER_PAGES = Math.floor(this.#DATA.length / this.#PAGE_SIZE)
        this.#BODY_CONTENT_DATA_PAGES_HEIGHT = new Map()

        this.#addPageElementResizeObserver()

        // Get total height size in rems
        for (let i = 0; i < this.#DATA.length; i += this.#PAGE_SIZE)
            this.#addBodyContentPage(i)
    }

    // Add body content page element
    #addBodyContentPage(i) {
        const pageElement = this.CompJS.createDiv( this.#BODY_CONTENT_DATA, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE, COMPJS_SELECTORS.HIDE, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_HIDE_RIGHT);
        const pageIdx = Math.floor(i / this.#PAGE_SIZE)
        this.#BODY_CONTENT_DATA_PAGES_HEIGHT.set(pageElement,this.CompJS.getElementTotalHeight(pageElement))

            // Remove hide class from current page
            if (pageIdx === this.#CURRENT_PAGE)
                pageElement.classList.remove(COMPJS_SELECTORS.HIDE, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_HIDE_RIGHT)

            // Observe
            this.#getObserver(this.#PAGE_ELEMENT_RESIZE_OBSERVER).observe(pageElement)

            for (let j = i; j < i + this.#PAGE_SIZE; j++)
                if (j < this.#DATA.length)
                    this.#updateBodyContentDataRow(pageElement, j)
    }

    // Update body content data row
    #updateBodyContentDataRow(pageElement, rowIndex) {
        const rowData = this.#DATA[rowIndex]
        const rowElement =this.CompJS.createDiv( pageElement, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW);

        this.#COLUMNS_SORTED_KEYS.forEach(([key, dataMap]) => {
            const cellElement =this.CompJS.createDiv( rowElement, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_CELL);

            cellElement.dataset[GRID_JSON.COLUMN_ID] = key;

            const cellData = rowData.get(key)

            if(cellData!==undefined)
                cellElement.innerHTML =cellData ;

            else if(!dataMap.get(GRID_JSON.COLUMN_DATA_NULLABLE))
                this.#toggleCellWarning(cellElement)
        })
    }

    // Resize body content element according to its child elements
    #resizeBodyContent() {
        const maxHeight=this.#getBodyContentDataPageHeight(this.#MAX_HEIGHT_ELEMENT)
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
        if(this.#NUMBER_PAGES===1) {
            this.#FOOTER.classList.add(COMPJS_SELECTORS.HIDE)
            return
        }

        // Clear footer pagination
        while (this.#PAGE_BTN_CONTAINER.firstChild)
            this.#PAGE_BTN_CONTAINER.removeChild(this.#PAGE_BTN_CONTAINER.firstChild)

        this.#FIRST_PAGE_BTN.innerHTML=1
        this.#LAST_PAGE_BTN.innerHTML=this.#NUMBER_PAGES

        // Remove hide class from footer
        this.#FOOTER.classList.remove(COMPJS_SELECTORS.HIDE)
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
        this.#PAGE_SIZE =  parseInt(jsonObject[GRID_JSON.PAGE_SIZE]);
        this.#COLUMNS = this.#loadJSONColumnsData(jsonObject[GRID_JSON.COLUMNS]);
        this.#DATA =  this.#loadJSONBodyData(jsonObject[GRID_JSON.DATA]);

        // Sort columns keys
        this.#sortJSONColumnsKeys();

        // Update elements
        this.#updateHeader()
        this.#updateBodyHeader()
        this.#updateBody()
        this.#updateFooter()
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
        const columnsMap=new Map(       )
        const requiredProps=[[GRID_JSON.COLUMN_DATA_INDEX,"index"],[GRID_JSON.COLUMN_DATA_TITLE,"title"],[GRID_JSON.COLUMN_DATA_TYPE,"type"],[GRID_JSON.COLUMN_DATA_NULLABLE,"nullable"]]
        let key, data, dataMap

        for (let columnMap of columnsList) {
             key=columnMap[GRID_JSON.COLUMN_ID]
            if(!key)
                this.#throwMissingJSONPropertyError("ID")

             data=columnMap[GRID_JSON.COLUMN_DATA]
            if(!data)
                this.#throwMissingJSONPropertyError("data")

             dataMap=getMapFromObject(data)

            // Check for required properties
            requiredProps.forEach(([prop, propName]) => {
                if(!dataMap.has(prop))
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
        if(!this.#BODY_CONTENT_DATA_PAGES_HEIGHT.has(element))
            this.#throwUndefinedElementError("page")

        return this.#BODY_CONTENT_DATA_PAGES_HEIGHT.get(element)}

    // Get body header columns
    #getBodyHeaderColumns(){
        if(this.#BODY_HEADER===undefined)
            this.#throwUndefinedElementError("body header")

        return this.#BODY_HEADER.querySelectorAll(`.${GRID_SELECTORS.BODY_HEADER_COLUMN}`)
    }

    // Get body content data rows
    #getBodyContentDataRows(){
        if(this.#BODY_CONTENT_DATA===undefined)
            this.#throwUndefinedElementError("body content data")

        return this.#BODY_CONTENT_DATA.querySelectorAll(`.${GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW}`)
    }

    // Get body content data cells
    #getBodyContentDataCells(){
        if(this.#BODY_CONTENT_DATA===undefined)
            this.#throwUndefinedElementError("body content data")

        return this.#BODY_CONTENT_DATA.querySelectorAll(`.${GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_CELL}`)
    }

    // - Icons

    // Add lock icon
    addLockIcon() {
        if (this.#HAS_LOCK)
            return;

        if(this.#LOCK_STATUS===undefined)
            this.#throwMissingJSONPropertyError("lock status")

        this.#HAS_LOCK = true

        // Icons
        this.#HEADER_ICONS = this.CompJS.createDiv( this.#HEADER, GRID_SELECTORS.HEADER_ICONS);

        // Lock icons
        const headerIconLockContainer = this.CompJS.createDiv( this.#HEADER_ICONS, GRID_SELECTORS.HEADER_ICON_CONTAINER);

        // Load lock SVG click event function
        const makeDivEditable=element => element.contentEditable=this.isContentEditable()

        headerIconLockContainer.addEventListener('click', event => {
            event.preventDefault();

            // Change lock status
            this.#LOCK_STATUS = !this.#LOCK_STATUS;

            makeDivEditable(this.#HEADER_TITLE)
            this.#getBodyHeaderColumns().forEach(makeDivEditable)
            this.#getBodyContentDataCells().forEach(makeDivEditable)

            headerIconLockContainer.childNodes.forEach(child =>child.classList.toggle(COMPJS_SELECTORS.HIDE))
        })

        // Icons objects
        const unlockIcon={
            url:COMPJS_URLS.UNLOCK_SVG,
            id:GRID_SELECTORS.ICON_UNLOCK,
            changeOnLock:true
        }

        const lockIcon={
            url:COMPJS_URLS.LOCK_SVG,
            id:GRID_SELECTORS.ICON_LOCK,
            changeOnLock:false
        }

        // Load lock SVG
        for(let icon of [unlockIcon,lockIcon])
        this.CompJS.loadHiddenSVG(icon.url,COMPJS_CONSTANTS.VIEW_BOX,icon.id)
            .then(()=>{
                const svgElement=this.CompJS.loadSVG(headerIconLockContainer, icon.id, GRID_SELECTORS.HEADER_ICON)

                if(icon.changeOnLock)
                    this.CompJS.addClassNames(svgElement, COMPJS_SELECTORS.HIDE)
            })
            .catch(err=>console.error(err))
    }

    // Add trash icon
    addTrashIcon() {
        if (this.#HAS_TRASH)
            return;

        this.#HAS_TRASH = true

        // Remove classes when there is no lock icon
        this.#HEADER.classList.remove(GRID_SELECTORS.HEADER_NO_CHECKBOXES)
        this.#BODY_HEADER.classList.remove(GRID_SELECTORS.BODY_HEADER_NO_CHECKBOXES)
        this.#BODY_CONTENT_DATA.classList.remove(GRID_SELECTORS.BODY_CONTENT_DATA_NO_CHECKBOXES)
        this.#FOOTER.classList.remove(GRID_SELECTORS.FOOTER_NO_CHECKBOXES)
    }

    // - Checkers

    // Check if the grid is locked
    isContentEditable(){
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
    #hasObserver(observerName){
        return this.#OBSERVERS.has(observerName)
    }

     // Get observer
    #getObserver(observerName){
        if(!this.#OBSERVERS.has(observerName))
            throw new Error("Observer is not defined...")

        return this.#OBSERVERS.get(observerName)
    }

    // Set observer
    #setObserver(observerName, observer) {
        if(this.#OBSERVERS.has(observerName))
            throw new Error("Observer is already defined...")

        this.#OBSERVERS.set(observerName, observer)
    }

    // - Resize observers

    // Page Element Resize Observer
    #addPageElementResizeObserver(){
        if(this.#hasObserver(this.#PAGE_ELEMENT_RESIZE_OBSERVER))
            return

         const pageElementResizeObserverCallback=entries => {
            for (let entry of entries) {
                let maxHeight
                const height=this.CompJS.getElementTotalHeight(entry.target)
                const isNull=this.#MAX_HEIGHT_ELEMENT===null

                if(!isNull)
                    maxHeight = this.#getBodyContentDataPageHeight(this.#MAX_HEIGHT_ELEMENT)

                if (isNull||height > maxHeight) {
                    // Update page element with the maximum height
                    this.#MAX_HEIGHT_ELEMENT =entry.target

                    // Update body content data page height
                    this.#BODY_CONTENT_DATA_PAGES_HEIGHT.set(this.#MAX_HEIGHT_ELEMENT,height)

                    this.#resizeBodyContent()
                    continue
                }

                if(height===maxHeight)
                    continue

                if(entry.target===this.#MAX_HEIGHT_ELEMENT){
                    // Update body content data page height
                    this.#BODY_CONTENT_DATA_PAGES_HEIGHT.set(this.#MAX_HEIGHT_ELEMENT,height)

                    // Update page element with the maximum height
                        for(let [element, height] of this.#BODY_CONTENT_DATA_PAGES_HEIGHT.entries())
                            if(height>maxHeight) {
                                this.#MAX_HEIGHT_ELEMENT = element
                                maxHeight=height
                            }

                        this.#resizeBodyContent()
                }
            }}

        const pageElementResizeObserver=new ResizeObserver(pageElementResizeObserverCallback)
        this.#setObserver(this.#PAGE_ELEMENT_RESIZE_OBSERVER, pageElementResizeObserver)
    }

    // - Mutation observers

    // Title Observer
    addTitleObserver() {
        if(this.#hasObserver(this.#TITLE_OBSERVER))
            return

        const titleObserverOptions = {
            subtree: true,
            characterData:true
        }

        const titleObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if(mutation.type!=="characterData")
                    return

                if(mutation.target.length===0)
                    this.#toggleWarnings()

                    else if(this.#GLOBAL_WARNING)
                    this.#toggleWarnings()
            })
        })

        this.#setObserver(this.#TITLE_OBSERVER, titleObserver)
        titleObserver.observe(this.#HEADER_TITLE, titleObserverOptions)
    }

    // Columns Observer
    addColumnsObserver() {
        if(this.#hasObserver(this.#COLUMNS_OBSERVER))
            return

        const columnsObserverOptions = {
            subtree: true,
            characterData:true
        }

        const columnsObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if(mutation.type!=="characterData")
                    return

                const element=mutation.target.ownerDocument.activeElement

                if(mutation.target.textContent.length===0)
                    this.#toggleColumnWarning(element)

                else if(this.#EMPTY_COLUMNS.get(element)&&!this.#GLOBAL_WARNING)
                    this.#toggleColumnWarning(element)
            })
        })

        this.#setObserver(this.#COLUMNS_OBSERVER, columnsObserver)
        columnsObserver.observe(this.#BODY_HEADER, columnsObserverOptions)
    }

    /*
    // Body Content Data Observer
    #addBodyContentDataObserver() {
        if(this.#getObserver(this.#BODY_CONTENT_DATA_OBSERVER))
            return

        const pageObserverOptions = {
            childList: true,
        }

        const pageObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if(mutation.type!=="characterData")
                    return

                const element=mutation.target.ownerDocument.activeElement

                if(mutation.target.textContent.length===0)
                    this.#addPageWarning(element)

                else if(this.#EMPTY_PAGES.get(element))
                    if(!this.#GLOBAL_WARNING)
                        this.#removePageWarning(element)
            })
        })

        pageObserver.observe(this.#BODY_CONTENT_DATA, pageObserverOptions)
    }
    */

    // Cells Observer
    addCellsObserver() {
        if(this.#hasObserver(this.#CELLS_OBSERVER))
            return

        const cellsObserverOptions = {
            subtree: true,
            characterData:true
        }

        const cellsObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type !== "characterData")
                    return

                const element = mutation.target.ownerDocument.activeElement
                const columnId = element.dataset[GRID_JSON.COLUMN_ID]
                const columnData = this.#COLUMNS.get(columnId)
                const textContent = mutation.target.textContent

                // Validate empty cell
                if (textContent.length === 0&&!columnData.get(GRID_JSON.COLUMN_DATA_NULLABLE)) {
                    this.#toggleCellWarning(element)
                    return
                }

                // Validate cell data type
                const columnDataType = columnData.get(GRID_JSON.COLUMN_DATA_TYPE)
                const regularExpression = this.CompJS.getDataTypeRegExp(columnDataType)

                if ( regularExpression!== undefined)
                    if(!regularExpression.test(textContent)){
                        this.#toggleCellWarning(element)
                        return
                    }

                if(this.#EMPTY_CELLS.get(element))
                    this.#toggleCellWarning(element)
            })
        })

        this.#setObserver(this.#CELLS_OBSERVER, cellsObserver)
        cellsObserver.observe(this.#BODY_CONTENT_DATA, cellsObserverOptions)
    }

    // Add Observers
    addObservers() {
        this.addTitleObserver()
        this.addColumnsObserver()
        this.addCellsObserver()
    }

    // - Warnings

     // Add or remove element warning status from a given map
    #toggleElementWarningStatus(map, element) {
        if(!element)
            return

        if(map.has(element))
            map.set(element,!map.get(element))
        else
            map.set(element,true)
    }

    // Add or remove global warning classes
    #toggleWarnings() {
        this.#GLOBAL_WARNING=!this.#GLOBAL_WARNING

        // Title
        this.#HEADER_TITLE.classList.toggle(GRID_SELECTORS.HEADER_TITLE_WARNING)

        // Body
        this.#BODY_HEADER.classList.toggle(GRID_SELECTORS.BODY_HEADER_WARNING)

        this.#getBodyContentDataRows().forEach(cell => {cell.classList.toggle(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_WARNING)})
    }

    // Add or remove column warning classes
    #toggleColumnWarning(element){
        if(!element)
            return

        this.#toggleElementWarningStatus(this.#EMPTY_COLUMNS,element)
        element.classList.toggle(GRID_SELECTORS.BODY_HEADER_COLUMN_WARNING)
    }

    // Add or remove cell warning classes
     #toggleCellWarning(element){
        if(!element)
            return

        this.#toggleElementWarningStatus(this.#EMPTY_CELLS,element)
        element.classList.add(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_CELL_WARNING)
    }

    // - Disconnect observers

     // Disconnect Observer
    disconnectObserver(observerName) {
        if(!this.#OBSERVERS.has(observerName))
            return

        this.#getObserver(observerName).disconnect()
        this.#OBSERVERS.delete(observerName)
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
    disconnectCellsObserver(){
        this.disconnectObserver(this.#CELLS_OBSERVER)
    }

    // Disconnect title, columns and cells observers
    disconnectAllObservers() {
        this.disconnectTitleObserver()
        this.disconnectColumnsObserver()
        this.disconnectCellsObserver()
    }
}