import {CompJS} from "./compjs.js";
import {COMPJS_PATHS} from "./compjs-props.js";

export class CompJSElement {
    static #COMPJS;

    // Element properties
    #ELEMENT_ID;
    #PARENT_ELEMENT

    static {
        CompJSElement.#COMPJS = new CompJS();
        CompJSElement.#COMPJS.addStyleSheet(COMPJS_PATHS.GRID_STYLE);
    }

    constructor(elementId, parentElement) {
        this.#PARENT_ELEMENT = (parentElement === undefined) ? document.body : parentElement;
        this.#ELEMENT_ID = String(elementId)
    }

    // - Getters

    // Get CompJS instance
    get CompJS(){
        return CompJSElement.#COMPJS
    }

    // Get parent element
    get parentElement(){
        return this.#PARENT_ELEMENT
    }

    // Get element ID
    get elementId(){
        return this.#ELEMENT_ID
    }

    // Get selector with element ID
    getIdFromSelector(selector){
        return [selector, this.#ELEMENT_ID].join('--')
    }

    // Get formatted selector with element ID
    getFormattedIdFromSelector(selector) {
        const id = this.getIdFromSelector(selector)
        return this.CompJS.getFormattedId(id)
    }

    // Get class properties values
    getClassNameProperties(className, ...propertiesName) {
        className=this.CompJS.getFormattedClassName(className)
        return this.CompJS.getSelectorProperties(className, ...propertiesName);
    }

    // Get class properties values
    getIdProperties(id, ...propertiesName) {
        id=this.CompJS.getFormattedId(id)
        return this.CompJS.getSelectorProperties(id, ...propertiesName);
    }

    // Get class with element ID properties values
    getIdFromSelectorProperties(selector, ...propertiesName) {
        const id=this.getFormattedIdFromSelector(selector)
        return this.CompJS.getSelectorProperties(id, ...propertiesName);
    }

    // - Setters

    // Set class property value
    setClassProperty(className, propertyName, propertyValue) {
        className=this.CompJS.getFormattedClassName(className)
        this.CompJS.setSelectorProperty(className, propertyName, propertyValue);
    }

    // Set ID property value
    setIdProperty(id, propertyName, propertyValue) {
        id=this.CompJS.getFormattedId(id)
        this.CompJS.setSelectorProperty(id, propertyName, propertyValue);
    }

    // Set class with element ID property value
    setIdFromSelectorProperty(selector, propertyName, propertyValue) {
        const id=this.getFormattedIdFromSelector(selector)
        this.CompJS.setSelectorProperty(id, propertyName, propertyValue);
    }

    // - Element initializers

    createElementWithElementId(tagName, parentElement, selector,...classNames){
        const id =this.getIdFromSelector(selector)
        return this.CompJS.createElementWithId(tagName, parentElement, id, ...classNames);
    }

    // - Re-setters

    // Reset applied customized styles
    resetAppliedStyles(selector) {
        this.CompJS.checkSelector(selector);
        this.CompJS.resetAppliedStyle(selector);
    }
}