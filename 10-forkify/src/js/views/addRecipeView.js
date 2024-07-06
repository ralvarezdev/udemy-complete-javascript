import View from './view';

import icons from 'url:../../img/icons.svg';

class AddRecipeView extends View {
    _parentElement = document.querySelector('.upload');
    _successMessage = 'Recipe was sucessfully uploaded';

    _window = document.querySelector('.add-recipe-window');
    _overlay = document.querySelector('.overlay');
    _btnOpen = document.querySelector('.nav__btn--add-recipe');
    _btnClose = document.querySelector('.btn--close-modal');

    constructor() {
        super();
        this._addHandlerWindow();
    }

    addHandlerUpload(handler) {
        this._parentElement.addEventListener('submit', function (event) {
            event.preventDefault();

            // Get Form Data
            const dataArr = [...new FormData(this)];
            const data = Object.fromEntries(dataArr);
            handler(data);
        });
    }

    isWindowActive() {
        return !(this._overlay.classList.contains('hidden') && this._window.classList.contains('hidden'));
    }

    toggleWindow() {
        this._overlay.classList.toggle('hidden');
        this._window.classList.toggle('hidden');
    }

    showForm() {
        this._renderUploadForm();
        this.toggleWindow();
    }

    _renderUploadForm() {
        const markup = `
    <div class="upload__column">
      <h3 class="upload__heading">Recipe data</h3>
      <label>Title</label>
      <input value="" required name="title" type="text" />
      <label>URL</label>
      <input value="" required name="sourceUrl" type="text" />
      <label>Image URL</label>
      <input value="" required name="image" type="text" />
      <label>Publisher</label>
      <input value="" required name="publisher" type="text" />
      <label>Prep time</label>
      <input value="" required name="cookingTime" type="number" />
      <label>Servings</label>
      <input value="" required name="servings" type="number" />
    </div>

    <div class="upload__column">
      <h3 class="upload__heading">Ingredients</h3>
      <label>Ingredient 1</label>
      <input value="" type="text" required name="ingredient-1" placeholder="Format: 'Quantity,Unit,Description'" />
      <label>Ingredient 2</label>
      <input value="" type="text" name="ingredient-2" placeholder="Format: 'Quantity,Unit,Description'" />
      <label>Ingredient 3</label>
      <input type="text" name="ingredient-3" placeholder="Format: 'Quantity,Unit,Description'" />
      <label>Ingredient 4</label>
      <input type="text" name="ingredient-4" placeholder="Format: 'Quantity,Unit,Description'" />
      <label>Ingredient 5</label>
      <input type="text" name="ingredient-5" placeholder="Format: 'Quantity,Unit,Description'" />
      <label>Ingredient 6</label>
      <input type="text" name="ingredient-6" placeholder="Format: 'Quantity,Unit,Description'" />
    </div>

    <button class="btn upload__btn">
      <svg>
        <use href="${icons}g#icon-upload-cloud"></use>
      </svg>
      <span>Upload</span>
    </button>
    `;

        this._parentElement.innerHTML = '';
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }

    _addHandlerWindow() {
        // Open Modal Window,
        this._btnOpen.addEventListener('click', this.showForm.bind(this));

        // Close Modal Window
        [this._btnClose, this._overlay].forEach(btn => btn.addEventListener('click', this.toggleWindow.bind(this)));
    }
}

export default new AddRecipeView();