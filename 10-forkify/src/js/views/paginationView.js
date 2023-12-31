import View from './view';

import icons from 'url:../../img/icons.svg';

class PaginationView extends View
{
  _parentElement = document.querySelector('.pagination');
  _currPage;

  addHandlerPagination (handler)
  {
    this._parentElement.addEventListener('click', event =>
    {
      const btn = event.target.closest('.btn--inline');
      if (!btn) return;

      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }

  _generateMarkup ()
  {
    const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);
    this._currPage = this._data.page;

    // Only One Page
    if (numPages === 1)
      return;

    // First Page
    if (this._data.page === 1)
      return this._renderNextButton();

    // Last Page
    if (this._data.page === numPages)
      return this._renderPrevButton();

    // Other Pages
    return this._renderNextButton() + this._renderPrevButton();
  }

  _renderPrevButton ()
  {
    return `
    <button data-goto="${ this._currPage - 1 }" class="btn--inline pagination__btn--prev">
      <svg class="search__icon">
      <use href="${ icons }#icon-arrow-left"></use>
      </svg>
      <span>Page ${ this._currPage - 1 }</span>
      </button>
      `;
  }

  _renderNextButton ()
  {
    return `
    <button data-goto="${ this._currPage + 1 }" class="btn--inline pagination__btn--next">
      <span> Page ${ this._currPage + 1 }</span>
        <svg class="search__icon">
          <use href="${ icons }#icon-arrow-right"></use>
        </svg>
    </button >
    `;
  }
}

export default new PaginationView();;