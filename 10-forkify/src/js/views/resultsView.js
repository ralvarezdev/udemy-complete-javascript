import PreviewView from './previewView.js';

import icons from 'url:../../img/icons.svg';

class ResultsView extends PreviewView
{
  _parentElement = document.querySelector('.results');
  _errorMessage = 'No recipes found that matched your query';
  _successMessage = '';

  _generateMarkup ()
  {
    return this._data.map(preview => this._generateMarkupPreview(preview)).join('\n');
  }
}

export default new ResultsView();