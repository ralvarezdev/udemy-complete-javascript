import {CompJS} from "./compjs.js";
import {COMPJS_PATHS} from "./compjs-props.js";

export class CompJSElement {
    static #COMPJS;

    // Element properties
    #ELEMENT_ID;
    #PARENT_ELEMENT

    static {
        CompJSElement.#COMPJS = new CompJS();
    }

    constructor(elementId, parentElement) {
        this.#PARENT_ELEMENT = (parentElement === undefined) ? document.body : parentElement;
        this.#ELEMENT_ID = String(elementId)
    }

    // - Errors

    // Throw undefined element error
    _throwUndefinedElementError(elementName) {
        throw new Error(`CompJS ${elementName} element is not defined...`)
    }

    // - Getters

    // Get CompJS instance
    static get CompJS() {
        return CompJSElement.#COMPJS
    }

    get CompJS() {
        return CompJSElement.#COMPJS
    }

    // Get parent element
    get parentElement() {
        return this.#PARENT_ELEMENT
    }

    // Get element ID
    get elementId() {
        return this.#ELEMENT_ID
    }

    // Get selector with element ID
    getIdFromSelector(selector) {
        return [selector, this.#ELEMENT_ID].join('--')
    }

    // Get formatted selector with element ID
    getFormattedIdFromSelector(selector) {
        const id = this.getIdFromSelector(selector)
        return this.CompJS.getFormattedId(id)
    }

    // Get class properties values
    getClassNameProperties(className, ...propertiesName) {
        className = this.CompJS.getFormattedClassName(className)
        return this.CompJS.getSelectorProperties(className, ...propertiesName);
    }

    // Get class properties values
    getIdProperties(id, ...propertiesName) {
        id = this.CompJS.getFormattedId(id)
        return this.CompJS.getSelectorProperties(id, ...propertiesName);
    }

    // Get class with element ID properties values
    getIdFromSelectorProperties(selector, ...propertiesName) {
        const id = this.getFormattedIdFromSelector(selector)
        return this.CompJS.getSelectorProperties(id, ...propertiesName);
    }

    // Get formatted data name
    getFormattedDataName(dataName) {
        return dataName.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`)
    }

    // - Query selectors

    // Get element with the given selector and data
    _querySelectorWithData(parentElement, parentElementName, selector, dataName, data) {
        if (parentElement === undefined)
            this._throwUndefinedElementError(parentElementName)

        dataName = this.getFormattedDataName(dataName)
        return parentElement.querySelector(`${selector}[data-${dataName}='${data}']`)
    }

    // Get element with the given selector
    _querySelector(parentElement, parentElementName, selector) {
        if (parentElement === undefined)
            this._throwUndefinedElementError(parentElementName)

        return parentElement.querySelector(selector)
    }

    // Get all elements with the given selector and data
    _querySelectorAllWithData(parentElement, parentElementName, selector, dataName, data) {
        if (parentElement === undefined)
            this._throwUndefinedElementError(parentElementName)

        dataName = this.getFormattedDataName(dataName)
        return parentElement.querySelectorAll(`${selector}[data-${dataName}='${data}']`)
    }

    // Get all elements with the given selector
    _querySelectorAll(parentElement, parentElementName, selector) {
        if (parentElement === undefined)
            this._throwUndefinedElementError(parentElementName)

        return parentElement.querySelectorAll(selector)
    }

    // - Setters

    // Set class property value
    setClassProperty(className, propertyName, propertyValue) {
        className = this.CompJS.getFormattedClassName(className)
        this.CompJS.setSelectorProperty(className, propertyName, propertyValue);
    }

    // Set ID property value
    setIdProperty(id, propertyName, propertyValue) {
        id = this.CompJS.getFormattedId(id)
        this.CompJS.setSelectorProperty(id, propertyName, propertyValue);
    }

    // Set class with element ID property value
    setIdFromSelectorProperty(selector, propertyName, propertyValue) {
        const id = this.getFormattedIdFromSelector(selector)
        this.CompJS.setSelectorProperty(id, propertyName, propertyValue);
    }

    // Make element editable
    setEditable(element, contentEditable) {
        element.contentEditable = contentEditable;
    }

    // - Element initializers

    // Create element with ID
    createElementWithId(tagName, parentElement, selector, ...classNames) {
        const id = this.getIdFromSelector(selector)
        return this.CompJS.createElementWithId(tagName, parentElement, id, ...classNames);
    }

    // Create div with ID
    createDivWithId(parentElement, selector, ...classNames) {
        const id = this.getIdFromSelector(selector)
        return this.CompJS.createDivWithId(parentElement, id, ...classNames);
    }

    // Create button with ID
    createButtonWithId(parentElement, selector, ...classNames) {
        const id = this.getIdFromSelector(selector)
        return this.CompJS.createButtonWithId(parentElement, id, ...classNames);
    }

    // Create input with ID
    createInputWithId(parentElement, selector, name, type, value, ...classNames) {
        const id = this.getIdFromSelector(selector)
        return this.CompJS.createInputWithId(parentElement, id, name, type, value, ...classNames);
    }

    // - Re-setters

    // Reset applied customized styles
    resetAppliedStyles(selector) {
        this.CompJS.checkSelector(selector);
        this.CompJS.resetAppliedStyle(selector);
    }
}