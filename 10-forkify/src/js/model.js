// import { async } from 'regenerator-runtime';
import {API_URL, KEY, RESULTS_PER_PAGE} from './config';
import {AJAX} from './helpers.js';

export const state = {
    bookmarks: [],
    recipe: {},
    search: {
        query: '',
        results: [],
        resultsPerPage: RESULTS_PER_PAGE,
    }
};

const createRecipeObject = function (data) {
    const {recipe} = data.data;

    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && {key: recipe.key})
    };
};

export const loadRecipe = async function (id) {
    try {
        // For Testing
        // id = '5ed6604591c37cdc054bc886';

        // Fetching Data
        const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);
        state.recipe = createRecipeObject(data);

        state.recipe.bookmarked = state.bookmarks.some(bookmark => bookmark.id === id);

        console.log(state.recipe);
    } catch (err) {
        // Re-throwing the Error
        throw (err);
    }
};

export const loadSearchResults = async function (query) {
    try {
        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
        state.search.page = 1;

        state.search.query = query;
        state.search.results = data.data.recipes.map(recipe => {
            return {
                id: recipe.id,
                title: recipe.title,
                publisher: recipe.publisher,
                image: recipe.image_url,
                ...(recipe.key && {key: recipe.key})
            };
        });
    } catch (err) {
        // Re-throwing the Error
        throw (err);
    }
};

export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;

    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;

    return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
    const oldServings = state.recipe.servings;
    state.recipe.ingredients.map(ing => {
        ing.quantity = ing.quantity * newServings / oldServings;
    });

    state.recipe.servings = newServings;
};

const storeBookmarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
    // Add Bookmark
    state.bookmarks.push(recipe);

    // Mark Current Recipe as Bookmarked
    if (recipe.id !== state.recipe.id) return;

    state.recipe.bookmarked = true;
    storeBookmarks();
};

export const delBookmark = function (id) {
    // Delete Bookmark
    const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
    state.bookmarks.splice(index, 1);

    // Mark Current Recipe as Not Bookmarked
    if (id !== state.recipe.id) return;

    state.recipe.bookmarked = false;
    storeBookmarks();
};

export const uploadRecipe = async function (newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe)
            .filter(entry => entry.at(0).startsWith('ingredient') && entry.at(1) !== '')
            .map(ing => {
                const ingArr = ing.at(1).split(',').map(ing => ing.trim());
                if (ingArr.length !== 3) throw new Error('Wrong ingredient format');

                const [qt, unit, description] = ingArr;
                if (description === '') throw new Error('Missing ingredient description');

                return {quantity: qt ? +qt : null, unit, description};
            });
        console.log(ingredients);

        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        };

        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);
    } catch (err) {
        // Re-throwing the Error
        throw (err);
    }
};

const init = function () {
    const storage = localStorage.getItem('bookmarks');

    if (!storage) return;

    state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmarks = function () {
    localStorage.clear('bookmarks');
};
// clearBookmarks()