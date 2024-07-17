'use strict';

import {COMPJS_CONSTANTS,COMPJS_PATHS, COMPJS_SELECTORS, COMPJS_URLS} from "./compjs-props.js";
import {CompJS} from "./compjs.js";
import {GRID_SELECTORS, GRID_SELECTORS_LIST, GRID_JSON} from "./grid-props.js";
import {getListFromObject, getMapFromObject} from "./utils.js";

export class Grid {
    static #COMPJS;
    static #DEFAULT_HAS_LOCK = false
    static #DEFAULT_HAS_TRASH = false
    static #DEFAULT_HAS_INSERTION = false

    // Element ID
    #ELEMENT_ID;

    // Configuration
    #TITLE="Start creating!"
    #LOCK_STATUS
    #PAGE_SIZE
    #COLUMNS
    #COLUMNS_SORTED_KEYS
    #DATA

    #HAS_LOCK = Grid.#DEFAULT_HAS_LOCK
    #HAS_TRASH = Grid.#DEFAULT_HAS_TRASH
    #HAS_INSERTION = Grid.#DEFAULT_HAS_INSERTION

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

    // Empty elements and warning flags
    #GLOBAL_WARNING=false
    #EMPTY_COLUMNS=new Map()
    #EMPTY_CELLS=new Map()

    // Mutation observers
    #TITLE_OBSERVER
    #COLUMNS_OBSERVER
    #CELLS_OBSERVER

    static {
        Grid.#COMPJS = new CompJS();
        Grid.#COMPJS.addStyleSheet(COMPJS_PATHS.GRID_STYLE);
    }

    constructor(elementId, parentElement) {
        this.#PARENT_ELEMENT = (parentElement === undefined) ? document.body : parentElement;
        this.#ELEMENT_ID = String(elementId)

        // Initialize
        this.#mainInitializer(elementId);
    }

    // - Initializers

    // Main initializer
    #mainInitializer() {
        // Root
        this.#ROOT = Grid.#COMPJS.createElement("div", this.#PARENT_ELEMENT, GRID_SELECTORS.ROOT);

        // Set root element ID
        const rootId = this.getSelectorWithElementId(GRID_SELECTORS.ROOT);
        Grid.#COMPJS.setCompJSElementID(this.#ROOT,rootId);

        // Grid elements
        this.#initializeHeader();
        this.#initializeBody();

        // Grid observers
        this.addObservers();
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
    }

    // - Icons

    addLockIcon() {
        if (this.#HAS_LOCK)
            return;

        if(this.#LOCK_STATUS===undefined)
            throw new Error("JSON Grid locked property is not defined...")

        this.#HAS_LOCK = true

        // Icons
        this.#HEADER_ICONS = Grid.#COMPJS.createElement("div", this.#HEADER, GRID_SELECTORS.HEADER_ICONS);

        // Lock icons
        const headerIconLockContainer = Grid.#COMPJS.createElement("div", this.#HEADER_ICONS, GRID_SELECTORS.HEADER_ICON_CONTAINER);

        // Load lock SVG click event function
        const makeDivEditable=element => {element.contentEditable=String(!this.#LOCK_STATUS)}

        headerIconLockContainer.addEventListener('click', event => {
            event.preventDefault();

            // Change lock status
            this.#LOCK_STATUS = !this.#LOCK_STATUS;

            makeDivEditable(this.#HEADER_TITLE)
            this.#getBodyHeaderColumns().forEach(makeDivEditable)
            this.#getBodyContentDataCells().forEach(makeDivEditable)

            for (let className of [GRID_SELECTORS.HEADER_ICON_HIDDEN, COMPJS_SELECTORS.HIDE])
                headerIconLockContainer.childNodes.forEach(child =>child.classList.toggle(className))
        })

        Grid.#COMPJS.loadHiddenSVG(COMPJS_URLS.UNLOCK_SVG,COMPJS_CONSTANTS.VIEW_BOX, GRID_SELECTORS.ICON_UNLOCK)
            .then(r=>{
                const svgElement=Grid.#COMPJS.loadSVG(headerIconLockContainer, GRID_SELECTORS.ICON_UNLOCK, GRID_SELECTORS.HEADER_ICON)

                if(this.#LOCK_STATUS)
                    Grid.#COMPJS.addClassNames(svgElement, COMPJS_SELECTORS.HIDE, GRID_SELECTORS.HEADER_ICON_HIDDEN)
            })
            .catch(err=>console.error(err))

        Grid.#COMPJS.loadHiddenSVG(COMPJS_URLS.LOCK_SVG,COMPJS_CONSTANTS.VIEW_BOX, GRID_SELECTORS.ICON_LOCK)
            .then(r=>{
                const svgElement=Grid.#COMPJS.loadSVG(headerIconLockContainer, GRID_SELECTORS.ICON_LOCK, GRID_SELECTORS.HEADER_ICON)

                if(!this.#LOCK_STATUS)
                    Grid.#COMPJS.addClassNames(svgElement, COMPJS_SELECTORS.HIDE, GRID_SELECTORS.HEADER_ICON_HIDDEN)
            })
            .catch(err=>console.error(err))
    }

    addTrashIcon() {
        if (this.#HAS_TRASH)
            return;

        this.#HAS_TRASH = true
    }

    // - Mutation observers

    // Add Observers
    addObservers() {
        this.addTitleObserver()
        this.addColumnsObserver()
        this.addCellsObserver()
    }

    // Title Observer
    addTitleObserver() {
        if(this.#TITLE_OBSERVER!==undefined)
            return

        const titleObserverOptions = {
            subtree: true,
            characterData:true
        }
        const addGlobalWarning=()=>{
            this.#addWarningClassNames()
            this.#GLOBAL_WARNING=true
        }

        const titleObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if(mutation.type!=="characterData")
                    return

                if(mutation.target.textContent.length===0)
                    addGlobalWarning()

                else if(this.#GLOBAL_WARNING){
                    this.#removeWarningClassNames(                   )
                    this.#GLOBAL_WARNING=false
                }
            })
        })

        titleObserver.observe(this.#HEADER_TITLE, titleObserverOptions)
    }

    // Columns Observer
    addColumnsObserver() {
        if(this.#COLUMNS_OBSERVER!==undefined)
            return

        const columnsObserverOptions = {
            subtree: true,
            characterData:true
        }
        const addColumnWarning=element=>{
            this.#addColumnWarningClassName(element)
            this.#EMPTY_COLUMNS.set(element,true)
        }

        const columnsObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if(mutation.type!=="characterData")
                    return

                const element=mutation.target.ownerDocument.activeElement

                if(mutation.target.textContent.length===0)
                    addColumnWarning(element)

                else if(this.#EMPTY_COLUMNS.get(element)){
                    if(!this.#GLOBAL_WARNING)
                        this.#removeColumnWarningClassName(element)

                    this.#EMPTY_COLUMNS.set(element,false)
                }

            })
        })

        columnsObserver.observe(this.#BODY_HEADER, columnsObserverOptions)
    }

    // Cells Observer
    addCellsObserver() {
        if(this.#CELLS_OBSERVER!==undefined)
            return

        const cellsObserverOptions = {
            subtree: true,
            characterData:true
        }
        const addCellWarning=element=>{
            this.#addCellWarningClassName(element)
            this.#EMPTY_CELLS.set(element,true)
        }

        const cellsObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type !== "characterData")
                    return

                const element = mutation.target.ownerDocument.activeElement
                const columnId = element.dataset[GRID_JSON.COLUMN_ID]
                const columnData = this.#COLUMNS.get(columnId)
                const textContent = mutation.target.textContent

                if (textContent.length === 0&&!columnData.get(GRID_JSON.COLUMN_DATA_NULLABLE)) {
                    addCellWarning(element)
                    return
                }

                const columnDataType = columnData.get(GRID_JSON.COLUMN_DATA_TYPE)

                // String columns
                // NOTE: There's no need to check string columns

                // Integer columns
                if (columnDataType === "int"){
                    if (!/^[-+]?[0-9]+$/.test(textContent)){
                        addCellWarning(element)
                        return
                    }
                }

                // Unsigned integer columns
                if (columnDataType === "uint"){
                    if (!/^[0-9]+$/.test(textContent)){
                        addCellWarning(element)
                        return
                    }
                }

                // Float columns
                else if (columnDataType === "float"){
                    if (!/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(textContent)){
                        addCellWarning(element)
                        return
                    }
                }

                // Unsigned float columns
                else if (columnDataType === "ufloat"){
                    if (!/^[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(textContent)){
                        addCellWarning(element)
                        return
                    }
                }

                if(this.#EMPTY_CELLS.get(element)){
                    this.#removeCellWarningClassName(element)
                    this.#EMPTY_CELLS.set(element,false)
                }
            })
        })

        cellsObserver.observe(this.#BODY_CONTENT_DATA, cellsObserverOptions)
    }

    #addWarningClassNames(addToTitle=true,addToColumnsHeader=true,addToRows=true) {
        // Title
        if(addToTitle)
        this.#HEADER_TITLE.classList.add(GRID_SELECTORS.HEADER_TITLE_WARNING)

        // Body
        if(addToColumnsHeader)
            this.#BODY_HEADER.classList.add(GRID_SELECTORS.BODY_HEADER_WARNING)

        if(addToRows)
            this.#getBodyContentDataRows().forEach(cell => {cell.classList.add(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_WARNING)})
    }

    #removeWarningClassNames(removeFromTitle=true,removeFromColumnsHeader=true,removeFromRows=true) {
        // Title
        if(removeFromTitle)
        this.#HEADER_TITLE.classList.remove(GRID_SELECTORS.HEADER_TITLE_WARNING)

        // Body
        if(removeFromColumnsHeader)
            this.#BODY_HEADER.classList.remove(GRID_SELECTORS.BODY_HEADER_WARNING)

        if(removeFromRows)
            this.#getBodyContentDataRows().forEach(cell => {cell.classList.remove(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_WARNING)})
    }

    #addColumnWarningClassName(element){
        if(!element)
            return

        element.classList.add(GRID_SELECTORS.BODY_HEADER_COLUMN_WARNING)
    }

    #removeColumnWarningClassName(element){
        if(!element)
            return

        element.classList.remove(GRID_SELECTORS.BODY_HEADER_COLUMN_WARNING)
    }

     #addCellWarningClassName(element){
        if(!element)
            return

        element.classList.add(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_CELL_WARNING)
    }

    #removeCellWarningClassName(element){
        if(!element)
            return

        element.classList.remove(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_CELL_WARNING)
    }

    disconnectTitleObserver() {
        if(this.#TITLE_OBSERVER===undefined)
            return

        this.#TITLE_OBSERVER.disconnect()
        this.#TITLE_OBSERVER=undefined
    }

    disconnectColumnsObserver() {
        if(this.#COLUMNS_OBSERVER===undefined)
            return

        this.#COLUMNS_OBSERVER.disconnect()
        this.#COLUMNS_OBSERVER=undefined
    }

    disconnectAllObservers() {
        this.disconnectTitleObserver()
        this.disconnectColumnsObserver()
    }

    // - JSON

    // Read JSON props
    async loadJSON(jsonObject) {
        if (!jsonObject instanceof Object)
            throw new Error("JSON Grid is not an object...")

        // Header
        this.#LOCK_STATUS = Boolean(jsonObject[GRID_JSON.LOCKED]);
        this.#TITLE = String(jsonObject[GRID_JSON.TITLE]);

        // Data
        this.#PAGE_SIZE =  parseInt(jsonObject[GRID_JSON.PAGE_SIZE]);
        this.#COLUMNS = this.#loadJSONColumnsData(jsonObject[GRID_JSON.COLUMNS]);
        this.#DATA =  this.#loadJSONBodyData(jsonObject[GRID_JSON.DATA]);

        this.#sortJSONColumnsKeys();

        // Updates
        this.#updateHeader()
        this.#updateBodyHeader()
        this.#updateBody()
    }

    #loadJSONColumnsData(columnsObject) {
        const columnsList = getListFromObject(columnsObject)
        const columnsMap=new Map(       )
        let key, data, dataMap

        for (let columnMap of columnsList) {
             key=columnMap[GRID_JSON.COLUMN_ID]
            if(!key)
                throw new Error("JSON Grid column ID property is not defined...")

             data=columnMap[GRID_JSON.COLUMN_DATA]
            if(!data)
                throw new Error("JSON Grid column data property is not defined...")

             dataMap=getMapFromObject(data)

            // Check for required properties
            if(!dataMap.has(GRID_JSON.COLUMN_DATA_INDEX))
                throw new Error("JSON Grid column index property is not defined...")

            if(!dataMap.has(GRID_JSON.COLUMN_DATA_TITLE))
                throw new Error("JSON Grid column title property is not defined...")

            if(!dataMap.has(GRID_JSON.COLUMN_DATA_TYPE))
                throw new Error("JSON Grid column type property is not defined...")

            if(!dataMap.has(GRID_JSON.COLUMN_DATA_NULLABLE))
                throw new Error("JSON Grid column nullable property is not defined...")

            columnsMap.set(key, dataMap)
        }

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

    // - Updates

    #updateHeader() {
        if(this.#TITLE===undefined)
            throw new Error("JSON Grid title property is not defined...")

        if(this.#HEADER_TITLE.length===0) {
            this.#addWarningClassNames()
            this.#GLOBAL_WARNING = true
        }

        this.#HEADER_TITLE.innerHTML = String(this.#TITLE);
    }

    #updateBodyHeader() {
        while (this.#BODY_HEADER.firstChild)
            this.#BODY_HEADER.removeChild(this.#BODY_HEADER.firstChild)

        if(this.#COLUMNS_SORTED_KEYS===undefined)
            throw new Error("JSON Grid columns property is not defined...")

        // Set columns' data
        this.#COLUMNS_SORTED_KEYS.forEach(([key, dataMap]) => {
            const columnElement = Grid.#COMPJS.createElement("div", this.#BODY_HEADER, GRID_SELECTORS.BODY_HEADER_COLUMN);

            columnElement.dataset[GRID_JSON.COLUMN_DATA_TYPE]=dataMap.get(GRID_JSON.COLUMN_DATA_TYPE)
            columnElement.dataset[GRID_JSON.COLUMN_ID]=key

            const columnTitle = dataMap.get(GRID_JSON.COLUMN_DATA_TITLE)

            if(columnTitle.length>0)
                columnElement.innerHTML = columnTitle;

            else{
                this.#addColumnWarningClassName(columnElement)
                this.#EMPTY_COLUMNS.set(columnElement,true)
            }

            columnElement.style.order = dataMap.get(GRID_JSON.COLUMN_DATA_INDEX);
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

        if(this.#PAGE_SIZE===undefined)
            throw new Error("JSON Grid page size property is not defined...")

        if(this.#DATA===undefined)
            throw new Error("JSON Grid data property is not defined...")

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

    #updateBodyContentDataRow(pageElement, rowIndex) {
        const rowData = this.#DATA[rowIndex]
        const rowElement = Grid.#COMPJS.createElement("div", pageElement, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW);

        this.#COLUMNS_SORTED_KEYS.forEach(([key, dataMap]) => {
            const cellElement = Grid.#COMPJS.createElement("div", rowElement, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_CELL);

            cellElement.dataset[GRID_JSON.COLUMN_ID] = key;

            const cellData = rowData.get(key)

            if(cellData!==undefined)
                cellElement.innerHTML =cellData ;

            else if(!dataMap.get(GRID_JSON.COLUMN_DATA_NULLABLE)) {
                this.#addCellWarningClassName(cellElement)
                this.#EMPTY_CELLS.set(cellElement,true)
            }
        })
    }

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

    #getBodyContentDataPageHeight(element) {
        if(!this.#BODY_CONTENT_DATA_PAGES.has(element))
            throw new Error("Body content data page is not defined...")

        return this.#BODY_CONTENT_DATA_PAGES.get(element)}

    #getBodyHeaderColumns(){
        if(this.#BODY_HEADER===undefined)
            throw new Error("Body header is not defined...")

        return this.#BODY_HEADER.querySelectorAll(`.${GRID_SELECTORS.BODY_HEADER_COLUMN}`)
    }

    #getBodyContentDataRows(){
        if(this.#BODY_CONTENT_DATA===undefined)
            throw new Error("Body content data is not defined...")

        return this.#BODY_CONTENT_DATA.querySelectorAll(`.${GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW}`)
    }

    #getBodyContentDataCells(){
        if(this.#BODY_CONTENT_DATA===undefined)
            throw new Error("Body content data is not defined...")

        return this.#BODY_CONTENT_DATA.querySelectorAll(`.${GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_CELL}`)
    }

    // Reset applied customized styles
    resetAppliedStyles(selector) {
        Grid.#COMPJS.checkSelector(selector);
        Grid.#COMPJS.resetAppliedStyles(selector);
    }
}