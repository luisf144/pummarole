/**
 * Created by luiscarbajal on 26/05/2020.
 */

// Adding CSS
import '../sass/app.scss';
// End including CSS files

//Importing Jquery
const $ = require('jquery');

//Importing Boostrap
require('bootstrap');

import * as homeView from './Home/views/homeView';

/** Get phaseTypeRunning from LocalStorage **/
let phaseTypeRunning = localStorage.getItem('phaseTypeRunning');

$(document).ready(function(){
    homeView.applyTheme(phaseTypeRunning);
});
