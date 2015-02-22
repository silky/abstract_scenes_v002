// You have 3 ways of using this interface:
// Note: QS is short for query string, i.e., the <name>=<val> stuff after the
// question mark (?) in the URL.
// 1. Specify an ordered list of existing scene JSON files to initialize with.
//    E.g., QS has sceneJSON01=AXOOE_01.json&sceneJSON02=AOEUE_11.json
// 2. Specify an ordered list of scene types to go through. E.g., QS has
//    sceneType01=Park&sceneType02=Living&sceneType03=Kitchen
//    Note: Kitchen currently doesn't exist
// 3. Specify the total number of scenes along with which type of scene. E.g.,
//    QS has sceneType=Park&numScene=4
//    If either one of these are blank, some defaults are used.
//    If both are blank, demo mode.
// 4. Demo mode
// In that order (e.g., 1's parameters supersced 3's)

// Current interface location
// var baseURL = "./"
var baseURL = "http://vision.ece.vt.edu/abstract_scenes_v002/site/";
var baseURL = './'
var baseURLInterface = baseURL + "../interface/";
var dataURL = baseURL + "../data/";

// Xinlei instruction example related
// Keep for Xinlei's examples
var exampleBaseURL = "http://ladoga.graphics.cs.cmu.edu/xinleic/genSents/Interface/";
var ex_total_options = {
                        "Park": 960,
                        "Living": 930
                        };
// Some random default numbers...
var NUM_GOOD_EXAMPLES = 5;
// Maybe not good to do...
var ex_total = NUM_GOOD_EXAMPLES+1;

// SA: TODO Add these to scene_config.json!
var DEFAULT_ZSIZE = 2;
var IMG_PAD_NUM = 2; // How many zeros to pad image-related names
var MIN_NUM_OBJ = 6; // How many clipart objects they need to use.
var MIN_PER_TYPE = 1; // How many clipart of each type is required (unused).
var NOT_USED = -10000;
var NUM_ZSCALES = 5;
var NUM_DEPTH0 = 3;
var NUM_DEPTH1 = 10;
var NUM_FLIP = 2;

var NUM_QS_ZEROPAD = 2; // Number of digits for QS parameters
var hitID = '';
var assignmentID = '';
var workerID = '';
var curScene = 0;

// By default, require restrictions on input
var restrictInputStr = decode(gup("restrictInput"));
if (restrictInputStr == "") {
    restrictInput = true;
} else {
    if (restrictInputStr != "0") {
        restrictInput = true;
    } else {
        restrictInput = false;
    }
}

// Maybe want to parse list of scene types in the future
var sceneTypeList;
var sceneType = "Living";
var curSceneType = '';
var numScene = 3;

sceneJSON = collect_ordered_QS('sceneJSON', NUM_QS_ZEROPAD);

if (sceneJSON.length > 0) {
    sceneTypeList = [];
    // Figure out this part...
//     sceneJSON.forEach( function(d) { 
//         sceneTypeList.append(
//     } );
} else {
    
    sceneTypeList = collect_ordered_QS('sceneType', NUM_QS_ZEROPAD);
    
    if (sceneTypeList.length == 0) {
        var sceneTypeStr = decode(gup("sceneType"));
        var numSceneStr = decode(gup("numScene"));

        if (sceneTypeStr == "" && numSceneStr == "") {
            // Default "demo" settings
            numScene = 2;
            sceneTypeList = ["Living", "Park"];
        } else {
            if (sceneTypeStr != "") {
                sceneType = sceneTypeStr;
            }

            if (numSceneStr != "") {
                numScene = Number(numSceneStr);
            }
    
            sceneTypeList = []
            for (var i = 0; i < numScene; i++) {
                sceneTypeList.push(sceneType);
            }
        }
    }
    
    curSceneType = sceneTypeList[0];
}

console.log(sceneTypeList)

var titleStr;
if (curSceneType == "Living") {
    titleStr = "Living/Diving Room";
} else {
    titleStr = curSceneType;
}
    
var randInitStr = decode(gup("randInit"));
var randInit = true;
if (randInitStr == "") {
    randInit = true;
} else {
    if ( randInitStr == "0") {
        randInit = false;
    } else {
        randInit = true;
    }
}

// Contain all scene objects, which each will contain all info (and more) 
// needed to render an image or load it back into the interface later
var sceneData = Array(numScene);

// ===========================================================
// Functions to help parse the URL query string for AMT data
// ===========================================================
function gup(name) {
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var tmpURL = window.location.href;
    var results = regex.exec(tmpURL);
    if (results == null) {
        return "";
    } else {
        return results[1];
    }
}

function decode(strToDecode) {
    var encoded = strToDecode;
    return unescape(encoded.replace(/\+/g, " "));
}

function get_random_int(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function zero_pad(num, numZeros) {
    var n = Math.abs(num);
    var zeros = Math.max(0, numZeros - Math.floor(n).toString().length );
    var zeroString = Math.pow(10,zeros).toString().substr(1);
    if( num < 0 ) {
        zeroString = '-' + zeroString;
    }

    return zeroString+n;
}

function collect_ordered_QS(param_name, pad) {
    
    var array = []; // Store all the data
    var done = false;
    var i = 1;
    var name = '';
    var val = '';
    
    while (done == false) {
        name = param_name + zero_pad(i, pad);
        val = decode(gup(name));

        if ( val == "") {
            done = true;
        } else {
            array.push(val);
        }
        i += 1;
    }
    
    return array;
}