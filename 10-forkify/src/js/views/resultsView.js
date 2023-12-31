import View from './view';

import icons from 'url:../../img/icons.svg';

class ResultsView extends View
{
  _parentElement = document.querySelector('.results');
  _errorMessage = 'No recipes found that matched your query';
  _successMessage = '';

  _generateMarkup ()
  {
    return this._data.map(preview => this._generateMarkupPreview(preview)).join('\n');
  }

  _generateMarkupPreview (preview)
  {
    return `
    <li class="preview">
      <a class="preview__link" href="#${ preview.id }">
        <figure class="preview__fig">
          <img src="${ preview.image }" alt="Test" />
        </figure>
        <div class="preview__data">
          <h4 class="preview__title">${ preview.title }</h4>
          <p class="preview__publisher">${ preview.publisher }</p>
        </div>
      </a>
    </li>
    `;
  }
}

export default new ResultsView();