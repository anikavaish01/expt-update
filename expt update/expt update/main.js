class subjObject {
    constructor(options = {}) {
        Object.assign(this, {}, options);

    this.dateObj = new Date();
    }
}

class trialObject {
    constructor(options = {}) {
        Object.assign(this, {
            pracTrialN: 0,
            trialN: 0,
            titles: '',
            stimPath: 'stimuli/',
            trialList: [],
            pracList: [],
            intertrialInterval: 0.5,
            updateFunc: false,
            trialFunc: false,
            endExptFunc: false,
            progressInfo: false
        }, options);
        this.trialNum = -this.pracTrialN;
        this.complete = false;
    }

    run() {
        var that = this;

        if (this.progressInfo) {
            this.progress = Math.round( 100 * (this.trialNum+this.pracTrialN) / (this.trialN+this.pracTrialN) );
        }
        this.trialNum++;
        const FORMAL = this.trialNum > 0;
        const LAST = FORMAL ? this.trialNum == this.trialN : this.trialNum == 0;
        this.thisTrial = FORMAL ? this.trialList.pop() : this.pracList.pop();

        function findNextTrial(last, formal) {
            if (last){
                return false
            } else {
                return formal ? that.trialList[that.trialList.length - 1] : that.pracList[that.pracList.length - 1];
            }
        }
        const NEXT_TRIAL = findNextTrial(LAST, FORMAL);

        this.updateFunc(FORMAL, LAST, this.thisTrial, NEXT_TRIAL, this.stimPath);

        const START_STIM = function() {
            that.trialFunc();
            that.startTime = Date.now();
        };

        setTimeout(START_STIM, this.intertrialInterval * 1000);
    }

    end(resp) {
        this.response = resp;
        if (this.trialNum != this.trialN) {
            this.run();
        } else {
            this.complete = true;
            this.endExptFunc();
        }
    }

    rest(box_element, text_element, callback, callback_parameters) {
        text_element.html('You are done with '+ this.progress + '% of the study!<br /><br />Take a short break now and hit space to continue whenever you are ready.')
        box_element.show();
        $(document).keyup(function(e) {
            if (e.which == 32) {
                $(document).off('keyup');
                box_element.hide();
                if (typeof callback_parameters == 'undefined') {
                    callback();
                }
                else {
                    callback(callback_parameters);
                }
            }
        });
    }
}
class instrObject {
    constructor(options = {}) {
        Object.assign(this, {
            textBox: false,
            textElement: false,
            dict: [],
            quizConditions: []
        }, options);
        this.index = 0;
        this.quizAttemptN = {};
        for (var i = 0; i <this.quizConditions.length; i++){
            this.quizAttemptN[this.quizConditions[i]] = 1;
        }
    }

    advance() {
        this.textElement.html(this.dict[this.index][2]);
        const PRE_FUNCTION = this.dict[this.index][0];
        if (PRE_FUNCTION !== false) {
            PRE_FUNCTION();
        }
        this.textBox.show();
        const POST_FUNCTION = this.dict[this.index][1];
        if (POST_FUNCTION !== false) {
            POST_FUNCTION();
        }
        this.startTime = Date.now();
    }

    start() {
        this.advance();
    }

    next() {
        this.textBox.hide();
        this.index += 1;
        if (this.index < Object.keys(this.dict).length) {
            this.advance();
        }
    }
}

const FORMAL = false;
const RATING_PRACTICE_LIST = ['prac'];
const RATING_PRACTICE_TRIAL_N = RATING_PRACTICE_LIST.length;
const RATING_LIST = ['AI1', 'AI2', 'AI3', 'AI4', 'AI5'];
const RATING_IMG_LIST = RANDOMIZE(RATING_LIST);
const RATING_TRIAL_N = RATING_IMG_LIST.length;
const RATING_INSTR_TRIAL_N = RATING_PRACTICE_TRIAL_N + RATING_TRIAL_N;
const INTERTRIAL_INTERVAL = 0.5;
const ALL_IMG_LIST = RATING_PRACTICE_LIST.concat(RATING_LIST);
const BIF_FORM = [
    {question: "Making a list",
    answers: {
        a: "Getting organized",
        b: "Writing things down"
    }},

    {question: "Reading",
    answers: {
        a: "Following lines of print",
        b: "Gaining knowledge"
    }},

    {question: "Joining the Army",
    answers: {
        a: "Helping the Nation's defense",
        b: "Signing up"
    }}
]

var instr, subj, rating;

$(document).ready(function() {
    $('#pledge_box').show();
    $('#ratingContainer').hide();
    $('#questions_box').hide();
})

function SUBMIT_PLEDGE_Q() {
    const RESP = $('input[name = "pledge"]:checked').val();
    if (CHECK_RESPONSE(RESP)) {
        $('#pledge_box').hide();
        if (RESP == 1) {
            ACCEPT_PLEDGE();
        }
        else {
            REFUSE_PLEDGE();
        }
    }
    else {
        $('#pledge_warning').text('You cannot proceed until you make a selection.')
    }
} 

function ACCEPT_PLEDGE() {
    instr = new instrObject(instr_options);
    rating = new trialObject(rating_options);
    instr.start();
}

function REFUSE_PLEDGE() {
    HALT_EXPERIMENT("It appears that you have reported that you will not read the instructions carefully.")
}

function HALT_EXPERIMENT(explanation) {
    $('.fixedbox').hide();
    $('#instr_text').html(explanation);
    $('#next_button').hide();
    $('#instr_box').show();
}

const MAIN_INSTRUCTIONS_DICT = {
    0: [false, false, 'Thank you very much!<br></br><br></br>This study will take about 30 minutes. Please read the instructions carefully, and avoid using the refresh or back buttons.'],
    1: [false, false, 'Please maximize your browser window.'],
    2: [false, false, 'In the first half of this experiment, you will be given a short prompt to answer.'],
    3: [false, false, 'In the latter half of this experiment, you will be shown a series of images. Your task is to select how visually pleasing a given image is on a 6-point scale ranging from very visually displeasing to very visually pleasing.'],
    4: [false, false, "The next page will be a short instruction quiz. (Don't worry, it's very simple!)"],
    5: [false, SHOW_INSTR_QUESTION, ''],
    6: [SHOW_CONSENT, false, "Awesome! You can press SPACE to begin.<br></br><br></br>Please maintain focus, avoid distraction, and try not to switch between other tabs and browsers."]
};

function SHOW_INSTR_QUESTION() {
    $('#instr_box').hide();
    $('#quiz_box').show();
}

function SUBMIT_INSTR_Q() {
    const CHOICE = $('input[name = "quiz"]:checked').val();
    if (typeof CHOICE == 'undefined') {
        $('#quiz_warning').text('Please make a selection. Thank you!')
    }
    else if (CHOICE != 'option1') {
        instr.quizAttemptN['onlyQ'] += 1;
        $('#instr_text').text('You have given an incorrect answer. Please read the instructions again carefully.');
        $('#instr_box').show();
        $('#quiz_box').hide();
        $('input[name = "quiz"]: checked').prop('checked', false);
        instr.index = -1;
    }
    else {
        instr.next();
        $('#quiz_box').hide();
        SHOW_CONSENT();
    }
}

function SHOW_CONSENT() {
    $('#next_button').hide();
    $('#consent_box').show();
    $(document).keyup(function(e) {
        if (e.code == 'Space') {
            $(document).off('keyup');
            $('#instr_box').hide();
            DISTANCE_INDUCTION();
        }
    });
}

var instr_options = {
    textBox: $('#instr_box'),
    textElement: $('#instr_text'),
    dict: MAIN_INSTRUCTIONS_DICT,
    quizConditions: ['onlyQ']
};

const RATING_TITLES = [ 'trialNum', 'stimName'];

function DISTANCE_INDUCTION() {
    var condition = 1;
    if (condition == 1) {
        $('#dist_ind_1').show()
    }
    else if (condition == 2) {
        $('#dist_ind_2').show()
    }
}

function SHOW_RATING() {
    $('#dist_ind_1').hide();
    $('#dist_ind_2').hide();
    $('#trialBox').show();
    rating.run();
}

function RATING_UPDATE(formal_trial, last, this_trial, next_trial, path) {
    rating.stimName = this_trial;
    $('#trialProgress').text(rating.progress);
    $('#testImg').attr('src', path + this_trial + '.jpg');
    if (!last) {
        $('#bufferImg').attr('src', path + next_trial + '.jpg');
    }
}

function RATING() {
    $('#testImg').show();
    $('#ratingContainer').show();
    $('.ratingButton').mouseup(
        function(event) {
            $('.ratingButton').unbind('mouseup');
            $('#testImg').hide();
            var target = $(event.target).closest('.ratingButton');
            rating.end(target.attr('id'));
        }
    );
}

function END_RATING() {
    $('#trialBox').hide();
    $('#cont_instr').show()
    $(document).keyup(function(e) {
        if (e.code == 'Space') {
            $(document).off('keyup');
            $('#cont_instr').hide();
            BIF();
        }
    });
}

function BIF() {
    $('#BIF_instr').show();
}

function BIF_Q1() {
    $('#BIF_instr').hide();
    $('#BIF_Q1').show();
}

function BIF_Q2() {
    $('#BIF_Q1').hide();
    $('#BIF_Q2').show();
}

function BIF_Q3() {
    $('#BIF_Q2').hide();
    $('#BIF_Q3').show();
}

function DEBRIEFING() {
    $('#BIF_Q3').hide();
    $('#questions_box').show();
}

function SUBMIT_DEBRIEFING_Q(){
    $('#questions_box').hide();
    $('#END').show();
}
var rating_options = {
    pracTrialN: RATING_PRACTICE_TRIAL_N,
    trialN: RATING_TRIAL_N,
    titles: RATING_TITLES,
    stimPath: 'stimuli/',
    trialList: RATING_IMG_LIST,
    pracList: RATING_PRACTICE_LIST,
    intertrialInterval: 0.5,
    updateFunc: RATING_UPDATE,
    trialFunc: RATING,
    endExptFunc: END_RATING,
    progressInfo: true
}

function RANDOM_INT(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function RANDOMIZE(input) {
    var j, temp;
    var arr = Array.from(input);
    for (var i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1))
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

function CHECK_RESPONSE(input) {
    if (typeof (input) == 'undefined'){
        $('#warning_box').text('You must answer this question in order to proceed.')
        $('#warning_box').show()
        return false;
    }
    else{
        return true;
    }
}