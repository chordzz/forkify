import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

import { elements, renderLoader, clearLoader } from './views/base';


/**
 * Global state of the app
 * Search Object
 * Current recipe object
 * Shopping list object
 * liked recipes
 */

const state = [];


//
// Search Controller
//

const controlSearch = async () => {
    // 1. Get query from view
    const query = searchView.getInput();
    // console.log(query)

    if(query){
        // 2. New search object and add to state
        state.search = new Search(query);

        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResult);

        try {
            // 4. Search for recipes
            await state.search.getResults(query);

            // 5. render results on UI
            clearLoader();
            searchView.renderResults(state.search.result)
        } catch (error) {
            alert("Something went wrong with the search...");
            clearLoader();
        }

        
        
    }
}

elements.searchForm.addEventListener('submit', e => {
       e.preventDefault(); 
       controlSearch();
});

elements.searchResultPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage)
    }
});


//
// Recipe COntroller
//

const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    // console.log(id);

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // HighLight selected search item
        if(state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and render recipe
            await state.recipe.getRecipe();
            clearLoader();
            recipeView.renderRecipe(
                state.recipe, 
                state.likes.isLiked(id));
        } catch (error){
            alert("Error processing recipe!")
        }

        
    }
}

// window.addEventListener('hashchange', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/*

// LIST CONTROLLER

*/

const controlList = (newList) => {
    
    //Create a new list if there is none yet
    if (!state.list) {
        state.list = new List()
    }else {
        state.list.items = [];
        state.list.items = newList
    }

    //Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.amount, el.unit, el.originalName);
        listView.renderItem(item);
        // console.log(state.list);
    });
    
}


// Handle Delete and Update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    // console.log(id); 

    //Handle Delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')){
        //Delete from state
        state.list.deleteItem(id);

        //delete from UI
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count--value')) {
        const val = parseFloat(e.target.value, 10);
        if (val >= 0) {
            state.list.updateCount(id, val)
        }
    }
    

    if(e.target.matches('.shopping__count input')){
        e.target.addEventListener('change', e => {
            
            if (e.target.value <= 0) {
                //Delete from state
                state.list.deleteItem(id);

                //delete from UI
                listView.deleteItem(id);
                const newList = state.list;
                controlList(newList);
            };
        })
    }
});


/*

// LIKES CONTROLLER

*/

// TESTING
// state.likes = new Likes();
// likesView.toggleLikeMenu(state.likes.getNumLikes());

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has Not yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        //Add like to state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img,
            // state.recipe.title
        );

        //Toggle like button
        likesView.toggleLikeBtn(true);

        // Add like to Ui List
        
        likesView.renderLike(newLike);

    // User has liked current recipe
    }else {
        // console.log(currentID)
        //Remove like from state
        state.likes.deleteLike(currentID);
        
        //Toggle like button
        likesView.toggleLikeBtn(false);

        // remove like from Ui List
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    //Restore Likes
    state.likes.readStorage();

    //Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //Render existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});



// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        // Decrease button is clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }else if (e.target.matches('.btn-increase, .btn-increase *')){
        //Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingrdients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like Controller
        controlLike();
    }

});


