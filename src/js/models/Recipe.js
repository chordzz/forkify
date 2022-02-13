import axios from 'axios';

import { key } from '../config';

export default class Recipe {
    constructor (id) {
        this.id = id;
    }



    async getRecipe() {
        try{
            const res = await axios(`https://api.spoonacular.com/recipes/${this.id}/information?apiKey=${key}`);

            this.title = res.data.title;
            this.author = res.data.sourceName;
            this.img = res.data.image;
            this.url = res.data.spoonacularSourceUrl;
            this.ingredients = res.data.extendedIngredients;
            this.time = res.data.readyInMinutes;
            this.servings = res.data.servings;
            // console.log(res);
        } catch(error) {
            console.log(error);
            alert('Something went wrong : (')
        }
    }

    updateServings (type) {
        const newServings = type === "dec" ? this.servings - 1 : this.servings + 1;

        this.ingredients.forEach(ingredient => {
            ingredient.amount *= (newServings / this.servings)
        });

        this.servings = newServings;
    }

    
}

// https://api.spoonacular.com/recipes/complexSearch?query=pasta&maxFat=25&number=2