import PreviewView from "./previewView.js";

class BookmarksView extends PreviewView
{
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = 'No bookmarks yet, Find a nice bookmark and bookmark it';
  _successMessage = '';

  addHandlerRender (handler)
  {
    window.addEventListener('load', handler);
  }

  _generateMarkup ()
  {
    return this._data.map(preview => this._generateMarkupPreview(preview)).join('\n');
  }
}

export default new BookmarksView();