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
            this.progress = Math.round(100 * (this.trialNum + this.pracTrialN)/ (this.trialN + this.pracTrialN))
        }

        this.trialNum++;

        const FORMAL = this.trialNum > 0;
        const LAST = FORMAL ? this.trialList.pop() : this.pracList.pop();

        function findNextTrial(last, formal) {
            if (last) {
                return false;
            }
            else {
                return formal ? that.trialList[that.trialList.length - 1]: that.pracList[that.pracList.length - 1];
            }
        }

        const NEXT_TRIAL = findNextTrial(LAST, FORMAL);

        this.updateFunc();

        const START_STIM = function() {
            that.trialFunc();
            that.startTime = Date.now();
        };

        setTimeout(START_STIM, this.intertrialInterval * 1000);
    }

    end(resp) {
        var currentTime = Date.now();
        this.rt = (currentTime - this.startTime) / 1000;
        this.response = resp;
        if (this.trialNum < this.trialN) {
            this.run();
        }
        else {
            this.complete = true;
            this.endExptFunc();
        }

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
const STIM_PATH = 'stimuli/'
const RATING_PRACTICE_LIST = ['prac.jpg'];
const RATING_PRACTICE_TRIAL_N = RATING_PRACTICE_LIST.length;
const RATING_LIST = ['AI 1', 'AI 2', 'AI 3'];
const RATING_IMG_LIST = RANDOMIZE(RATING_LIST);
const RATING_TRIAL_N = RATING_IMG_LIST.length;
const RATING_INSTR_TRIAL_N = RATING_PRACTICE_TRIAL_N + RATING_TRIAL_N;
const INTERTRIAL_INTERVAL = 0.5;
const ALL_IMG_LIST = RATING_PRACTICE_LIST.concat(RATING_LIST);

var instr, subj, rating;

$(document).ready(function() {
    LOAD_IMG(0, STIM_PATH, ALL_IMG_LIST, function() {});
    $('#pledge_box').show();
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
    0: [false, false, 'Thank you very much!<br /><br />This study will take about 30 minutes. Please read the instructions carefully, and avoid using the refresh or back buttons.'],
    1: [false, false, 'Now, please maximize your browser window.'],
    2: [false, false, 'The purpose of this study is to gauge art appreciation among college students.'],
    3: [false, false, 'In the first half of this experiment, you will be given a short prompt to answer.'],
    4: [false, false, 'In the latter half of this experiment, you will be shown a series of images. Your task is to select how visually pleasing a certain image is on a scale with 6 options.'],
    5: [false, false, "The next page will be a short instruction quiz. (Don't worry, it's very simple!)"],
    6: [false, SHOW_INSTR_QUESTION, ''],
    7: [SHOW_CONSENT, false, "Awesome! You can press SPACE to begin. Please maintain focus, avoid distraction, and avoid switching between other tabs and browsers."]
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
    var condition = RANDOM_INT(1, 3);
    if (condition == 1) {
        $('#dist_ind_1').show()
    }
    else if (condition == 2) {
        $('#dist_ind_2').show()
    }
}

function RATING() {
    
    $('#dist_ind_1').hide();
    $('#dist_ind_2').hide();

    $('#rating').show();
    rating.run()
    CREATE_IMAGE();
    $('#rating_area').show();
}

var position = 0;

function CREATE_IMAGE() {
    var img = document.createElement('img')
    img.src = STIM_PATH + ALL_IMG_LIST[position] + '.jpg';
    document.getElementById('stimuli').appendChild(img);
}

function NEXT_IMAGE(){
    if (position < ALL_IMG_LIST.length - 1){
        var img = document.getElementById('stimuli').getElementsByTagName('img')[0]
        position++;
        img.src = STIM_PATH + ALL_IMG_LIST[position] + '.jpg';
    }
    else{
        HALT_EXPERIMENT("You are done!");
    }
}

function END_RATING() {
    $('#BIF').show();
}

var rating_options = {
    pracTrialN: RATING_PRACTICE_TRIAL_N,
    trialN: RATING_TRIAL_N,
    titles: RATING_TITLES,
    stimPath: STIM_PATH,
    trialList: RATING_IMG_LIST,
    pracList: RATING_PRACTICE_LIST,
    intertrialInterval: 0.5,
    updateFunc: NEXT_IMAGE(),
    trialFunc: RATING(),
    endExptFunc: END_RATING(),
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

function LOAD_IMG(index, stim_path, img_list, after_func) {
    after_func = (after_func === undefined) ? function() { return; } : after_func;
    if (index >= img_list.length) {
        return;
    }
    const IMAGE = new Image();
    if (index < img_list.length - 1) {
        IMAGE.onload = function() {
            LOAD_IMG(index + 1, stim_path, img_list, after_func);
        };
    } else {
        IMAGE.onload = after_func;
    }
    IMAGE.src = stim_path + img_list[index];
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