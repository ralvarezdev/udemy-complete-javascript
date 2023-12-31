import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipe = async function ()
{
  try
  {
    // Get Hash
    const id = window.location.hash.slice(1);

    if (!id) return;

    // Render Spinner while the Data is being Fetched
    recipeView.renderSpinner();

    // Fetching Data
    await model.loadRecipe(id);
    const { recipe } = model.state;

    // Render Recipe
    recipeView.render(recipe);
  }
  catch (err)
  {
    console.error(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function ()
{
  try
  {
    // Get Search Query
    const query = searchView.getQuery();

    if (!query) return;

    // Load Search Results
    await model.loadSearchResults(query);
    console.log(model.state.search);

    // Render Search Results
    resultsView.render(model.getSearchResultsPage(1));
    // Render Initial Pagination Buttons
    paginationView.render(model.state.search);
  }
  catch (err)
  {
    console.error(err);
    recipeView.renderError();
  }
};

const controlPagination = function (goToPage)
{
  // Render New Results
  resultsView.render(model.getSearchResultsPage(goToPage));
  // Render New Pagination Buttons
  paginationView.render(model.state.search);
};

const init = function ()
{
  recipeView.addHandlerRender(controlRecipe);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerPagination(controlPagination);
};
init();

if (module.hot)
  module.hot.accept();