
import { async } from 'regenerator-runtime';
import { API_URL, RESULTS_PER_PAGE } from './config';
import { getJSON } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RESULTS_PER_PAGE,
    page: 1
  }
};

export const loadRecipe = async function (id)
{
  try
  {
    // For Testing
    // id = '5ed6604591c37cdc054bc886';

    // Fetching Data
    const data = await getJSON(`${ API_URL }/${ id }`);

    let { recipe } = data.data;
    state.recipe = {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients
    };
    console.log(state.recipe);
  }
  catch (err)
  {
    // Re-throwing the Error
    throw (err);
  }
};

export const loadSearchResults = async function (query)
{
  try
  {
    const data = await getJSON(`${ API_URL }?search=${ query }`);

    state.search.query = query;
    state.search.results = data.data.recipes.map(recipe =>
    {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
      };
    });
  }
  catch (err)
  {
    // Re-throwing the Error
    throw (err);
  }
};

export const getSearchResultsPage = function (page = state.search.page)
{
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};