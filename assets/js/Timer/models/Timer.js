/**
 * Created by luiscarbajal on 26/05/2020.
 */
let secondsRemaining = null;
export default class Timer {
    constructor(seconds, tickRate = 500, startTime = null, onFinishFunc){
        this.seconds = seconds;
        this.tickRate = tickRate; // Milliseconds
        this.tickFunctions = [];
        this.isRunning = false;
        this.remaining = this.seconds;
        this.startTime = startTime;
        this.timerVar = null;
        this.onFinish = onFinishFunc;
    }

    tick = () => {
        const secondsSinceStart = ((Date.now() - this.startTime) / 1000) | 0;
        secondsRemaining = this.remaining - secondsSinceStart;


        const timeRemaining = Timer.parseObj(secondsRemaining);

        // Execute each tickFunction in the array
        this.tickFunctions.forEach(
            function(tickFunction) {
                /* calling the function to display the values */
                tickFunction.call(this,
                    timeRemaining.minutes,
                    timeRemaining.seconds);
            },
            this);


        // Check if timer has been paused by user
        if (!this.isRunning) {
            this.remaining = secondsRemaining;
        } else {
            if (secondsRemaining > 0) {
                // Execute another tick in tickRate milliseconds
                this.timerVar = setTimeout(this.tick, this.tickRate);
            } else {
                // Stop this timer
                this.remaining = 0;
                this.isRunning = false;

                //Timer Finish
                this.timerIsOver();
            }

        }
    };

    start(){
        if(this.isRunning) {
            return;
        }

        this.isRunning = true;

        //In case timer is not set
        if(!this.startTime){
            this.startTime = Date.now();
        }

        this.tick();
    }

    pause() {
        this.isRunning = false;
    };

    reset(){
        this.pause();
        clearTimeout(this.timerVar);
    }

    setStartTime(time){
        this.startTime = time;
    }

    getStartTime(){
        return this.startTime;
    }

    static getSecRemaining(){
        return secondsRemaining;
    }

    /** Add a function to the timer's tickFunctions. */
    onTick(tickFunction) {
        if (typeof tickFunction === 'function') {
            this.tickFunctions.push(tickFunction);
        }
    };

    /** Return Object with minutes and seconds from seconds. */
    static parseObj(seconds) {
        return {
            'minutes': (seconds / 60) | 0,
            'seconds': (seconds % 60) | 0
        }
    }

    timerIsOver(){
        this.onFinish();
    }
}