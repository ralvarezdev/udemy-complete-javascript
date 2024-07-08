'use strict';

import {COMPJS_PATHS, COMPJS_CLASSES} from "./compjs-props.js";
import {CompJS} from "./compjs.js";
import {GRID_CLASSES, GRID_CLASSES_LIST, GRID_URLS} from "./grid-props.js";
import {getMapFromObject} from "./utils.js";

export class Grid {
    static #COMPJS;
    static #DEFAULT_LOCK_STATUS=false
    static #DEFAULT_HAS_LOCK = false
    static #DEFAULT_HAS_TRASH = false
    static #DEFAULT_HAS_INSERTION = false

    #TITLE = "Grid"
    #LOCK_STATUS = Grid.#DEFAULT_LOCK_STATUS;
    #PAGE_SIZE = 10
    #COLUMNS = []
    #COLUMNS_SORTED_KEYS = []
    #DATA = []

    #HAS_LOCK=Grid.#DEFAULT_HAS_LOCK
    #HAS_TRASH=Grid.#DEFAULT_HAS_TRASH
    #HAS_INSERTION=Grid.#DEFAULT_HAS_INSERTION

    #JSON_COLUMNS = "columns"
    #JSON_LOCKED = "locked"
    #JSON_TITLE = "title"

    #JSON_COLUMN_ID = "columnId"
    #JSON_COLUMN_TITLE = "title"
    #JSON_COLUMN_INDEX = "index"
    #JSON_COLUMN_TYPE = "type"

    #JSON_PAGE_SIZE = "pageSize"
    #JSON_DATA = "data"

    #ELEMENT_ID;

    #ELEMENTS
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
    #BODY_CONTENT_CHECKBOXES

    static {
        Grid.#COMPJS = new CompJS();
        Grid.#COMPJS.addStyleSheet(COMPJS_PATHS.GRID);
    }

    constructor(elementId, parentElement) {
        this.#PARENT_ELEMENT = (parentElement === undefined) ? document.body : parentElement;
        this.#ELEMENT_ID = parseInt(elementId);
        Grid.#COMPJS.setElementID(this.#ELEMENT_ID, this);

        this.mainInitializer();
    }

    // - Initializers

    // Main initializer
    mainInitializer() {
        // Root
        this.#ROOT = Grid.#COMPJS.createElement("div", this.#PARENT_ELEMENT, GRID_CLASSES.ROOT);

        if(!this.#HAS_TRASH)
            this.#ROOT.classList.add(GRID_CLASSES.ROOT_NO_TRASH)

        this.#initializeHeader();
        this.#initializeBody();
    }

    // Header initializer
    #initializeHeader() {
        // Header
        this.#HEADER = Grid.#COMPJS.createElement("div", this.#ROOT, GRID_CLASSES.HEADER);

        // Title
        this.#HEADER_TITLE = Grid.#COMPJS.createElement("h2", this.#HEADER, GRID_CLASSES.HEADER_TITLE);
        this.#HEADER_TITLE.innerHTML = String(this.#TITLE);

        // Additional classes
        if (this.#HAS_TRASH)
            this.addTrashIcon()
        else
            this.#HEADER_TITLE.classList.add(GRID_CLASSES.HEADER_TITLE_NO_TRASH)

        if (this.#HAS_LOCK)
            this.addLockIcon()
        else
            this.#HEADER_TITLE.classList.add(GRID_CLASSES.HEADER_TITLE_NO_LOCK)
    }

    // Body initializer
    #initializeBody() {
        // Body
        this.#BODY = Grid.#COMPJS.createElement("div", this.#ROOT, GRID_CLASSES.BODY);
        this.#BODY_HEADER = Grid.#COMPJS.createElement("div", this.#BODY, GRID_CLASSES.BODY_HEADER);
        this.#BODY_CONTENT = Grid.#COMPJS.createElement("div", this.#BODY, GRID_CLASSES.BODY_CONTENT);
        this.#BODY_CONTENT_DATA = Grid.#COMPJS.createElement("div", this.#BODY_CONTENT, GRID_CLASSES.BODY_CONTENT_DATA);

        // Additional classes
        if (!this.#HAS_TRASH){
            this.#BODY_HEADER.classList.add(GRID_CLASSES.BODY_HEADER_NO_TRASH)
            this.#BODY_CONTENT_DATA.classList.add(GRID_CLASSES.BODY_CONTENT_DATA_NO_TRASH)
        }

        if (!this.#HAS_LOCK){
            this.#BODY_HEADER.classList.add(GRID_CLASSES.BODY_HEADER_NO_LOCK)
            this.#BODY_CONTENT_DATA.classList.add(GRID_CLASSES.BODY_CONTENT_DATA_NO_LOCK)
        }

        this.#updateBodyHeader();
    }

    addLockIcon() {
        if (this.#HAS_LOCK)
            return;

        this.#HAS_LOCK=true

        // Title
        this.#HEADER_TITLE.classList.remove(GRID_CLASSES.HEADER_TITLE_NO_LOCK);

        // Body
        this.#BODY_HEADER.classList.remove(GRID_CLASSES.BODY_HEADER_NO_LOCK)
        this.#BODY_CONTENT_DATA.classList.remove(GRID_CLASSES.BODY_CONTENT_DATA_NO_LOCK)

        // Icons
        this.#HEADER_LEFT_ICONS = Grid.#COMPJS.createElement("div", this.#HEADER, GRID_CLASSES.HEADER_LEFT_ICONS);

        // Lock icons
        this.#HEADER_LOCK = Grid.#COMPJS.createElement("div", this.#HEADER_LEFT_ICONS, GRID_CLASSES.HEADER_LOCK);

        this.#HEADER_ICON_UNLOCK = Grid.#COMPJS.loadSVG(this.#HEADER_LOCK, GRID_URLS.LOCK_SVG, "Lock SVG", GRID_CLASSES.HEADER_ICON);

        this.#HEADER_ICON_LOCK = Grid.#COMPJS.loadSVG(this.#HEADER_LOCK, GRID_URLS.UNLOCK_SVG, "Unlock SVG", GRID_CLASSES.HEADER_ICON, COMPJS_CLASSES.HIDE);

        // Add event listener to lock icons
        for (let icon of [this.#HEADER_ICON_LOCK, this.#HEADER_ICON_UNLOCK])
            icon.addEventListener("click", event => {
                event.preventDefault();

                this.#LOCK_STATUS = !this.#LOCK_STATUS;
                this.#HEADER_ICON_LOCK.classList.toggle(COMPJS_CLASSES.HIDE);
                this.#HEADER_ICON_UNLOCK.classList.toggle(COMPJS_CLASSES.HIDE);
            });
    }

    addTrashIcon() {
        if (this.#HAS_TRASH)
            return;

        this.#HAS_TRASH = true

        // Root
        this.#ROOT.classList.remove(GRID_CLASSES.ROOT_NO_TRASH);

        // Title
        this.#HEADER_TITLE.classList.remove(GRID_CLASSES.HEADER_TITLE_NO_TRASH);

        // Body
        this.#BODY_HEADER.classList.remove(GRID_CLASSES.BODY_HEADER_NO_TRASH)
        this.#BODY_CONTENT_DATA.classList.remove(GRID_CLASSES.BODY_CONTENT_DATA_NO_TRASH)
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
        const dataMap = getMapFromObject(dataObject)

        for (let key of dataMap.keys())
            dataMap.set(key, getMapFromObject(dataMap.get(key)))

        return dataMap
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
            const columnElement = Grid.#COMPJS.createElement("div", this.#BODY_HEADER, GRID_CLASSES.BODY_HEADER_COLUMN);

            columnElement.innerHTML = column.get(this.#JSON_COLUMN_TITLE)
            columnElement.style.order = column.get(this.#JSON_COLUMN_INDEX);
        })
    }

    #updateBody() {
        // Clear rows
        while(this.#BODY_CONTENT_DATA.firstChild)
            this.#BODY_CONTENT_DATA.removeChild(this.#BODY.firstChild)

        if(this.#HAS_TRASH)
            while(this.#BODY_CONTENT_CHECKBOXES.firstChild)
                this.#BODY_CONTENT_CHECKBOXES.removeChild(this.#BODY.firstChild)

        // UPDATE ROWS DATA
        this.#DATA.forEach(rowData => {
                const rowElement = Grid.#COMPJS.createElement("div", this.#BODY_CONTENT_DATA, GRID_CLASSES.BODY_CONTENT_DATA_ROW);

                this.#COLUMNS_SORTED_KEYS.forEach(column=> {
                    const cellElement=Grid.#COMPJS.createElement("div", rowElement, GRID_CLASSES.BODY_CONTENT_DATA_ROW_CELL);
                    cellElement.innerHTML = rowData.get(column.get(this.#JSON_COLUMN_ID));
            })
        })
    }

    // - Utilities

    // Method to check class names
    isGridClassNameValid(className) {
        // Check if the given class name is valid
        Grid.#COMPJS.checkClassName(className);

        for (let validClassName of GRID_CLASSES_LIST)
            if (validClassName === className)
                return true;

        return false;
    }

    // - Setters and Getters

    // General methods for getting CSS classes properties values
    getClassPropertiesValues(className, propertiesName) {
        if (!this.isGridClassNameValid(className))
            throw new Error(`'${className}' is an invalid class name...`);

        return this.#COMPJS.getClassPropertiesValues(className, propertiesName);
    }

    getGridPropertiesValues() {
        return this.getClassPropertiesValues(GRID_CLASSES.ROOT, GRID_CLASSES_LIST);
    }

    // General methods for setting CSS classes properties values
    setClassPropertyValue(className, propertyName, propertyValue) {
        // Check if the given class name is valid
        if (!this.isGridClassNameValid(className))
            throw new Error(`'${className}' is an invalid class name...`);

        Grid.#COMPJS.setCompJSPropertyValue(className, propertyName, propertyValue);
    }

    setGridClassPropertyValue(propertyName, propertyValue) {
        this.setClassPropertyValue(GRID_CLASSES.ROOT, propertyName, propertyValue);
    }

    // Reset applied customized styles
    resetAppliedClassStyles(className) {
        this.#COMPJS.checkClassName(className);
        this.#COMPJS.resetAppliedClassStyles(className);
    }
}