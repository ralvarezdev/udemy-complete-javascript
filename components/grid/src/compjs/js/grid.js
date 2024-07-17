'use strict';

import {COMPJS_CONSTANTS, COMPJS_SELECTORS, COMPJS_URLS} from "./compjs-props.js";
import {CompJSElement} from "./compjs-element.js";
import {GRID_SELECTORS, GRID_SELECTORS_LIST, GRID_JSON} from "./grid-props.js";
import {getListFromObject, getMapFromObject} from "./utils.js";

export class Grid extends CompJSElement {
    // Configuration
    #TITLE="Start creating!"
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

    constructor(elementId, parentElement) {
        super(elementId,parentElement)

        // Set root element
        this.#ROOT = this.createElementWithElementId("div", this.parentElement, GRID_SELECTORS.ROOT,GRID_SELECTORS.ROOT);

        // Grid elements
        this.#setHeader();
        this.#setBody();

        // Grid observers
        this.addObservers();
    }

    // - JSON

    // Load JSON props
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

    // - Updates

    // Update header element
    #updateHeader() {
        if(this.#TITLE===undefined)
            throw new Error("JSON Grid title property is not defined...")

        if(this.#HEADER_TITLE.length===0) {
            this.#addWarnings()
            this.#GLOBAL_WARNING = true
        }

        this.#HEADER_TITLE.innerHTML = String(this.#TITLE);
    }

    // Update body header element
    #updateBodyHeader() {
        while (this.#BODY_HEADER.firstChild)
            this.#BODY_HEADER.removeChild(this.#BODY_HEADER.firstChild)

        if(this.#COLUMNS_SORTED_KEYS===undefined)
            throw new Error("JSON Grid columns property is not defined...")

        // Set columns' data
        this.#COLUMNS_SORTED_KEYS.forEach(([key, dataMap]) => {
            const columnElement = this.CompJS.createElement("div", this.#BODY_HEADER, GRID_SELECTORS.BODY_HEADER_COLUMN);

            columnElement.dataset[GRID_JSON.COLUMN_DATA_TYPE]=dataMap.get(GRID_JSON.COLUMN_DATA_TYPE)
            columnElement.dataset[GRID_JSON.COLUMN_ID]=key

            const columnTitle = dataMap.get(GRID_JSON.COLUMN_DATA_TITLE)

            if(columnTitle.length>0)
                columnElement.innerHTML = columnTitle;

            else
                this.#addColumnWarning(columnElement)

            columnElement.style.order = dataMap.get(GRID_JSON.COLUMN_DATA_INDEX);
        })
    }

    // Update body element
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
                const height=this.CompJS.getElementTotalHeight(entry.target)
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
            const pageElement = this.CompJS.createElement("div", this.#BODY_CONTENT_DATA, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE, COMPJS_SELECTORS.HIDE, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_HIDDEN);
            const pageIdx = Math.floor(i / this.#PAGE_SIZE)
            this.#BODY_CONTENT_DATA_PAGES.set(pageElement,this.CompJS.getElementTotalHeight(pageElement))

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

    // Update body content data row
    #updateBodyContentDataRow(pageElement, rowIndex) {
        const rowData = this.#DATA[rowIndex]
        const rowElement =this.CompJS.createElement("div", pageElement, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW);

        this.#COLUMNS_SORTED_KEYS.forEach(([key, dataMap]) => {
            const cellElement =this.CompJS.createElement("div", rowElement, GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_CELL);

            cellElement.dataset[GRID_JSON.COLUMN_ID] = key;

            const cellData = rowData.get(key)

            if(cellData!==undefined)
                cellElement.innerHTML =cellData ;

            else if(!dataMap.get(GRID_JSON.COLUMN_DATA_NULLABLE))
                this.#addCellWarning(cellElement)
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

    // - Getters

    // Get grid root class properties values
     getGridProperties() {
        return this.getSelectorProperties(GRID_SELECTORS.ROOT, ...GRID_SELECTORS_LIST);
    }

    // Get grid root class properties values to the given element ID
     getGridIdProperties() {
        return this.getSelectorProperties(GRID_SELECTORS.ROOT, ...GRID_SELECTORS_LIST);
    }

    // Get body content data page height
    #getBodyContentDataPageHeight(element) {
        if(!this.#BODY_CONTENT_DATA_PAGES.has(element))
            throw new Error("Body content data page is not defined...")

        return this.#BODY_CONTENT_DATA_PAGES.get(element)}

    // Get body header columns
    #getBodyHeaderColumns(){
        if(this.#BODY_HEADER===undefined)
            throw new Error("Body header is not defined...")

        return this.#BODY_HEADER.querySelectorAll(`.${GRID_SELECTORS.BODY_HEADER_COLUMN}`)
    }

    // Get body content data rows
    #getBodyContentDataRows(){
        if(this.#BODY_CONTENT_DATA===undefined)
            throw new Error("Body content data is not defined...")

        return this.#BODY_CONTENT_DATA.querySelectorAll(`.${GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW}`)
    }

    // Get body content data cells
    #getBodyContentDataCells(){
        if(this.#BODY_CONTENT_DATA===undefined)
            throw new Error("Body content data is not defined...")

        return this.#BODY_CONTENT_DATA.querySelectorAll(`.${GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_CELL}`)
    }

    // - Setters

    // Set grid root class property value
     setGridProperty(propertyName, propertyValue) {
        this.setClassProperty(GRID_SELECTORS.ROOT, propertyName, propertyValue);
    }

    // Set grid root class property value to the given element ID
    setGridIdProperty(propertyName, propertyValue) {
        this.setIdFromSelectorProperty(GRID_SELECTORS.ROOT, propertyName, propertyValue);
    }

    // Header initializer
    #setHeader() {
        // Header
        this.#HEADER = this.CompJS.createElement("div", this.#ROOT, GRID_SELECTORS.HEADER);

        // Title
        this.#HEADER_TITLE = this.CompJS.createElement("h2", this.#HEADER, GRID_SELECTORS.HEADER_TITLE);
        this.#HEADER_TITLE.innerHTML = String(this.#TITLE);

        // Additional classes
        if (this.#HAS_TRASH)
            this.addTrashIcon()

        if (this.#HAS_LOCK)
            this.addLockIcon()
    }

    // Body initializer
    #setBody() {
        // Body
        this.#BODY = this.CompJS.createElement("div", this.#ROOT, GRID_SELECTORS.BODY);
        this.#BODY_HEADER = this.CompJS.createElement("div", this.#BODY, GRID_SELECTORS.BODY_HEADER);

        this.#BODY_CONTENT = this.createElementWithElementId("div", this.#BODY, GRID_SELECTORS.BODY_CONTENT, GRID_SELECTORS.BODY_CONTENT);

        this.#BODY_CONTENT_DATA = this.createElementWithElementId("div", this.#BODY_CONTENT,GRID_SELECTORS.BODY_CONTENT_DATA, GRID_SELECTORS.BODY_CONTENT_DATA);
    }

    // - Icons

    // Add lock icon
    addLockIcon() {
        if (this.#HAS_LOCK)
            return;

        if(this.#LOCK_STATUS===undefined)
            throw new Error("JSON Grid locked property is not defined...")

        this.#HAS_LOCK = true

        // Icons
        this.#HEADER_ICONS = this.CompJS.createElement("div", this.#HEADER, GRID_SELECTORS.HEADER_ICONS);

        // Lock icons
        const headerIconLockContainer = this.CompJS.createElement("div", this.#HEADER_ICONS, GRID_SELECTORS.HEADER_ICON_CONTAINER);

        // Load lock SVG click event function
        const makeDivEditable=element => element.contentEditable=String(!this.#LOCK_STATUS)

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

        this.CompJS.loadHiddenSVG(COMPJS_URLS.UNLOCK_SVG,COMPJS_CONSTANTS.VIEW_BOX, GRID_SELECTORS.ICON_UNLOCK)
            .then(()=>{
                const svgElement=this.CompJS.loadSVG(headerIconLockContainer, GRID_SELECTORS.ICON_UNLOCK, GRID_SELECTORS.HEADER_ICON)

                if(this.#LOCK_STATUS)
                    this.CompJS.addClassNames(svgElement, COMPJS_SELECTORS.HIDE, GRID_SELECTORS.HEADER_ICON_HIDDEN)
            })
            .catch(err=>console.error(err))

        this.CompJS.loadHiddenSVG(COMPJS_URLS.LOCK_SVG,COMPJS_CONSTANTS.VIEW_BOX, GRID_SELECTORS.ICON_LOCK)
            .then(()=>{
                const svgElement=this.CompJS.loadSVG(headerIconLockContainer, GRID_SELECTORS.ICON_LOCK, GRID_SELECTORS.HEADER_ICON)

                if(!this.#LOCK_STATUS)
                    this.CompJS.addClassNames(svgElement, COMPJS_SELECTORS.HIDE, GRID_SELECTORS.HEADER_ICON_HIDDEN)
            })
            .catch(err=>console.error(err))
    }

    // Add trash icon
    addTrashIcon() {
        if (this.#HAS_TRASH)
            return;

        this.#HAS_TRASH = true
    }

    // - Mutation observers

    // Title Observer
    addTitleObserver() {
        if(this.#TITLE_OBSERVER!==undefined)
            return

        const titleObserverOptions = {
            subtree: true,
            characterData:true
        }

        const titleObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if(mutation.type!=="characterData")
                    return

                if(mutation.target.textContent.length===0)
                    this.#addWarnings()

                else if(this.#GLOBAL_WARNING)
                    this.#removeWarnings()
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

        const columnsObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if(mutation.type!=="characterData")
                    return

                const element=mutation.target.ownerDocument.activeElement

                if(mutation.target.textContent.length===0)
                    this.#addColumnWarning(element)

                else if(this.#EMPTY_COLUMNS.get(element))
                    if(!this.#GLOBAL_WARNING)
                        this.#removeColumnWarning(element)
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

        const cellsObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type !== "characterData")
                    return

                const element = mutation.target.ownerDocument.activeElement
                const columnId = element.dataset[GRID_JSON.COLUMN_ID]
                const columnData = this.#COLUMNS.get(columnId)
                const textContent = mutation.target.textContent

                if (textContent.length === 0&&!columnData.get(GRID_JSON.COLUMN_DATA_NULLABLE)) {
                    this.#addCellWarning(element)
                    return
                }

                const columnDataType = columnData.get(GRID_JSON.COLUMN_DATA_TYPE)

                // String columns
                // NOTE: There's no need to check string columns

                // Integer columns
                if (columnDataType === "int"){
                    if (!/^[-+]?[0-9]+$/.test(textContent)){
                        this.#addCellWarning(element)
                        return
                    }
                }

                // Unsigned integer columns
                if (columnDataType === "uint"){
                    if (!/^[0-9]+$/.test(textContent)){
                        this.#addCellWarning(element)
                        return
                    }
                }

                // Float columns
                else if (columnDataType === "float"){
                    if (!/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(textContent)){
                        this.#addCellWarning(element)
                        return
                    }
                }

                // Unsigned float columns
                else if (columnDataType === "ufloat"){
                    if (!/^[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(textContent)){
                        this.#addCellWarning(element)
                        return
                    }
                }

                if(this.#EMPTY_CELLS.get(element))
                    this.#removeCellWarning(element)
            })
        })

        cellsObserver.observe(this.#BODY_CONTENT_DATA, cellsObserverOptions)
    }

    // Add Observers
    addObservers() {
        this.addTitleObserver()
        this.addColumnsObserver()
        this.addCellsObserver()
    }

    #addWarnings(addToTitle=true,addToColumnsHeader=true,addToRows=true) {
        this.#GLOBAL_WARNING=true

        // Title
        if(addToTitle)
        this.#HEADER_TITLE.classList.add(GRID_SELECTORS.HEADER_TITLE_WARNING)

        // Body
        if(addToColumnsHeader)
            this.#BODY_HEADER.classList.add(GRID_SELECTORS.BODY_HEADER_WARNING)

        if(addToRows)
            this.#getBodyContentDataRows().forEach(cell => {cell.classList.add(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_WARNING)})
    }

    #removeWarnings(removeFromTitle=true,removeFromColumnsHeader=true,removeFromRows=true) {
        this.#GLOBAL_WARNING=false

        // Title
        if(removeFromTitle)
        this.#HEADER_TITLE.classList.remove(GRID_SELECTORS.HEADER_TITLE_WARNING)

        // Body
        if(removeFromColumnsHeader)
            this.#BODY_HEADER.classList.remove(GRID_SELECTORS.BODY_HEADER_WARNING)

        if(removeFromRows)
            this.#getBodyContentDataRows().forEach(cell => {cell.classList.remove(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_WARNING)})
    }

    #addColumnWarning(element){
        if(!element)
            return

        this.#EMPTY_COLUMNS.set(element,true)
        element.classList.add(GRID_SELECTORS.BODY_HEADER_COLUMN_WARNING)
    }

    #removeColumnWarning(element){
        if(!element)
            return

        this.#EMPTY_COLUMNS.set(element,false)
        element.classList.remove(GRID_SELECTORS.BODY_HEADER_COLUMN_WARNING)
    }

     #addCellWarning(element){
        if(!element)
            return

        this.#EMPTY_CELLS.set(element,true)
        element.classList.add(GRID_SELECTORS.BODY_CONTENT_DATA_PAGE_ROW_CELL_WARNING)
    }

    #removeCellWarning(element){
        if(!element)
            return

        this.#EMPTY_CELLS.set(element,false)
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

    disconnectCellsObserver(){
    // Load JSON body data{
        if(this.#CELLS_OBSERVER===undefined)
            return

        this.#CELLS_OBSERVER.disconnect()
        this.#CELLS_OBSERVER=undefined
    }

    disconnectAllObservers() {
        this.disconnectTitleObserver()
        this.disconnectColumnsObserver()
        this.disconnectCellsObserver()
    }
}