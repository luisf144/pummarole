/**
 * Created by luiscarbajal on 26/05/2020.
 */
//Importing Jquery
const $ = require('jquery');

//DOM elements
export const elements = {
    timer: $("#timer"),
    pomCycleVal: $(".js-cycle-val"),
    pomVal: $(".js-pom-val"),
    sbVal: $(".js-sb-val"),
    lbVal: $(".js-lb-val"),
    slugsVal: $(".js-slugs-val"),
    currPom: $(".js-curr-pom"),

    btnStart: $("#btn_start"),
    btnPause: $("#btn_pause"),
    btnReset: $("#btn_reset"),

    btnPom: $("#btn_pomodoro"),
    btnSB: $("#btn_shortbreak"),
    btnLB: $("#btn_longbreak"),

    audio: document.getElementById("alarm"),

    btnDeleteTask: $(".delete_task"),
    listItem: $(".list-group-item"),
    listGroup: $(".list-group"),
    pomRoundUI: $("#pom_round"),
};