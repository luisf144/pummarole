//Importing Jquery
const $ = require('jquery');
import { elements } from '../../base';

/** Function to apply the theme on Body class, can be pom,sb,lb. It changes colors on scss **/
export const applyTheme = phase => {
    $('body').removeClass($('body').attr('class'));

    if(phase === 'SB'){
        $('body').addClass('sb-phase-theme');
    }else if(phase === 'LB'){
        $('body').addClass('lb-phase-theme');
    }else{
        $('body').addClass('pom-phase-theme');
    }
};

/** Function to set the class active to the Item current clicked. List-group-item component **/
export const setActiveClassToListItem = idTask => {
    elements.listItem.each((index, el) => {
        el = $(el);
        const elTaskId = parseInt(el.attr('data-task-id'));
        if(el.hasClass('active')){
            el.removeClass('active');
        }

        if(elTaskId === idTask){
            el.addClass('active');
        }
    });
};

/** Function to find and return the id of the current Task. List-group-item component **/
export const getCurrentIdTask = () => {
    let idTask = null;
    const firstElTask = elements.listGroup.find(".active");

    if(firstElTask){
        idTask = firstElTask.data('taskId');
    }

    return idTask;
};