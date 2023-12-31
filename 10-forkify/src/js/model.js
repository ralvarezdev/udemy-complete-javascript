
import { async } from 'regenerator-runtime';
import { API_URL, RESULTS_PER_PAGE } from './config';
import { getJSON } from './helpers.js';

export const state = {
  bookmarks: [],
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RESULTS_PER_PAGE,
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

    state.recipe.bookmarked = state.bookmarks.some(bookmark => bookmark.id === id);

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
    state.search.page = 1;

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

export const updateServings = function (newServings)
{
  const oldServings = state.recipe.servings;
  state.recipe.ingredients.map(ing =>
  {
    ing.quantity = ing.quantity * newServings / oldServings;
  });

  state.recipe.servings = newServings;
};

const storeBookmarks = function ()
{
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe)
{
  // Add Bookmark
  state.bookmarks.push(recipe);

  // Mark Current Recipe as Bookmarked
  if (recipe.id !== state.recipe.id) return;

  state.recipe.bookmarked = true;
  storeBookmarks();
};

export const delBookmark = function (id)
{
  // Delete Bookmark
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
  state.bookmarks.splice(index, 1);

  // Mark Current Recipe as Not Bookmarked
  if (id !== state.recipe.id) return;

  state.recipe.bookmarked = false;
  storeBookmarks();
};

const init = function ()
{
  const storage = localStorage.getItem('bookmarks');

  if (!storage) return;

  state.bookmarks = JSON.parse(storage);
};
init();