'use strict';

import { COMPJS_PATHS, COMPJS_CLASSES } from "./compjs-props.js";
import { CompJS } from "./compjs.js";
import { GRID_CLASSES, GRID_CLASSES_LIST, GRID_URLS } from "./grid-props.js";

export class Grid
{
  static #COMPJS;

  #ELEMENT_ID;
  #LOCK_STATUS;

  #PARENT_ELEMENT;
  #ROOT;
  #HEADER;
  #HEADER_TITLE;
  #HEADER_ICONS;
  #HEADER_ICONS_LOCK;
  #HEADER_ICON_UNLOCK;
  #HEADER_ICON_LOCK;
  #BODY;
  #BODY_HEADER;

  static {
    Grid.#COMPJS = new CompJS();
    Grid.#COMPJS.addStyleSheet(COMPJS_PATHS.GRID);
  }

  constructor (title, parentElement, elementId)
  {
    this.#LOCK_STATUS = true;

    if (!Grid.#COMPJS.isString(title))
      throw new Error("Grid title must be a string...");

    this.#PARENT_ELEMENT = (parentElement === undefined) ? document.body : parentElement;
    this.#initializeHeader(title);
    this.#initializeBody();

    this.#ELEMENT_ID = elementId;
    Grid.#COMPJS.setElementID(elementId, this);
  }

  // - Initializers

  // header initializer
  #initializeHeader (title)
  {
    // Header
    this.#ROOT = Grid.#COMPJS.createElement("div", this.#PARENT_ELEMENT, GRID_CLASSES.ROOT);
    this.#HEADER = Grid.#COMPJS.createElement("div", this.#ROOT, GRID_CLASSES.HEADER);

    // Icons
    this.#HEADER_ICONS = Grid.#COMPJS.createElement("div", this.#HEADER, GRID_CLASSES.HEADER_ICONS);

    // Lock icons
    this.#HEADER_ICONS_LOCK = Grid.#COMPJS.createElement("div", this.#HEADER_ICONS, GRID_CLASSES.HEADER_ICONS_LOCK);

    this.#HEADER_ICON_UNLOCK = Grid.#COMPJS.loadSVG(this.#HEADER_ICONS_LOCK, GRID_URLS.LOCK_SVG, "Lock SVG", GRID_CLASSES.HEADER_ICON);

    this.#HEADER_ICON_LOCK = Grid.#COMPJS.loadSVG(this.#HEADER_ICONS_LOCK, GRID_URLS.UNLOCK_SVG, "Unlock SVG", GRID_CLASSES.HEADER_ICON, COMPJS_CLASSES.HIDE);

    // Add event listener to lock icons
    for (let icon of [this.#HEADER_ICON_LOCK, this.#HEADER_ICON_UNLOCK])
      icon.addEventListener("click", event =>
      {
        event.preventDefault();

        this.#LOCK_STATUS = (this.#LOCK_STATUS) ? false : true;
        this.#HEADER_ICON_LOCK.classList.toggle(COMPJS_CLASSES.HIDE);
        this.#HEADER_ICON_UNLOCK.classList.toggle(COMPJS_CLASSES.HIDE);
      });

    // Title
    this.#HEADER_TITLE = Grid.#COMPJS.createElement("h2", this.#HEADER, GRID_CLASSES.HEADER_TITLE);
    this.#HEADER_TITLE.innerHTML = title;
  }

  // Body initializer
  #initializeBody ()
  {
    // Body
    console.log(1);
  }

  // - Utilities

  // Method to check class names
  isGridClassNameValid (className)
  {
    // Check if the given class name is valid
    Grid.#COMPJS.checkClassName(className);

    for (let validClassName of GRID_CLASSES_LIST)
      if (validClassName === className)
        return true;

    return false;
  }

  // - Setters and Getters

  // General methods for getting CSS classes properties values
  getClassPropertiesValues (className, propertiesName)
  {
    if (!this.isGridClassNameValid(className))
      throw new Error(`'${ className }' is an invalid class name...`);

    return this.getClassPropertiesValues(className, propertiesName);
  }

  getGridPropertiesValues ()
  {
    return this.getClassPropertiesValues(GRID_CLASSES.GRID, GRID_CLASSES_LIST);
  }

  // General methods for setting CSS classes properties values
  setClassPropertyValue (className, propertyName, propertyValue)
  {
    // Check if the given class name is valid
    if (!this.isGridClassNameValid(className))
      throw new Error(`'${ className }' is an invalid class name...`);

    Grid.#COMPJS.setCompJSPropertyValue(className, propertyName, propertyValue);
  }

  setGridClassPropertyValue (propertyName, propertyValue)
  {
    this.setClassPropertyValue(GRID_CLASSES.GRID, propertyName, propertyValue);
  }

  // Reset applied customed styles
  resetAppliedClassStyles (className)
  {
    this.checkClassName(className);
    Grid.#COMPJS.resetClassAppliedStyles(className);
  }
};