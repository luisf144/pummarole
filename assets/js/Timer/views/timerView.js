/**
 * Created by luiscarbajal on 26/05/2020.
 */
//Importing Jquery
const $ = require('jquery');
import { elements } from '../../base';

/** Function to render the clock timer and title on the web **/
const NAME_OF_APP = 'Pummarole';
export const renderTimer = (minutes, seconds) => {
    let clockHours;
    const clockMinutes = minutes < 10 ? '0' + minutes + ':' : minutes + ':';
    const clockSeconds = seconds < 10 ? '0' + seconds : seconds;

    if (minutes >= 60) {
        // Add an hours
        const hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
        clockHours = hours + ':';
        document.title = `(${clockHours}${minutes}) - ${NAME_OF_APP}`;
    } else {
        clockHours = '';

        document.title = `(${clockMinutes}${clockSeconds}) - ${NAME_OF_APP}`;
    }


    elements.timer.text(clockHours + clockMinutes + clockSeconds);

};

export const hideElement = el => {
    el.hide();
};

export const showElement = el => {
    el.show();
};

/** Function to add class AppBtn to the buttons Pom, SB, or LB **/
export const addClsAppBtn = phase => {
    elements.btnPom.removeClass("btn-app");
    elements.btnSB.removeClass("btn-app");
    elements.btnLB.removeClass("btn-app");

    elements[`btn${phase}`].addClass("btn-app");
};