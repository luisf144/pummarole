import { toSec } from '../../Util';

//Import moment for management dates
import moment from 'moment';
require ('moment-precise-range-plugin');

export default class CurrentPom {
    constructor(currPom){
        const [createdAt, modifiedAt, finishedAt] = this.getDates(currPom);

        this.currPom = currPom;
        this.startTime = createdAt;
        this.modifyTime = modifiedAt;
        this.finishTime = finishedAt;
        this.length = this.getLength();
        this.type = this.getType();
        this.secRemaining = this.getSecRemaining();
        this.phaseFunc = null;
        this.currPomSec = null;
    }

    getDates(currPom){
        let createdAt, modifiedAt, finishedAt = null;
        if(currPom){
            if(currPom.hasOwnProperty("createdAt")){
                createdAt = currPom.createdAt.date;
            }

            if(currPom.hasOwnProperty("modifiedAt") && currPom.modifiedAt){
                modifiedAt = currPom.modifiedAt.date;
            }

            if(currPom.hasOwnProperty("finishedAt") && currPom.finishedAt){
                finishedAt = currPom.finishedAt.date;
            }
        }

        return [createdAt, modifiedAt, finishedAt];

    }

    getId(){
        if(this.currPom && this.currPom.hasOwnProperty('id')){
            return this.currPom.id;
        }
    }
    getSecRemaining(){
        if(this.currPom && this.currPom.hasOwnProperty("secRemaining") && this.currPom.secRemaining){
            return this.currPom.secRemaining;
        }
    }
    getLength(){
        if(this.currPom && this.currPom.hasOwnProperty("pomLength")){
            return parseInt(this.currPom.pomLength);
        }
    }
    getType(){
        if(this.currPom && this.currPom.hasOwnProperty('pomType')){
            return this.currPom.pomType;
        }
    }

    hasPausedAt(){
        if(this.currPom && this.currPom.hasOwnProperty("pausedAt") && this.currPom.pausedAt){
            //if exist pausedAt date then SET pausedFlag into the App State
            return true;
        }

        return false;
    }

    getIdTask(){
        if(this.currPom && this.currPom.hasOwnProperty('idTask')){
            return this.currPom.idTask;
        }
    }

    getRound(){
        if(this.currPom && this.currPom.hasOwnProperty("pomRound")){
            return this.currPom.pomRound
        }
    }

    isCompleted(){
        if(this.currPom && this.currPom.hasOwnProperty('pomCompleted')){
            return this.currPom.pomCompleted;
        }
    }


    getCurrPomSec(state){
        if(state.isPaused){
            this.currPomSec = this.secRemaining;
        }else{
            if(this.secRemaining){
                this.currPomSec = this.secRemaining;
            }else{
                const endTime = moment(this.startTime);
                endTime.add(this.length, 'minutes');

                const duration = moment.preciseDiff(endTime, moment(this.startTime), true);
                this.currPomSec = toSec(duration.minutes) + duration.seconds;
            }
        }

        return this.currPomSec;
    }

    calculateNextPhase(state, pomSlugPhases, pomPhases){
        const [pomPhaseSlug, sbPhaseSlug, lbPhaseSlug] = pomSlugPhases;
        const [pomodoroPhase, shortBreakPhase, longBreakPhase] = pomPhases;

        //Calculate Phase base on pomType
        if(this.type === pomPhaseSlug){
            if(this.finishTime && (state.pomRound === state.pomCycle)){
                //next phase Init LB phase
                this.currPomSec = state.lbSec;
                this.phaseFunc = longBreakPhase;

            }else if(this.finishTime){
                //Check if has already finished then pass next to SB
                //Init SB phase
                this.currPomSec = state.sbSec;
                this.phaseFunc = shortBreakPhase;

            }else{
                //Init pomodoro phase
                this.phaseFunc = pomodoroPhase;
            }
        }else if(this.type === sbPhaseSlug){
            //Check if has already finished then pass next to Pom
            if(this.finishTime){
                //Init pomodoro phase
                this.currPomSec = state.pomSec;
                this.phaseFunc = pomodoroPhase;

            }else{
                //Init SB phase
                this.phaseFunc = shortBreakPhase;
            }
        }else if(this.type === lbPhaseSlug){
            //check if pom is finished then go to PomPhase
            if(this.finishTime){
                //Init pomodoro phase
                this.currPomSec = state.pomSec;
                this.phaseFunc = pomodoroPhase;
            }else{
                //Init LB phase
                this.phaseFunc = longBreakPhase;
            }
        }

        return this.phaseFunc;
    }
}