import axios from 'axios';
import { key } from '../config';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults(query) {
        // const key = "c148db302cb64999b56e9b0bcf0b9f3c";
        // let res;
        try {
            const res = await axios(`https://api.spoonacular.com/food/search?query=${query}&number=30&apiKey=${key}`);
            
            
            this.result = await res.data.searchResults[0].results;
            // console.log(this.result)
            
            
        } catch (error) {
            alert(error);
        }
        
    }
}