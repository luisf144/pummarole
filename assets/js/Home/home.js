/**
 * Created by luiscarbajal on 15/06/2020.
 */

import Timer from '../Timer/models/Timer';
import * as timerView from '../Timer/views/timerView';
import * as homeView from './views/homeView';
import { toSec } from '../Util';
import { elements } from '../base';
import CurrentPom from '../Home/models/CurrentPom';

//Import moment for management dates
import moment from 'moment';
require ('moment-precise-range-plugin');

//Import sweetAlert
import Swal from 'sweetalert2';

//Importing Jquery
const $ = require('jquery');

/** State of the App **/
let state = {};

/** Global vars default */
let pomPhaseSlug = "PM";
let sbPhaseSlug = "SB";
let lbPhaseSlug = "LB";

/**--------------------------Timer Controller-------------------------------------------**/
const controlTimer = () => {
    /** Retrieving values from DB..
        DefaultValues from SettingsTable DB
        The value expected are minutes then convert to seconds for usage in the Timer **/
    const pomSec = toSec(parseInt(elements.pomVal.data('pomValue')));
    const sbSec = toSec(parseInt(elements.sbVal.data('sbValue')));
    const lbSec = toSec(parseInt(elements.lbVal.data('lbValue')));
    const slugs = elements.slugsVal.data('slugsValue');

    //declaring global slugs
    setGlobalSlugs(slugs);

    //Init App, vars
    initApp(pomSec, sbSec, lbSec);

    //Current Pom from DB
    const [currPomSec, currPomStartTime, currPomPhase,
        currPomModifyTime, currPomFinishTime, currPomLength] = getCurrPom();

    //Check date when start the timer + PomLength VS Now
    const isExp = isExpired(currPomStartTime, currPomLength);

    //Check if the Current Pomodoro has already started AND has not expired yet
    if(currPomSec && !currPomFinishTime && !isExp){
        //StartTime will be last the time was executed, so when you play or pause and play.
        const startTime = currPomModifyTime ? Date.parse(currPomModifyTime) : Date.parse(currPomStartTime);

        //Calling PomPhase function
        currPomPhase(currPomSec, startTime, !state.isPaused);

        //Show the reset button in the UI
        timerView.showElement(elements.btnReset);

        //Check if the timer wasn't paused, then auto start the timer
        if(!state.isPaused){
            autoStartPom();
        }
    }
    //Check if the Current Pomodoro has already finished
    else if(currPomFinishTime){
        //Hide Pause/Reset Button in UI
        onStartANewPhase();

        //Go to the next phase, example CurrentPom is in ShortBreak so go to work in Pomodoro Simple
        currPomPhase(currPomSec, null, !state.isPaused);
    }
    //This will be the First Case, is when is a new Pomodoro
    else{
        //check if Pomodoro was broken, then reset init values
        if(isExp){
            initApp(pomSec, sbSec, lbSec);
        }

        //Hide Pause/Reset Button in UI
        onStartANewPhase();

        //Init pomodoro phase
        pomodoroPhase(pomSec);
    }

    //Init event listeners
    setupEventListeners(pomSec, sbSec, lbSec);

};
/**------------------------END Timer Controller--------------------------------------**/

/**---------------------Task Controller-----------------------------------------------**/
const controlTask = () => {
    elements.btnDeleteTask.click(function(e){
        e.preventDefault();
        e.stopImmediatePropagation();

        const successAlert = {title: 'Deleted', text: 'The Task has been deleted.'};
        const confAlert = {text: 'This action will delete the task.'};
        const idTask = $(this).parent().data('taskId');
        const elTask = $(this);

        confirmationAlert(confAlert, successAlert, function(successFn){

            const reqParam = { id: idTask };
            fetch('DELETE', Routing.generate("task_delete", reqParam), null, function(){
                //Display success modal
                successFn();

                //remove from UI
                elTask.parent().remove();
            });

        });
    });

    elements.listItem.click(function(e){
        if(state.idPomCurr && !state.pomCompleted){
            e.preventDefault();
            e.stopImmediatePropagation();
        }else{
            //Set in State
            state.idTask = $(this).data('taskId');
        }
    });
};
/**--------------------END Task Controller--------------------------------------------**/

/** Confirmation Alert - Sweet Alert **/
function confirmationAlert(confAlert, sucAlert, cb){
    const {title = 'Are you sure?', text} = confAlert;
    const {title:sucTitle, text:sucText} = sucAlert;

    Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.value) {
            //sucess alert in case is success
            const successFn = () => {
                sweetModal(sucTitle, sucText);
            };

            //exec callback
            cb(successFn);
        }
    });
}

/** Simple Modal - SweetAler **/
function sweetModal(sucTitle, sucText, err = false){
    Swal.fire(
        err ? 'Something went wrong' : sucTitle,
        sucText,
        err ? 'error' : 'success'
    )
}

/** Function to setup Event listeners on Click Buttons **/
function setupEventListeners(pomSec, sbSec, lbSec){
    //All the possible buttons can be clicked and caught
    const events = ['btnStart', 'btnPause', 'btnReset', 'btnSB', 'btnLB', 'btnPom'];

    events.forEach((event) => {

        ((elValue, pomSec, sbSec, lbSec) => {

            elements[elValue].on('click', function(){

                switch (elValue){
                    case 'btnStart':
                        onStartBtn();
                        break;

                    case 'btnPause':
                        onPauseBtn();
                        break;

                    case 'btnReset':
                        onResetBtn();
                        break;

                    case 'btnSB':
                        state.timer.reset();
                        initApp(pomSec, sbSec, lbSec);
                        shortBreakPhase(sbSec);
                        break;

                    case 'btnLB':
                        state.timer.reset();
                        initApp(pomSec, sbSec, lbSec);
                        longBreakPhase(lbSec);
                        break;

                    case 'btnPom':
                        state.timer.reset();
                        initApp(pomSec, sbSec, lbSec);
                        pomodoroPhase(pomSec);
                        break;

                    default:
                        console.log("Event Click doesn't match.");
                }
            });

        })(event, pomSec, sbSec, lbSec);

    });
}

/** Function to Set up Global Slugs **/
function setGlobalSlugs(slugs){
    //Array is comming like ["pomodoro_cycle", "PM", "SB", "LB"]
    pomPhaseSlug = slugs[1];
    sbPhaseSlug = slugs[2];
    lbPhaseSlug = slugs[3];
}

/**
 * Function that Start current Pom, this case is when the Pom has already started and the timer in going on
 * **/
function autoStartPom(){
    //Show/Hide buttons in UI
    timerView.hideElement(elements.btnStart);
    timerView.showElement(elements.btnPause);
    timerView.showElement(elements.btnReset);

    //Start the timer
    state.timer.start();
}

/**
 * Get Current Pom From DB
 * decide which phase still running
 */
function getCurrPom(){
    let currPomSec, currPomLength, currPomStartTime, currPomModifyTime, currPomFinishTime, currPomPhase = null;

    //Get data current pom from DB
    const curr = elements.currPom.data('currPom');
    //new Instance currPom
    const currPom = new CurrentPom(curr);

    //Set isPaused flag in State
    state.isPaused = currPom.hasPausedAt();

    //Set Id in state
    state.idPomCurr = currPom.getId();

    if(currPom.getIdTask()){
        //Set Id into the state
        state.idTask = currPom.getIdTask();

        //update UI
        homeView.setActiveClassToListItem(state.idTask);
    }

    if(currPom.getRound()){
        //set pomRound into the state
        state.pomRound = currPom.getRound();

        //update pomRound in UI
        elements.pomRoundUI.text(state.pomRound);
    }

    if(currPom.isCompleted()){
        //Set pomCompleted flag into state
        state.pomCompleted = currPom.isCompleted();
    }

    //Get Seconds from Current Pomodoro
    currPom.getCurrPomSec(state);

    //Calculate the next Phase
    currPom.calculateNextPhase(
        state, [pomPhaseSlug, sbPhaseSlug, lbPhaseSlug], [pomodoroPhase, shortBreakPhase, longBreakPhase]
    );

    //get vars from CurrentPom class
    currPomSec = currPom.currPomSec;
    currPomLength = currPom.length;
    currPomStartTime = currPom.startTime;
    currPomModifyTime = currPom.modifyTime;
    currPomFinishTime = currPom.finishTime;
    currPomPhase = currPom.phaseFunc;

    return [currPomSec, currPomStartTime, currPomPhase,
        currPomModifyTime, currPomFinishTime, currPomLength];
}

/**
 * Function to format date into YYYY/MM/DD H:i:s
 */
function dateToStrFormat(date){
    const arrYMD = [ date.getFullYear(), date.getMonth()+1, date.getDate()];
    const arrMS = [date.getHours(), date.getMinutes(), date.getSeconds()];

    return arrYMD.join('/') + ' ' + arrMS.join(':');
}

/** Function that reset the timer and create a new one **/
function onResetBtn(){
    state.isPaused = false;
    resetMainTimer(toSec(getCurrPomLength()));

    //Create a new pom
    onStartBtn();
}

/** Function that pause the current timer **/
function onPauseBtn(){
    //update PausedAt field on recordPom DB
    const data = {
        pausedAt: dateToStrFormat(new Date()),
        secRemaining: (Timer.getSecRemaining()) -1
    };

    const reqParam = {
        id: state.idPomCurr
    };

    //Fetching to update the current pom
    fetch('POST', Routing.generate("pom_edit", reqParam), data, function(){
        //flag pause
        state.isPaused = true;
        state.timer.pause();

        //Show/Hide buttons in UI
        timerView.hideElement(elements.btnPause);
        timerView.showElement(elements.btnReset);
        timerView.showElement(elements.btnStart);
    });
}

/** Function that start a new pom, and create it into DB **/
function onStartBtn(){
    const {timer, phaseTypeRunning, isPaused, pomRound, idTask} = state;

    //Check if the timer is not paused, mean that created a new record in the DB
    if(!isPaused){
        //Data of the new Pom
        const data = {
            pomType: phaseTypeRunning,
            pomLength: getCurrPomLength(),
            pomRound,
            idTask
        };

        // Fetching the new record
        fetch('PUT', Routing.generate("pom_create"), data, function(resData){
            //flag pause
            state.isPaused = false;

            //Set StartTime comming from DB
            state.timer.setStartTime(Date.parse(resData.createdAt.date));

            //Set in the State value of idPomCurr
            state.idPomCurr = resData.id;

            //Start timer AND Show&Hide Btns in UI
            autoStartPom();
        });

    }else{
        //In case exist the pom in the DB, update the value of PausedAt to null,
        //Set the secRemaining and the modifiedAt into the DB
        if(state.idPomCurr){
            const data = {
                pausedAt: '',
                secRemaining: (timer.remaining) +1,
                modifiedAt: dateToStrFormat(new Date()),
            };

            const reqParam = {
                id: state.idPomCurr
            };

            //Fetching to update the current pom
            fetch('POST', Routing.generate("pom_edit", reqParam), data, function(){
                //flag pause
                state.isPaused = false;

                //The StartTime continues with the same that is now
                state.timer.setStartTime(Date.now());

                //Start timer AND Show&Hide Btns in UI
                autoStartPom();
            });
        }else{
            //flag pause
            state.isPaused = false;

            //Start timer AND Show&Hide Btns in UI
            autoStartPom();
        }
    }
}

/** Function that check that NOW is not greater than the StartTime's Pom plus the Length **/
function isExpired(startTime, length){
    let endTime = moment(startTime);

    endTime.add(length, 'minutes');

    return moment().isAfter(endTime)
}

/**
 * Function to fetch through the DB
 */
function fetch(method, url, data, cb){
    $.ajax({
        method,
        url,
        data
    }).done(function(resData){
        //Check return data
        if(resData){
            cb(resData);
        }

    }).fail(function(jqXHR, textStatus){
        sweetModal(null, `Request failed: ${textStatus}`, true);
        //alert( "Request failed: " + textStatus );
    });
}

/** Function that Fetch the current Pomodoro and update values **/
function updatePomOnFinish(pomRound, pomCompleted){
    const data = {
        pomRound,
        pomCompleted,
        finishedAt: dateToStrFormat(new Date())
    };

    const reqParam = {
        id: state.idPomCurr
    };

    //Fetch to update values
    fetch('POST', Routing.generate("pom_edit", reqParam), data, function(resData){
        //Set result into State
        state.pomRound = resData.pomRound;
        state.pomCompleted = resData.pomCompleted;

        //update pomRound in UI
        elements.pomRoundUI.text(resData.pomRound);
    });
}

/** Function that get the Length of the Pomodoro base on the PhaseType - return in Minutes **/
function getCurrPomLength(){
    const { phaseTypeRunning, pomSec, sbSec, lbSec } = state;
    switch (phaseTypeRunning){
        case pomPhaseSlug:
            return pomSec/60;
            break;

        case sbPhaseSlug:
            return sbSec/60;
            break;

        case lbPhaseSlug:
            return lbSec/60;
            break;

        default:
            return 0;
    }
}

/**
 * Function to show correct buttons for new phase
 */
function onStartANewPhase(){
    //Display buttons in UI
    timerView.hideElement(elements.btnPause);
    timerView.hideElement(elements.btnReset);
    timerView.showElement(elements.btnStart);
}

/** Delete the old timer
 object, and Start a new one. */
function resetMainTimer(seconds, startTime) {
    //Stop and Reset
    if(state.timer){
        state.timer.reset();
    }

    //Create Timer
    state.timer = new Timer(seconds, 500, startTime, onFinishPhase);

    //Passing through the function renderTimer in each tick
    state.timer.onTick(timerView.renderTimer);

    return state.timer;
}

/**
 * Function that allow to show the minutes and seconds in the UI
 * in this case is the Preview before run pomTimer
 */
function renderPreviewPhase(sec){
    let timeObj = Timer.parseObj(sec);

    //Render timer
    timerView.renderTimer(timeObj.minutes, timeObj.seconds);
}

/** Phase of Pomodoro Simple **/
function pomodoroPhase(pomSec, startTime = null, autoStart = false){
    //save which phase is running, used by func onFinish pomodoro
    state.phaseTypeRunning = pomPhaseSlug;

    //Save in local storage
    localStorage.setItem("phaseTypeRunning", state.phaseTypeRunning);

    //Changing colors, addActiveClass to btn
    timerView.addClsAppBtn('Pom');
    homeView.applyTheme('PM');

    //Render Start button
    if(!autoStart)
        onStartANewPhase();

    //Preview of Phase
    renderPreviewPhase(pomSec);

    //Finally create timer
    resetMainTimer(pomSec, startTime);
}

/** Phase of ShortBreak Pomodoro **/
function shortBreakPhase(sbSec, startTime = null, autoStart = false){
    //save which phase is running, used by func onFinish pomodoro
    state.phaseTypeRunning = sbPhaseSlug;

    //Save in local storage
    localStorage.setItem("phaseTypeRunning", state.phaseTypeRunning);

    //Changing colors, addActiveClass to btn
    timerView.addClsAppBtn('SB');
    homeView.applyTheme('SB');

    //Render Start button
    if(!autoStart)
        onStartANewPhase();

    //Preview of Phase
    renderPreviewPhase(sbSec);

    //Finally create timer
    resetMainTimer(sbSec, startTime);
}

/** Phase of LongBreak Pomodoro **/
function longBreakPhase(lbSec, startTime = null, autoStart = false){
    //save which phase is running, used by func onFinish pomodoro
    state.phaseTypeRunning = lbPhaseSlug;

    //Save in local storage
    localStorage.setItem("phaseTypeRunning", state.phaseTypeRunning);

    //Changing colors, addActiveClass to btn
    timerView.addClsAppBtn('LB');
    homeView.applyTheme('LB');

    //Render Start button
    if(!autoStart)
        onStartANewPhase();

    //Preview of Phase
    renderPreviewPhase(lbSec);

    //Finally create timer
    resetMainTimer(lbSec, startTime);
}

/**
 * Function exec when a Pomodoro is already finished
 */
function onFinishPhase(){
    //Play Alarm
    elements.audio.play();

    const {pomCycle, pomSec, sbSec, lbSec, phaseTypeRunning} = state;

    if(phaseTypeRunning === pomPhaseSlug){
        //A pomodoro had already finished
        state.pomRound+= 1;

        updatePomOnFinish(state.pomRound, state.pomCompleted);

        if(pomCycle === state.pomRound){
            //going to LongBreak
            longBreakPhase(lbSec);
        }else{
            //going to ShortBreak
            shortBreakPhase(sbSec);
        }
    }else if(phaseTypeRunning === lbPhaseSlug){
        //check if the PomCycle is completed correctly
        if(pomCycle === state.pomRound)
            state.pomCompleted = true;

        updatePomOnFinish(state.pomRound, state.pomCompleted);

        // alert("Congrats");
        //Display Modal To Congrats the User for Complete the Task
        sweetModal('Congratulations!', 'You have completed the Task :)');

        //reset & init new pom
        initApp(pomSec, sbSec, lbSec);
        pomodoroPhase(pomSec);

    }else if(phaseTypeRunning === sbPhaseSlug){
        updatePomOnFinish(state.pomRound, state.pomCompleted);

        //going to pomodoro
        pomodoroPhase(pomSec);
    }

}

/**
 * Function that get pomCycle value from DB
 */
function getCycleLength(){
    let pomCycle = null;
    if(state.pomCycle)
        pomCycle = state.pomCycle;
    else
        pomCycle = parseInt(elements.pomCycleVal.data('cycleValue'));

    return pomCycle;
}

/**
 * Function to initialize values of App.
 * */
function initApp(pomSec, sbSec, lbSec){
    //State of App
    state = {
        timer: null,
        pomCycle: getCycleLength(),
        pomSec,
        sbSec,
        lbSec,
        pomRound: 0,
        pomCompleted: false,
        phaseTypeRunning: "",
        isPaused: false,
        idPomCurr: null,
        idTask: homeView.getCurrentIdTask(),
    };

    //update pomRound in UI
    elements.pomRoundUI.text(state.pomRound);
}

/** Load controllers **/
$(window).on('load', controlTimer);
$(window).on('load', controlTask);