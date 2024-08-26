// import 'core-js/stable';
// import 'regenerator-runtime/runtime';

import * as model from './model.js';
import {MODAL_CLOSE_SEC} from './config.js';
import {getHash} from './helpers.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipe = async function () {
    try {
        const id = getHash();

        if (!id) return;

        // Render Spinner while the Data is being Fetched
        recipeView.renderSpinner();

        // Update Selected Recipe from Search Results
        resultsView.update(model.getSearchResultsPage());
        // Update Bookmarks
        bookmarksView.update(model.state.bookmarks);

        // Fetching Data
        await model.loadRecipe(id);
        const {recipe} = model.state;

        // Render Recipe
        recipeView.render(recipe);
    } catch (err) {
        console.error(err);
        recipeView.renderError();
    }
};

const controlSearchResults = async function () {
    try {
        // Render Spinner while the Search is being Fetched
        resultsView.renderSpinner();

        // Get Search Query
        const query = searchView.getQuery();

        if (!query) return;

        // Load Search Results
        await model.loadSearchResults(query);
        console.log(model.state.search);

        // Render Search Results
        resultsView.render(model.getSearchResultsPage());
        // Render Initial Pagination Buttons
        paginationView.render(model.state.search);
    } catch (err) {
        console.error(err);
        recipeView.renderError();
    }
};

const controlPagination = function (goToPage) {
    // Render New Results
    resultsView.render(model.getSearchResultsPage(goToPage));
    // Render New Pagination Buttons
    paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
    // Update Recipe Servings
    model.updateServings(newServings);

    // Update Recipe
    recipeView.update(model.state.recipe);
};

const controlBookmark = function () {
    // Add/Remove Bookmark
    model.state.recipe.bookmarked ? model.delBookmark(model.state.recipe.id) : model.addBookmark(model.state.recipe);

    // Update Recipe
    console.log(model.state.recipe);
    recipeView.update(model.state.recipe);

    // Render Bookmarks
    bookmarksView.render(model.state.bookmarks);
};

const controlInitBookmarks = function () {
    bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
    try {
        // Render Spinner while the Data is being Fetched
        addRecipeView.renderSpinner();

        // Upload New Recipe Data
        await model.uploadRecipe(newRecipe);
        console.log(model.state.recipe);

        // Render Recipe
        recipeView.render(model.state.recipe);
        // Success Message
        addRecipeView.renderMessage();

        // Change ID in URL
        window.history.pushState(null, '', `#${model.state.recipe.id}`);

        // Render Bookmark View
        bookmarksView.render(model.state.bookmarks);

        // Close Form
        setTimeout(function () {
            if (addRecipeView.isWindowActive())
                addRecipeView.toggleWindow();
        }, MODAL_CLOSE_SEC * 1000);
    } catch (err) {
        console.error(err);
        addRecipeView.renderError(err);
    }
};

const init = function () {
    bookmarksView.addHandlerRender(controlInitBookmarks);
    recipeView.addHandlerRender(controlRecipe);
    recipeView.addHandlerUpdateServings(controlServings);
    recipeView.addHandlerBookmark(controlBookmark);
    searchView.addHandlerSearch(controlSearchResults);
    paginationView.addHandlerPagination(controlPagination);
    addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

if (module.hot)
    module.hot.accept();