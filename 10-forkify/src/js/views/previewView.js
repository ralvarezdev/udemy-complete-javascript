import View from "./view";

import { getHash } from "../helpers";

export default class PreviewView extends View
{
  _generateMarkupPreview (preview)
  {
    const id = getHash();

    return `
    <li class="preview">
      <a class="preview__link ${ preview.id === id ? 'preview__link--active' : '' }" href="#${ preview.id }">
        <figure class="preview__fig">
          <img src="${ preview.image }" alt="${ preview.title }" />
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