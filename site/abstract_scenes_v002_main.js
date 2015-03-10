﻿// HIT-related Info
var init_time;

var NUM_TABS;
// Names of the object types (e.g., smallObject)
// in a defined order that governs their index
// into availableObject
var objectTypeOrder;
// objectType name -> idx for menu stuff
var objectTypeToIdx; 
var numObjTypeShow;

 // Start off on which tab? Set in scene config file.
var selectedTab;
var selectedTabIdx;

var curLoadAll;
var numAvailableObjects = 0; // Gets updated in store_json_and_init

// Array with start index of different categories
var clipartIdxStart;

// Keeps track of the configurations for all the scene types.
var sceneConfigData;

// Keeps track of the per-category information about the data.
// I.e., what's in the data_<object category>.json files.
var objectData = {};

// Data for the current (rendered) scene
var curSceneData;
var curAvailableObj;
var curUserSequence;
var curClipartImgs;
var curPeopleExprImgs;
var curPaperdollExprImgs = [];
var curPaperdollPartImgs = [];
var curDepth0Used;
var curDepth1Used;
var curInitHistory;

var loadedObjectsAndBG = false;

// global variables for the page
////// MULTIPLE OBJECTS FOR THE CURRENT SCENE ///////
// Various variables setting up the appearence of the interface
var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 400;
var CANVAS_ROW = 30;
var CANVAS_COL = 20;
var TAB_WIDTH = 0;
var TAB_HEIGHT = 0;
var CLIPART_WIDTH = 0;
var CLIPART_HEIGHT = 0;
var CLIPART_ROW = 0;
var CLIPART_COL = 0;
var CLIPART_BUFFER = 10;
// the row of canvas and the buffer, looks like the starting point
var ATTR_ROW = 0; 
var ATTR_COL = 0;
var ATTR_WIDTH = 0;
var ATTR_HEIGHT = 0;
var ATTR_TYPE_COL = 0;
var ATTR_TYPE_ROW = 0;
var ATTR_TYPE_WIDTH = 0;
var ATTR_TYPE_HEIGHT = 0;

// Adding buttons for pages within tabs
var tabPage = 0;
// SA: Added new offsets since Larry changed things
var tabColOffset = 45;
var tabRowOffset = 70;
var tabPageUpRect = {x1: 20 + tabColOffset, x2:155 + tabColOffset,
                     y1: 5 + tabRowOffset,  y2:55 + tabRowOffset};
var tabPageDownRect = {x1: 180 + tabColOffset, x2: 315 + tabColOffset, 
                       y1: 5 + tabRowOffset,   y2: 55 + tabRowOffset};
var tabPageUpImg;
var tabPageDownImg;

// Grid size of shown clipart objects
var NUM_CLIPART_VERT = 5;
var NUM_CLIPART_HORZ = 5;
var CLIPART_SKIP = 80;
var CLIPART_SIZE = CLIPART_SKIP - 2 * CLIPART_BUFFER;
var CLIPART_OBJECT_OFFSET_COL = 0;
var CLIPART_OBJECT_OFFSET_ROW = 70;
var MAX_NUM_ATTR = 8;
// Number of clip art to show of the other objects
var CLIPART_OBJECT_COL = CLIPART_COL + CLIPART_SKIP * NUM_CLIPART_HORZ + 24;

// Button size
var SCALE_COL = 0;
var SCALE_ROW = 0;
var SCALE_WIDTH = 120;
var SCALE_HEIGHT = 29;
var FLIP_COL = 0;
var FLIP_ROW = 0;
var scaleSliderDown = false;
var flipDown = false;
var attrSelectorDown = false;
var wasOnCanvas = false;
var selectedAttributeType = 0;

var i, j, k, l, m;
var bgImg;
var selectedImg;
var buttonImg;
var tabsImg;
var objectBoxImg;
var attrBoxImg;
var attr2BoxImg;
var slideBarImg;
var slideMarkImg;
var noLeftImg;
var numBorderImg;
var canvas_fix;
var ctx;
var image_name;
var category_name;
var mouse_offset_X = 0;
var mouse_offset_Y = 0;
var CLIPART_IMG_FORMAT = 'png'
//current location
var cx = 0;
var cy = 0;
var buttonW = 0;
var buttonH = 0;

// Set in reset_scene()
var selectedIdx = -9999;
var selectedIns = -9999;
var selectedPart = 'null';
var lastIdx = -9999;
var lastIns = -9999;
var selectPaperdollPose = false;
var lastX = 0;
var lastY = 0;
var lastZ = 0; 
var moveClipart = false;

// get response from keyboard
var CTRL_DOWN = false;

// Loads the info about what different scenes are like
// and then also loads the object category specific information
// into the interface. This must finish before we can start
// rendering objects.
load_config_json(); 

// ===========================================================
// Top-level initialization of the website and canvas
// ===========================================================
function init() {
    
    init_time = $.now();
    curScene = 0;
    
    // Load the background of the scene
//     bgImg = new Image();
//     bgImg.src = baseURLInterface + 'Living' + '/' + "BG1.png"
//     bgImg.onload = draw_canvas;
    
    // Setup the HTML canvas that the entire interactive part will be displayed on
    canvas_fix = document.getElementById("scene_canvas");
    ctx = canvas_fix.getContext("2d");

    canvas_fix.onmousemove = mousemove_canvas;
    canvas_fix.onmousedown = mousedown_canvas;
    canvas_fix.onmouseup = mouseup_canvas;
    
    document.onkeydown = handle_key_down;
    document.onkeyup = handle_key_up;

    // Load all of the images for menus
    selectedImg = new Image();
    selectedImg.src = baseURLInterface + 'selected.png';
    buttonImg = new Image();
    buttonImg.src = baseURLInterface + 'buttons.png';
    slideBarImg = new Image();
    slideBarImg.src = baseURLInterface + 'slidebar.png';
    slideMarkImg = new Image();
    slideMarkImg.src = baseURLInterface + 'slidemark.png';
    noLeftImg = new Image();
    noLeftImg.src = baseURLInterface + 'noleft1.png';
    numBorderImg = new Image();
    numBorderImg.src = baseURLInterface + 'num.png';
    
    // Call draw_canvas() when respective img is dled
    buttonImg.onload = draw_canvas;
    slideBarImg.onload = draw_canvas;
    slideMarkImg.onload = draw_canvas;
    
    // Tab page button images
    tabPageUpImg = new Image();
    tabPageUpImg.src = baseURLInterface + 'previous_button.png';
    tabPageUpImg.onload = draw_canvas;
    tabPageDownImg = new Image();
    tabPageDownImg.src = baseURLInterface + 'next_button.png';
    tabPageDownImg.onload = draw_canvas;

    reset_scene();
    draw_canvas();
}

function reset_scene() {
    
    if ( sceneTypeList.length > 0 && sceneConfigData != undefined) {
        curSceneData = sceneData[curScene];
        curSceneType = sceneTypeList[curScene];
        curSceneTypeBase = extract_scene_type_base(curSceneType)
        
        imgPadNum = sceneConfigData[curSceneType].imgPadNum;
        notUsed = sceneConfigData[curSceneType].notUsed;
        defZSize = sceneConfigData[curSceneType].defZSize;
        minNumObj = sceneConfigData[curSceneType].minNumObj;
        maxNumObj = sceneConfigData[curSceneType].maxNumObj;
        minPerCatType = sceneConfigData[curSceneType].minPerCatType;
        minPosChange = sceneConfigData[curSceneType].minPosChange;
        minSceneChange = sceneConfigData[curSceneType].minSceneChange;
        numZSize = sceneConfigData[curSceneType].numZSize;
        numDepth0 = sceneConfigData[curSceneType].numDepth0;
        numDepth1 = sceneConfigData[curSceneType].numDepth1;
        numFlip = sceneConfigData[curSceneType].numFlip;
        
        selectedIdx = notUsed;
        selectedIns = notUsed; 
        lastIdx = notUsed;
        lastIns = notUsed; 
        lastX = 0;
        lastY = 0;
        lastZ = defZSize; 
        
        // In the html file
        update_instructions();

        load_obj_category_data();
        
        curZScale = Array(numZSize);
        curZScale[0] = 1.0;
        for (i = 1; i < numZSize; i++) {
            curZScale[i] = curZScale[i - 1] * sceneConfigData[curSceneType].zSizeDecay;
        }
        
        clipartIdxStart = []
        clipartIdxStart.push(0);
        for (i = 1; i < objectTypeOrder.length; i++) {
            clipartIdxStart.push(numObjTypeShow[objectTypeOrder[i-1]] + clipartIdxStart[i - 1]); // just for indexing, mark the starting point of each
        }

        selectedIdx = notUsed;
        selectedIns = notUsed;
        moveClipart = false;
        mouse_offset_X = 0;
        mouse_offset_Y = 0;
        
        // Load the background of the scene
        bgImg = new Image();
        bgImg.src = baseURLInterface + 
                    sceneConfigData[curSceneType].baseDir+ "/" 
                    + sceneConfigData[curSceneType].bgImg;
        bgImg.onload = draw_canvas;
        
        if (curSceneData != undefined) { // Scene exists from current session
            
            curAvailableObj = curSceneData.availableObject;
            curClipartImgs = curSceneData.clipartImgs;
            curPeopleExprImgs = curSceneData.peopleExprImgs;
            curUserSequence = curSceneData.userSequence;
            curLoadAll = curSceneData.loadAll;
            curDepth0Used = curSceneData.depth0Used;
            curDepth1Used = curSceneData.depth1Used;
            curSceneType = curSceneData.sceneType;
            curSceneTypeBase = extract_scene_type_base(curSceneType)
            curInitHistory = curSceneData.initHistory;
            
        } else { // Randomly or from previous JSON initialization
            
            curLoadAll = Array(numObjTypeShow["human"]); // flag if to have load all
            for (i = 0; i < curLoadAll.length; i++) {
                curLoadAll[i] = 0;
            }
            
            curSceneData = {};
                        
            if (loadSceneJSON == true) { // From previous JSON object
                curSceneFile = sceneJSONFile[curScene];
                if (sceneJSONData[curSceneFile].hasOwnProperty('failed')) {
                    curInitHistory = ['Failed->Random'];
                    rand_obj_init();
                    rand_obj_load_first_imgs();
                } else {
                    curInitHistory = sceneJSONData[curSceneFile].initHistory;
                    if (curInitHistory == undefined) {
                        curInitHistory = ['Random'];
                    }
                    curInitHistory.push(curSceneFile);
                    json_obj_init();
                    json_obj_load_first_imgs();
                }
            } else { // Random initialization of scene
                curInitHistory = ['Failed->Random'];
                rand_obj_init();
                rand_obj_load_first_imgs();
            }
            
            // SA: TODO Should probably wrap this in a nice class initialization or something
            curSceneData.availableObject = curAvailableObj;
            curSceneData.clipartImgs = curClipartImgs;
            curSceneData.peopleExprImgs = curPeopleExprImgs;
            curSceneData.loadAll = curLoadAll;
            curSceneData.userSequence = curUserSequence;
            curSceneData.depth0Used = curDepth0Used;
            curSceneData.depth1Used = curDepth1Used;
            curSceneData.sceneType = curSceneType;
            curSceneData.initHistory = curInitHistory;
        }
        loadedObjectsAndBG = true;
    }
    draw_scene();
}

function json_obj_init() {
    
    sceneFilename = sceneJSONFile[curScene];
//     curSceneData = sceneJSONData[sceneFilename].scene;    
    // Hack to create a new object so we can detect changes
    curSceneData = JSON.parse(JSON.stringify(sceneJSONData[sceneFilename].scene));
    curAvailableObj = curSceneData.availableObject;
    curClipartImgs = Array(numAvailableObjects);
    curPeopleExprImgs = Array(numObjTypeShow['human']);
    
    curPaperdollExprImgs = Array(numObjTypeShow['paperdoll']);
    curPaperdollPartImgs = Array(numObjTypeShow['paperdoll']);
    
//     // Don't overwrite user tracking history
//     curUserSequence = curSceneData.userSequence;
    // Overwrite old user tracking history
    curUserSequence = { selectedIdx: [],
                        selectedIns: [],
                        present: [],
                        poseID: [],
                        expressionID: [],
                        x: [],
                        y: [],
                        z: [],
                        flip: [],
                        depth1: []
                      };

    curDepth0Used = Array(numDepth0);
    curDepth1Used = Array(numDepth1);
    
    for (i = 0; i < numDepth0; i++) {
        curDepth0Used[i] = 0;
    }
    
    for (i = 0; i < numDepth1; i++) {
        curDepth1Used[i] = 0;
    }
    
    var objInstance;
    var curIdx = 0; // Keep track of how many objects are being added
    for (var i = 0; i < curAvailableObj.length; i++) {
        for (var j = 0; j < curAvailableObj[i].numInstance; j++) {
            objInstance = curAvailableObj[i].instance[j];
            curDepth0Used[objInstance.depth0]++; // just the count
            curDepth1Used[objInstance.depth1]++;
        }
    }
}

function rand_obj_init(histStr) {

    curAvailableObj = [];
    curClipartImgs = Array(numAvailableObjects);
    curPeopleExprImgs = Array(numObjTypeShow['human']);
    curUserSequence = { selectedIdx: [],
                        selectedIns: [],
                        present: [],
                        poseID: [],
                        expressionID: [],
                        x: [],
                        y: [],
                        z: [],
                        flip: [],
                        depth1: []
                      };

    curDepth0Used = Array(numDepth0);
    curDepth1Used = Array(numDepth1);
    
    for (i = 0; i < numDepth0; i++) {
        curDepth0Used[i] = 0;
    }
    
    for (i = 0; i < numDepth1; i++) {
        curDepth1Used[i] = 0;
    }
    
    var curIdx = 0; // Keep track of how many objects are being added
    for (var objectType in objectData) {
        if (objectData.hasOwnProperty(objectType)) {
            curObjectType = objectData[objectType];
            var validIdxs = [];
            for ( var k = 0; k < curObjectType.type.length; k++ ) {
                for ( var m = 0; m < curObjectType.type[k].availableScene.length; m++ ) {
                    if ( curObjectType.type[k].availableScene[m].scene == curSceneTypeBase ) {
                        validIdxs.push([k, m])
                    }
                }
            }

            var numValidTypes = validIdxs.length;
            numSelObj = numObjTypeShow[curObjectType.objectType];

            for ( var j = 0; j < numSelObj; j++ ) {
                var found = true;
                while (found) {
                    idxType = get_random_int(0, numValidTypes);
                    idxValidType = validIdxs[idxType][0];
                    idxScene = validIdxs[idxType][1];
                    
                    found = false;
                    for (var idxFound = 0; idxFound < curIdx; idxFound++) {
                        if (curAvailableObj[idxFound].instance[0].name == curObjectType.type[idxValidType].name 
                            && curAvailableObj[idxFound].instance[0].type == curObjectType.objectType) {
                            found = true;
                            break;
                        }
                    }
                }
                
                var objs = []; // Array of all individual instances
                var numTotalInstance = curObjectType.type[idxValidType].availableScene[idxScene].numInstance;
                idxStyle = get_random_int(0, curObjectType.type[idxValidType].numStyle);
                for ( var k = 0; k < numTotalInstance; k++ ) {
                    
                    idxPose = get_random_int(0, curObjectType.type[idxValidType].numPose);
                    var objInstance = {};
                    if (curObjectType.deformable == undefined) {
                        // SA: Temporary hack until I update the object config files
                        objInstance.deformable = false;
                    } else {
                        objInstance.deformable = curObjectType.deformable;
                    }
                    
                    if (objInstance.deformable == true) {
                        // TODO Add additional fields for deformable/paperdoll types
                    }
                    objInstance.type = curObjectType.objectType;
                    objInstance.name = curObjectType.type[idxValidType].name;
                    objInstance.numPose = curObjectType.type[idxValidType].numPose;
                    objInstance.poseID = idxPose;
                    objInstance.instanceID = k;
                    objInstance.present = false;
                    objInstance.x = 0;
                    objInstance.y = 0;
                    objInstance.z = defZSize;
                    objInstance.flip = get_random_int(0, numFlip);
                    objInstance.depth0 = curObjectType.type[idxValidType]
                        .availableScene[idxScene].depth0;
                    objInstance.depth1 = curObjectType.type[idxValidType]
                        .availableScene[idxScene].depth1;
                    
                    // Currently, only humans have additional fields/aren't consistent with others
                    if ( curObjectType.objectType == "human" ) {
                        objInstance.numStyle = curObjectType.type[idxValidType].numStyle;
                        objInstance.styleID = idxStyle;
                        objInstance.numExpression = curObjectType.type[idxValidType].numExpression;
                        objInstance.expressionID = 0; // No face
                    } else if (curObjectType.objectType == "largeObject" || curObjectType.objectType == "smallObject") {
                        // SA: Do we want this at instance-level?
                        objInstance.baseDir = curObjectType.type[idxValidType].baseDir;
                    } else if (curObjectType.objectType == "paperdoll") {
                        objInstance.numExpression = curObjectType.type[idxValidType].numExpression;
                        objInstance.expressionID = 0; // No face
                        objInstance.body = curObjectType.type[idxValidType].body; // No face
                        objInstance.partIdxList = curObjectType.type[idxValidType].partIdxList;
                        objInstance.globalScale = curObjectType.type[idxValidType].globalScale;
                        objInstance.paperdollGRotation = Array(curObjectType.type[idxValidType].body.length);
                        objInstance.paperdollLRotation = Array(curObjectType.type[idxValidType].body.length);
                        objInstance.paperdollX = Array(curObjectType.type[idxValidType].body.length);
                        objInstance.paperdollY = Array(curObjectType.type[idxValidType].body.length);
                    }
                    
                    curDepth0Used[objInstance.depth0]++; // just the count
                    curDepth1Used[objInstance.depth1]++;
                    
                    objs.push(objInstance);
                }
                
                var oneObjectType = {};
                // SA: TODO Move numPose/numExpression stuff into here now or keep it on an instance level?
                // We might want the flexibility of per instance later (if other style/pose settings can change).
                oneObjectType.numInstance = numTotalInstance;
                oneObjectType.smallestUnusedInstanceIdx = 0;
                oneObjectType.instance = objs;
                curAvailableObj.push(oneObjectType);
                curIdx++;
            }
        }
    }
}

function json_obj_load_first_imgs() {
    // SA: Switch from draw_clipart to draw_canvas is fairly hacky.
    // Otherwise it wouldn't always render all of the objects
    // (until user menu action) since some hadn't loaded yet.
    // There could also be a bug with curInst. 
    
    // Load the clip art images
    var curInst;
    var i;
    for (i = 0; i < numObjTypeShow['human']; i++) {
//         curInst = curAvailableObj[i].smallestUnusedInstanceIdx;
        curInst = 0;
        curLoadAll[i] = 0; // set the variable to be zero
        curClipartImgsIdx = curAvailableObj[i].instance[curInst].poseID * 
                            curAvailableObj[i].instance[curInst].numExpression + 
                            curAvailableObj[i].instance[curInst].expressionID;
        curClipartImgs[i] = Array(curAvailableObj[i].instance[curInst].numPose * 
                                  curAvailableObj[i].instance[curInst].numExpression); // two dimensional array
        curClipartImgs[i][curClipartImgsIdx] = new Image();
        curClipartImgs[i][curClipartImgsIdx].src = 
            obj_img_filename(curAvailableObj[i].instance[curInst]);
            
        curPeopleExprImgs[i] = Array(curAvailableObj[i].instance[curInst].numExpression);
        curPeopleExprImgs[i][curAvailableObj[i].instance[curInst].expressionID] = new Image();
        curPeopleExprImgs[i][curAvailableObj[i].instance[curInst].expressionID].src = 
            expr_img_filename(curAvailableObj[i].instance[curInst]);
    }

    // now for the rest of the objects
    // SA: TODO Fix this so it doesn't assume order on human/animal/etc.
    for (i = numObjTypeShow['human']; i < numAvailableObjects; i++) {
//         curInst = curAvailableObj[i].smallestUnusedInstanceIdx;
        curInst = 0;
        curClipartImgs[i] = Array(curAvailableObj[i].instance[curInst].numPose);
        
        for (j = 0; j < curAvailableObj[i].instance[curInst].numPose; j++) {
            curClipartImgs[i][j] = new Image();
            curClipartImgs[i][j].src =
                obj_img_filename_pose(curAvailableObj[i].instance[curInst], j);
        }
    }
    
    // Update the canvas once the images are loaded
    for (i = 0; i < numObjTypeShow['human']; i++) {
        curInst = curAvailableObj[i].smallestUnusedInstanceIdx;
        curInst = 0;
        curClipartImgsIdx = curAvailableObj[i].instance[curInst].poseID*curAvailableObj[i].instance[curInst].numExpression + 
                            curAvailableObj[i].instance[curInst].expressionID;
        curClipartImgs[i][curClipartImgsIdx].onload = draw_canvas;
        curPeopleExprImgs[i][curAvailableObj[i].instance[curInst].expressionID].onload = draw_canvas;
    }

    for (i = numObjTypeShow['human']; i < numAvailableObjects; i++) {
        curInst = curAvailableObj[i].smallestUnusedInstanceIdx;
        curInst = 0;
        curClipartImgs[i][curAvailableObj[i].instance[curInst].poseID].onload = draw_canvas;
    }

   // then load all the images to be possibly displayed ?
    for (i = 0; i < numObjTypeShow['human']; i++) {
        curInst = curAvailableObj[i].smallestUnusedInstanceIdx;
        curInst = 0;
        var s;
        k = 0;
        for (j = 0; j < curAvailableObj[i].instance[curInst].numPose; j++) {   
            s = j * curAvailableObj[i].instance[curInst].numExpression;
            
            curClipartImgs[i][s] = new Image();
            curClipartImgs[i][s].src = 
                obj_img_filename_pose_expr(curAvailableObj[i].instance[curInst], j, k);
        }

        // also load the expression only images
        for (j = 0; j <  curAvailableObj[i].instance[0].numExpression; j++) {
            if (curPeopleExprImgs[i][j] != undefined) { // already loaded
                continue;
            }
            curPeopleExprImgs[i][j] = new Image();
            curPeopleExprImgs[i][j].src = 
                expr_img_filename_expr(curAvailableObj[i].instance[curInst], j);
        }

        curLoadAll[i] = 1; // set the variable to be true
    }
    // do not need for curPeopleExprImgs because they are displayed later

    // set onload
    for (i = 0; i < numObjTypeShow['human']; i++) {
        curInst = curAvailableObj[i].smallestUnusedInstanceIdx;
        curInst = 0;
        var s;
        k = 0;
        for (j = 0; j <  curAvailableObj[i].instance[curInst].numPose; j++) {
            if (curClipartImgs[i][s] != undefined) { // already loaded
                continue;
            }
            s = j * curAvailableObj[i].instance[curInst].numExpression;
            curClipartImgs[i][s].onload = draw_canvas;
        }
    
        // also load the expression only images
        for (j = 0; j <  curAvailableObj[i].instance[curInst].numExpression; j++) {
            if (curPeopleExprImgs[i][j] != undefined) { // already loaded
                continue;
            }
            curPeopleExprImgs[i][j].onload = draw_canvas;
        }
    }
}

function rand_obj_load_first_imgs() {
    
        for (i = 0; i < numAvailableObjects; i++) {
        // Assume paperdoll are the first objects: should fix
        if (i < numObjTypeShow['paperdoll']) {
            // Load paperdoll heads/expression
            curClipartImgs[i] = Array(curAvailableObj[i].instance[0].numExpression);
            curPaperdollExprImgs[i] = Array(curAvailableObj[i].instance[0].numExpression);
            for (j = 0; j < curAvailableObj[i].instance[0].numExpression; j++) {
                curClipartImgs[i][j] = new Image();
                curClipartImgs[i][j].src =
                    paperdoll_expr_img_filename_expr(curAvailableObj[i].instance[0], j);

                curPaperdollExprImgs[i][j] = new Image();
                curPaperdollExprImgs[i][j].src =
                    paperdoll_expr_img_filename_expr(curAvailableObj[i].instance[0], j);

            }

            // Load paperdoll part images
            curPaperdollPartImgs[i] = Array(curAvailableObj[i].instance[0].body.length);
            for (j = 0; j < curAvailableObj[i].instance[0].body.length; j++) {
                curPaperdollPartImgs[i][j] = new Image();
                curPaperdollPartImgs[i][j].src =
                    paperdoll_part_img_filename_expr(curAvailableObj[i].instance[0], curAvailableObj[i].instance[0].body[j].part);

            }

            // Randomly init part rotations
            for (k = 0; k < curAvailableObj[i].numInstance;k++) {
                for (j = 0; j < curAvailableObj[i].instance[0].body.length; j++) {
                    curAvailableObj[i].instance[k].paperdollGRotation[j] = (2.0*Math.random() - 1.0) * 0.5;
                    curAvailableObj[i].instance[k].paperdollLRotation[j] = (2.0 * Math.random() - 1.0) * 0.5;
                    curAvailableObj[i].instance[k].paperdollX[j] = 0;
                    curAvailableObj[i].instance[k].paperdollY[j] = 0;

                    // Don't rotate the head
                    if (curAvailableObj[i].instance[k].body[j].part == 'Head') {
                        curAvailableObj[i].instance[k].paperdollGRotation[j] = 0;
                        curAvailableObj[i].instance[k].paperdollLRotation[j] = 0;
                    }

                    // Don't rotate the torso
                    if (curAvailableObj[i].instance[k].body[j].part == 'Torso') {
                        curAvailableObj[i].instance[k].paperdollGRotation[j] = 0;
                        curAvailableObj[i].instance[k].paperdollLRotation[j] = 0;
                    }
                }
            }
        } else {
            curClipartImgs[i] = Array(curAvailableObj[i].instance[0].numPose);
            for (j = 0; j < curAvailableObj[i].instance[0].numPose; j++) {
                curClipartImgs[i][j] = new Image();
                curClipartImgs[i][j].src =
                    obj_img_filename_pose(curAvailableObj[i].instance[0], j);
            }

            curClipartImgs[i][curAvailableObj[i].instance[0].poseID].onload = draw_clipart;
        }
    }
    
    /*
    // Load the clip art images
    for (i = 0; i < numObjTypeShow['human']; i++) {
        curLoadAll[i] = 0; // set the variable to be zero
        curClipartImgsIdx = curAvailableObj[i].instance[0].poseID * 
                            curAvailableObj[i].instance[0].numExpression + 
                            curAvailableObj[i].instance[0].expressionID;
        curClipartImgs[i] = Array(curAvailableObj[i].instance[0].numPose * 
                            curAvailableObj[i].instance[0].numExpression); // two dimensional array
        curClipartImgs[i][curClipartImgsIdx] = new Image();
        curClipartImgs[i][curClipartImgsIdx].src = 
            obj_img_filename(curAvailableObj[i].instance[0]);

        curPeopleExprImgs[i] = Array(curAvailableObj[i].instance[0].numExpression);
        curPeopleExprImgs[i][curAvailableObj[i].instance[0].expressionID] = new Image();
        curPeopleExprImgs[i][curAvailableObj[i].instance[0].expressionID].src = 
            expr_img_filename(curAvailableObj[i].instance[0]);
    }

    // now for the rest of the objects
    // SA: TODO Fix this so it doesn't assume order on human/animal/etc.
    for (i = numObjTypeShow['human']; i < numAvailableObjects; i++) {
        curClipartImgs[i] = Array(curAvailableObj[i].instance[0].numPose);
        for (j = 0; j < curAvailableObj[i].instance[0].numPose; j++) {
            curClipartImgs[i][j] = new Image();
            curClipartImgs[i][j].src = 
                obj_img_filename_pose(curAvailableObj[i].instance[0], j);
        }
    }

    // Update the canvas once the images are loaded
    for (i = 0; i < numObjTypeShow['human']; i++) {
        curClipartImgsIdx = curAvailableObj[i].instance[0].poseID * 
                            curAvailableObj[i].instance[0].numExpression + 
                            curAvailableObj[i].instance[0].expressionID;
        curClipartImgs[i][curClipartImgsIdx].onload = draw_clipart;
        curPeopleExprImgs[i][curAvailableObj[i].instance[0].expressionID].onload = draw_clipart;
    }

    for (i = numObjTypeShow['human']; i < numAvailableObjects; i++) {
        curClipartImgs[i][curAvailableObj[i].instance[0].poseID].onload = draw_clipart;
    }

    // then load all the images to be possibly displayed ?
    for (i = 0; i < numObjTypeShow['human']; i++) {
        var s;
        k = 0;
        for (j = 0; j < curAvailableObj[i].instance[0].numPose; j++) {   
            s = j * curAvailableObj[i].instance[0].numExpression;
            
            curClipartImgs[i][s] = new Image(); 
            curClipartImgs[i][s].src = 
                obj_img_filename_pose_expr(curAvailableObj[i].instance[0], j, k);
        }

        // also load the expression only images
        for (j = 0; j <  curAvailableObj[i].instance[0].numExpression; j++) {
            if (curPeopleExprImgs[i][j] != undefined) { // already loaded
                continue;
            }
            curPeopleExprImgs[i][j] = new Image();
            curPeopleExprImgs[i][j].src = 
                expr_img_filename_expr(curAvailableObj[i].instance[0], j);
        }

        curLoadAll[i] = 1; // set the variable to be true
    }

    // do not need for curPeopleExprImgs because they are displayed later

    // set onload
    for (i = 0; i < numObjTypeShow['human']; i++) {
        var s;
        k = 0;
        for (j = 0; j <  curAvailableObj[i].instance[0].numPose; j++) {
            if (curClipartImgs[i][s] != undefined) { // already loaded
                continue;
            }
            s = j * curAvailableObj[i].instance[0].numExpression;
            curClipartImgs[i][s].onload = draw_clipart;
        }
    
        // also load the expression only images
        for (j = 0; j <  curAvailableObj[i].instance[0].numExpression; j++) {
            if (curPeopleExprImgs[i][j] != undefined) { // already loaded
                continue;
            }
            curPeopleExprImgs[i][j].onload = draw_clipart;
        }
    }
    */
}


function expr_img_filename(obj) {
    return expr_img_filename_expr(obj, null);
}

function expr_img_filename_expr(obj, exprID) {
    
    var filename;
    
    if (exprID == null) {
        exprID = obj['expressionID'];
    }
    
    if (obj['type'] == 'human') {
        humanFolder = objectData['human']['baseDirectory'];
        name = obj['name'] + 
               zero_pad((exprID+1), imgPadNum) +
               '.' + CLIPART_IMG_FORMAT; 
            
        filename = baseURLInterface + 
                    humanFolder + '/' + name;
    } else {
        filename = null;
    }
    
    return filename;
}

function paperdoll_expr_img_filename_expr(obj, exprID) {

    var filename;

    if (exprID == null) {
        exprID = obj['expressionID'];
    }

    if (obj['type'] == 'paperdoll') {
        humanFolder = objectData['paperdoll']['baseDirectory'];
        name = obj['name'] +
               zero_pad((exprID + 1), imgPadNum) +
               '.' + CLIPART_IMG_FORMAT;

        filename = baseURLInterface +
                    humanFolder + '/' + name;
    } else {
        filename = null;
    }

    return filename;
}

function paperdoll_part_img_filename_expr(obj, partName) {

    var filename;

    if (obj['type'] == 'paperdoll') {
        humanFolder = objectData['paperdoll']['baseDirectory'];
        name = obj['name'] + '/' + 
               partName +
               '.' + CLIPART_IMG_FORMAT;

        filename = baseURLInterface +
                    humanFolder + '/' + name;
    } else {
        filename = null;
    }

    return filename;
}

// SA: TODO Good way of doing this in JS?
// Probably method on self on something...
function obj_img_filename(obj) {
    return obj_img_filename_general(obj, null, null, null);
}

function obj_img_filename_pose(obj, poseID) {
    return obj_img_filename_general(obj, poseID, null, null);
} 

function obj_img_filename_pose_expr(obj, poseID, exprID) {
    return obj_img_filename_general(obj, poseID, exprID, null);
}

// You can ask for a specific style, pose, or expression ID image
// instead of the one that the object currently has.
function obj_img_filename_general(obj, poseID, exprID, styleID) {
    
    if (poseID == null) {
        poseID = obj['poseID'];
    }
        
    if (obj['type'] == 'human') {
        if (exprID == null) {
            exprID = obj['expressionID'];
        }
        if (styleID == null) {
            styleID = obj['styleID'];
        }
        
        humanFolder = objectData['human']['baseDirectory'];
        styleFolder = obj['name'] + zero_pad((styleID+1), imgPadNum);
        
        name = zero_pad((poseID+1), imgPadNum) +
               zero_pad((exprID+1), imgPadNum) +
               '.' + CLIPART_IMG_FORMAT; 
        filename = baseURLInterface + 
                   humanFolder + '/' + styleFolder + '/' + name;
    } else if (obj['type'] == 'animal') {
        animalFolder = objectData['animal']['baseDirectory'];
        name = obj['name'] + zero_pad((poseID+1), imgPadNum) +
               '.' + CLIPART_IMG_FORMAT; 
        filename = baseURLInterface + 
                   animalFolder + '/' + name;
    } else if (obj['type'] == 'largeObject' || obj['type'] == 'smallObject') {
        sceneFolder = sceneConfigData['baseDirectory'][obj['baseDir']];
        name = obj['name'] + zero_pad((poseID+1), imgPadNum) +
               '.' + CLIPART_IMG_FORMAT; 
        filename = baseURLInterface + 
                   sceneFolder + '/' + name;
    } else {
        filename = null
    }

    return filename
}

// Store current work and go to previous task (if applicable)
function prev() {

    // Store current scene before going to previous scene
    sceneData[curScene] = curSceneData;
    
    if (curScene > 0) {
        curScene -= 1;
    }
    // SA: TODO Is necessary?
    curSceneData = sceneData[curScene];
    
    log_user_data("prev"); // SA: TODO Add?
    reset_scene();
    draw_canvas();   

}

// grab the results and go to next task/submit
function next() {

    // Make sure scene meets requirements
    if (!validate_scene()) {
        return -1;
    }
    
    sceneData[curScene] = curSceneData;
    curScene++;

    if (curScene == numScene) {
        curScene = numScene-1; // Cap to not create new scene
        $("#dialog-confirm").dialog('open');
        // Put cursor in comment box for convenience :)
        $("#hit_comment").each( function(idx) { 
            if ( idx == 0 ) {
                $(this).focus();
            }
        });
    } else {
        // SA: TODO Is necessary?
        curSceneData = sceneData[curScene];
        log_user_data("next"); // SA: TODO Add?
        reset_scene();
        draw_canvas();
    }
}


function num_differences_instance(originalInst, currentInst) {
    var isDiff = 0;
    
    // Check if certain properties are different
    if (originalInst.present != currentInst.present) {
        console.log("Presence changed");
        isDiff += 1;
    }
    
    if (originalInst.flip != currentInst.flip) {
        console.log("Flip changed");
        isDiff += 1;
    }
    
    if (originalInst.z != currentInst.z) {
        console.log("Z changed");
        isDiff += 1;
    }
    
    if (originalInst.type == 'human') {
        if (originalInst.expressionID != currentInst.expressionID) {
            console.log("Expression changed");
            isDiff += 1;
        }
    }
    
    if (originalInst.poseID != currentInst.poseID) {
        console.log("poseID changed");
        isDiff += 1;
    }

//     // depth0 currently can't change
//     if (originalInst.depth0 != currentInst.depth0) {
//         isDiff += 1;
//         return isDiff;
//     }
    
    // SA: I don't think depth1 changing is very reliable
    // as an indicator of change and might be too exploitable.
    // I'm not sure which situations changing it would
    // significantly change the scene.
//     if (originalInst.depth1 != currentInst.depth1) {
//         console.log("Depth1 changed");
//         isDiff += 1;
//         return isDiff;
//     }
    
    // If not deformable, check x and y positions
    if (originalInst.deformable == false) {
        
        var distChange = euclidean_dist(originalInst.x, currentInst.x,
                                        originalInst.y, currentInst.y);
        
        if (distChange > minPosChange) {
            console.log("Position changed by " + distChange);
            isDiff += 1;
        }
        
    } else { // TODO Deformable, so do different comparision

    }

//     debugger;
    return isDiff;
}

function euclidean_dist(x1, x2, y1, y2) {
    return dist = Math.sqrt(Math.pow((x2 - x1), 2) + 
                            Math.pow((y2 - y1), 2));
}

function num_different_object(originalObj, currentObj) {
    var numObjChanges = 0;
    
    for (var i = 0; i < originalObj.instance.length; i++) {
        numObjChanges += num_differences_instance(originalObj.instance[i],
                                            currentObj.instance[i]);
    }
    
    return numObjChanges;
}

function is_different_from_init_scene() {
    var isDiff = false;
    var numChanges = 0;
    
    var curSceneFile = sceneJSONFile[curScene];
    var origAvailObj = sceneJSONData[curSceneFile].scene.availableObject;
    for (var i = 0; i < origAvailObj.length; i++) {
        numChanges += num_different_object(origAvailObj[i], 
                                             curAvailableObj[i]);
    }
    
    if (numChanges >= minSceneChange) {
        isDiff = true;
    }
//     debugger;
    return isDiff;
}

function validate_scene() {
    
    var numAvailableObjectsUsed;
    var validScene = true;
    
    if (!restrictInput) {
        return validScene;
    }
    
    if (loadSceneJSON) {
        if (!is_different_from_init_scene()) {
            render_dialog("loadedScene");
            validScene = false;
            return validScene;
        }
    }

//     ////////////////////// NO REQUIREMENT FOR CATEGORY //////////////////////
//     for (i = 0; i < objectTypeOrder.length; i++) {
//         numAvailableObjectsUsed = 0;
//         for (j = 0; j < numObjTypeShow[objectTypeOrder[i]]; j++) {
//                 curObjIdx = clipartIdxStart[i] + j;
//             for (m = 0; m < curAvailableObj[curObjIdx].numInstance; m++) {
//                 if (curAvailableObj[curObjIdx].instance[m].present == true) {
//                     numAvailableObjectsUsed++;
//                     break;
//                 }
//             }
//             if (numAvailableObjectsUsed > minPerCatType) {
//                 break;
//             }
//         }
//         if (numAvailableObjectsUsed < minPerCatType) {
//             render_dialog("minType");
//             validScene = false;
//             return validScene;
//         }
//     }

    numAvailableObjectsUsed = 0;
    for (i = 0; i < numObjTypeShow['human']; i++) {
        for (m = 0; m < curAvailableObj[i].numInstance; m++) {
            if (curAvailableObj[i].instance[m].present) {
                numAvailableObjectsUsed++;
                if (curAvailableObj[i].instance[m].expressionID == 0) {
                    render_dialog("expression");
                    validScene = false;
                    return validScene;
                }
            }
        }
    }
    
    for (i = numObjTypeShow['human']; i < numAvailableObjects; i++) {
        for (m = 0; m < curAvailableObj[i].numInstance; m++) {
            if (curAvailableObj[i].instance[m].present) {
                numAvailableObjectsUsed++;
            }
        }
    }

    if (numAvailableObjectsUsed < minNumObj) {
        render_dialog("minClipart");
        validScene = false;
        return validScene;
    }
    
    if (numAvailableObjectsUsed > maxNumObj) {
        render_dialog("maxClipart");
        validScene = false;
        return validScene;
    }        
    
    return validScene;
}

function log_user_data(msg) {
    
    if ( curUserSequence != undefined ) {
        // TODO Safety here in case of things not being loaded yet?
        curUserSequence.selectedIdx.push(selectedIdx);
        curUserSequence.selectedIns.push(selectedIns);
        // SA: TODO Verify that this is correct/reasonable
        if ( selectedIdx != notUsed && selectedIns != notUsed) {
            curUserSequence.poseID.push(curAvailableObj[selectedIdx].instance[selectedIns].poseID);
            curUserSequence.expressionID.push(curAvailableObj[selectedIdx].instance[selectedIns].expressionID);
            curUserSequence.present.push(curAvailableObj[selectedIdx].instance[selectedIns].present);
            curUserSequence.x.push(curAvailableObj[selectedIdx].instance[selectedIns].x);
            curUserSequence.y.push(curAvailableObj[selectedIdx].instance[selectedIns].y);
            curUserSequence.z.push(curAvailableObj[selectedIdx].instance[selectedIns].z);
            curUserSequence.flip.push(curAvailableObj[selectedIdx].instance[selectedIns].flip);
            curUserSequence.depth1.push(curAvailableObj[selectedIdx].instance[selectedIns].depth1);
        } else {
            curUserSequence.poseID.push(notUsed);
            curUserSequence.expressionID.push(notUsed);
            curUserSequence.present.push(notUsed);
            curUserSequence.x.push(notUsed);
            curUserSequence.y.push(notUsed);
            curUserSequence.z.push(notUsed);
            curUserSequence.flip.push(notUsed);
            curUserSequence.depth1.push(notUsed);
        }
        if (msg != undefined) {
            console.log(msg + ": " + curUserSequence.flip.length);
        }
    }
}

// ================================================================
// Function to submit form to the server
// The form is submitted to AMT after server successfully process the submission
// The HIT is completed after AMT server receives the submission
// ================================================================
function submit_form() {

    var duration = ($.now()-init_time)/1000;
    duration = duration.toString();
    var comment;
    $('#dialog-confirm textarea').each( function() { comment = this.value; });
    
    // process answers
    // pack user's response in a dictionary structure and send to the server in JSON format
    var answers = [];
    for (i = 0; i < sceneData.length; i++) {
        answers.push( {
                // Don't need the image files
                // SA: TODO Add new scene data here?
                availableObject: sceneData[i].availableObject,
                userSequence: sceneData[i].userSequence,
                sceneType: sceneData[i].sceneType,
                initHistory: sceneData[i].initHistory
            }
        );
    }
    var ans = JSON.stringify(answers);

    // Append any additional data you want to send back
    $("input[name='hitDuration']").val(duration);
    $("input[name='hitResult']").val(ans);
    $("input[name='hitComment']").val(comment);

    // set the resp to send back to the server here
    // the values to send to MTurk has already defined inside #mturk_form
    // if you don't need to bother to set value here
    var resp =
    {
    // TODO: set the data to be submitted back to server
    };
    
    // post ajax request to server
    // if there's no backend to process the request, form can be directly submitted to MTurk
    
    debugger;
    // If running local, don't bother submitting
    if ( submitAction ) {
        $.ajax({
                type: "POST",
                // "TODO: set the url of server to process the data",
                url: "",
                data: {'resp': JSON.stringify(resp)}
            }).done(function(data) {
                $('#mturk_form').submit();
            });
    }
}

//
//
var jsonIdx = -1; // Start with -1 because of config

function load_config_json() {
    $.getJSON(dataURL+sceneConfigFile).done( function(data) { 
        load_object_config(data); 
    }).fail( function() { 
        console.log("Loading JSON " + sceneConfigFile + " failed.");  
    });
}

function load_object_config(data) {
    
    var curFile;
    
    if (jsonIdx == -1) {
        sceneConfigData = data;
        objectData = {};
        jsonIdx += 1;
    } else {
        objectData[data.objectType] = data;
        jsonIdx += 1;
    }
    
    if (jsonIdx < sceneConfigData.clipartObjJSONFile.length) {
        curFile = sceneConfigData.clipartObjJSONFile[jsonIdx].file;
        
        $.getJSON(dataURL+curFile).done( function(data) { 
            load_object_config(data); 
        }).fail( function() { 
            console.log("Loading JSON " + curFile + " failed.");  
        });
    } else {
        load_obj_category_data();
        reset_scene();
    }
}

function load_obj_category_data() {

    // Make sure the sceneTypeList is all valid scene types
    if (sceneTypeList.length > 0 && sceneConfigData != undefined) {
        
        var validSceneTypeList = [];
        sceneTypeList.forEach( function(d) {
            if (sceneConfigData.hasOwnProperty(d)) {
                validSceneTypeList.push(d);
            }
        })
        sceneTypeList = validSceneTypeList;
        numScene = sceneTypeList.length;
        
        if (numScene == 0) {
            var sceneTypeListIdx = get_random_int(0, AVAIL_SCENE_TYPES.length);
            sceneTypeList = [AVAIL_SCENE_TYPES[sceneTypeListIdx]]
            numScene = sceneTypeList.length;
            console.log('Invalid scene type entered. ' +
                        'Defaulting to one scene of ' +
                        sceneTypeList[0] + '.');
        }
        
        update_instructions();
    }
    
    if (sceneTypeList.length > 0 && sceneConfigData != undefined) {
        var numSelObj;
        
        curSceneType = sceneTypeList[curScene];
        curSceneTypeBase = extract_scene_type_base(curSceneType)
        objectTypeOrder = sceneConfigData[curSceneType].objectTypeOrder;
        numObjTypeShow = sceneConfigData[curSceneType].numObjTypeShow;
        
        // In case scene config is bad, we overwrite values
        // that suggest putting more objects than available for
        // that category and prevents an infinite loop
        
        for (var objectType in objectData) {
            if (objectData.hasOwnProperty(objectType)) {
                sumPoses = 0;
                curObjectType = objectData[objectType];
                var validIdxs = [];
                for ( var k = 0; k < curObjectType.type.length; k++ ) {
                    for ( var m = 0; m < curObjectType.type[k].availableScene.length; m++ ) {
                        sumPoses += curObjectType.type[k].numPose;
                        if ( curObjectType.type[k].availableScene[m].scene == curSceneTypeBase ) {
                            validIdxs.push([k, m])
                        }
                    }
                }
                var numValidTypes = validIdxs.length;
                numSelObj = numObjTypeShow[curObjectType.objectType];
                if (numSelObj > numValidTypes) {
                    console.log(curSceneType + " asked for too many " + 
                                curObjectType.objectType + 
                                " objects. Overwriting with the max.")
                }
                numSelObj = Math.min(numSelObj, numValidTypes);
                numObjTypeShow[curObjectType.objectType] = numSelObj;
            }
        }
        
        // Need to initialize this otherwise interface won't load properly
        numAvailableObjects = 0;
        objectTypeToIdx = {};
        for (var i = 0; i < objectTypeOrder.length; i++) {
            numAvailableObjects += numObjTypeShow[objectTypeOrder[i]];
            objectTypeToIdx[objectTypeOrder[i]] = i;
        }
        
        selectedTab = sceneConfigData[curSceneType].startTab;
        selectedTabIdx = objectTypeToIdx[selectedTab];
        tabPage = 0;
        
        // SA: TODO Currently objectTypeOrder.length is assumed
        // to be the number of tabs, which is hardcoded to 4.
        NUM_TABS = objectTypeOrder.length;
    } else {
        numAvailableObjects = 0;
        selectedTab = 'human';
        selectedTabIdx = 0;
        tabPage = 0;
        NUM_TABS = 4;
    }
}

// ===========================================================
// Functions to render the abstract scenes
// ===========================================================
// draw canvas
function draw_canvas() {
    
    if (loadedObjectsAndBG == true) {
        CANVAS_WIDTH = bgImg.width;
        CANVAS_HEIGHT = bgImg.height;
    }
    SCALE_ROW = CANVAS_ROW + CANVAS_HEIGHT + 1.5*CLIPART_BUFFER;
    SCALE_COL = CANVAS_COL + 340 + CLIPART_BUFFER;
    FLIP_ROW = SCALE_ROW - 8;
    FLIP_COL = SCALE_COL + 200;
    ATTR_ROW = SCALE_ROW + 38 + CLIPART_BUFFER;
    ATTR_COL = CANVAS_COL;
    ATTR_WIDTH = CANVAS_WIDTH;
    ATTR_HEIGHT = CLIPART_SKIP + 2 * CLIPART_BUFFER;

    ATTR_TYPE_WIDTH = 100;
    ATTR_TYPE_HEIGHT = 30;
    ATTR_TYPE_COL = ATTR_COL;
    ATTR_TYPE_ROW = ATTR_ROW - ATTR_TYPE_HEIGHT;


    CLIPART_COL = CANVAS_COL + CANVAS_WIDTH + CLIPART_BUFFER;
    CLIPART_ROW = CANVAS_ROW;
    CLIPART_WIDTH = CLIPART_SKIP * NUM_CLIPART_HORZ + 2 * CLIPART_BUFFER;
    TAB_WIDTH = CLIPART_WIDTH / 4;
    TAB_HEIGHT = 60;
    CLIPART_HEIGHT = ATTR_ROW + ATTR_HEIGHT - (CLIPART_ROW + TAB_HEIGHT);
    
    //draw the image
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    draw_scene();
    draw_clipart();
    draw_buttons();
}

function draw_paper_doll(objIdx, instIdx) {
    var paperdoll = curAvailableObj[objIdx].instance[instIdx];
    var numBodyParts = paperdoll.body.length;
    var scale = paperdoll.globalScale * curZScale[paperdoll.z];

    for (partIdx = 0; partIdx < numBodyParts; partIdx++) {
    //for (partIdx = 0; partIdx < 1; partIdx++) {
        var parent = paperdoll.body[partIdx].parent;
        var parentIdx = paperdoll.partIdxList[parent];

        var w = curPaperdollPartImgs[objIdx][partIdx].width;
        var h = curPaperdollPartImgs[objIdx][partIdx].height;

        paperdoll.paperdollX[partIdx] = paperdoll.x / scale;
        paperdoll.paperdollY[partIdx] = paperdoll.y / scale;

        if (parentIdx >= 0) {
            var wp = curPaperdollPartImgs[objIdx][parentIdx].width;
            var hp = curPaperdollPartImgs[objIdx][parentIdx].height;
            var prevR = paperdoll.paperdollGRotation[parentIdx];
            if (paperdoll.flip == 1) {
                var rotMatrix = [];
                rotMatrix.push(Math.cos(prevR));
                rotMatrix.push(-Math.sin(prevR));
                rotMatrix.push(Math.sin(prevR));
                rotMatrix.push(Math.cos(prevR));

                var x = (wp - paperdoll.body[partIdx].parentX) - (wp - paperdoll.body[parentIdx].childX);
                var y = paperdoll.body[partIdx].parentY - paperdoll.body[parentIdx].childY;
                paperdoll.paperdollX[partIdx] = rotMatrix[0] * x + rotMatrix[1] * y + paperdoll.paperdollX[parentIdx];
                paperdoll.paperdollY[partIdx] = rotMatrix[2] * x + rotMatrix[3] * y + paperdoll.paperdollY[parentIdx];
                paperdoll.paperdollGRotation[partIdx] = prevR - paperdoll.paperdollLRotation[partIdx];
            } else {
                var rotMatrix = [];
                rotMatrix.push(Math.cos(prevR));
                rotMatrix.push(-Math.sin(prevR));
                rotMatrix.push(Math.sin(prevR));
                rotMatrix.push(Math.cos(prevR));

                var x = paperdoll.body[partIdx].parentX - paperdoll.body[parentIdx].childX;
                var y = paperdoll.body[partIdx].parentY - paperdoll.body[parentIdx].childY;
                paperdoll.paperdollX[partIdx] = rotMatrix[0] * x + rotMatrix[1] * y + paperdoll.paperdollX[parentIdx];
                paperdoll.paperdollY[partIdx] = rotMatrix[2] * x + rotMatrix[3] * y + paperdoll.paperdollY[parentIdx];
                paperdoll.paperdollGRotation[partIdx] = prevR + paperdoll.paperdollLRotation[partIdx];
            }
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (paperdoll.flip == 1) {
            ctx.setTransform(-1, 0, 0, 1, 0, 0);

            ctx.translate(-CANVAS_COL, CANVAS_ROW);
            ctx.scale(scale, scale);
            ctx.translate(-paperdoll.paperdollX[partIdx], paperdoll.paperdollY[partIdx]);
            ctx.rotate(-paperdoll.paperdollGRotation[partIdx]);
            ctx.translate(-paperdoll.body[partIdx].childX, -paperdoll.body[partIdx].childY);
        } else {
            ctx.translate(CANVAS_COL, CANVAS_ROW);
            ctx.scale(scale, scale);
            ctx.translate(paperdoll.paperdollX[partIdx], paperdoll.paperdollY[partIdx]);
            ctx.rotate(paperdoll.paperdollGRotation[partIdx]);
            ctx.translate(-paperdoll.body[partIdx].childX, -paperdoll.body[partIdx].childY);
        }

        if (paperdoll.body[partIdx].part == 'Head') {
            w = curPaperdollExprImgs[objIdx][0].width;
            h = curPaperdollExprImgs[objIdx][0].height;
            ctx.drawImage(curPaperdollExprImgs[objIdx][paperdoll.poseID], 0, 0, w, h, 0, 0, w, h);
        } else
            ctx.drawImage(curPaperdollPartImgs[objIdx][partIdx], 0, 0, w, h, 0, 0, w, h);
        
        if(objIdx == selectedIdx && instIdx == selectedIns && selectPaperdollPose) {
            if (paperdoll.body[partIdx].handleRadius > 0) {
                ctx.lineWidth = 4;
                ctx.fillStyle = "rgba(50, 255, 50, 0.5)";;
                ctx.beginPath();
                ctx.arc(w/2, h/2, paperdoll.body[partIdx].handleRadius, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.fill();
            }
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}

function draw_scene() {
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas_fix.width, canvas_fix.height);

    if (bgImg != undefined) {
        ctx.drawImage(bgImg, CANVAS_COL, CANVAS_ROW, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    if (loadedObjectsAndBG == true) {
        // Make sure we get the depth ordering correct (render the objects using their depth order)
        for (k = numDepth0 - 1; k >= 0; k--) {
            if (curDepth0Used[k] <= 0) { // not used, just to accelerate the process
                continue;
            }
            for (j = numZSize - 1; j >= 0; j--) {
                // for people, choose both the expression and the pose
                for (l = numDepth1 - 1; l >= 0; l--) {
                    if (curDepth1Used[l] <= 0) { // not used, just to accelerate the process
                        continue;
                    }
                    
                    // SA: TODO Update to be compatible with both
                    for (i = 0; i < numObjTypeShow['paperdoll']; i++) {
                        if (curAvailableObj[i].instance[0].depth0 == k) {
                            for (m = 0; m < curAvailableObj[i].numInstance; m++) {
                                if (curAvailableObj[i].instance[m].present == true && 
                                    curAvailableObj[i].instance[m].z == j && 
                                    curAvailableObj[i].instance[m].depth1 == l) {
                                    
                                    draw_paper_doll(i, m);
                                    /*
                                    var scale = curZScale[curAvailableObj[i].instance[m].z]
                                    var indexP = curAvailableObj[i].instance[m].poseID*curAvailableObj[i].instance[m].numExpression +
                                                curAvailableObj[i].instance[m].expressionID;
                                                
                                    if (curClipartImgs[i][indexP] == undefined) {
                                        curClipartImgs[i][indexP] = new Image();
                                        curClipartImgs[i][indexP].src = 
                                            obj_img_filename_pose_expr(curAvailableObj[i].instance[m]);
                                        curClipartImgs[i][indexP].onload = draw_canvas;
                                        continue;
                                    }
                                    
                                    var w = curClipartImgs[i][indexP].width;
                                    var h = curClipartImgs[i][indexP].height;

                                    var rowOffset = -h / 2;
                                    var colOffset = -w / 2;
                                    rowOffset *= scale;
                                    colOffset *= scale;

                                    if (curAvailableObj[i].instance[m].flip == 0) {
                                        ctx.drawImage(curClipartImgs[i][indexP], 0, 0, w, h, 
                                                    curAvailableObj[i].instance[m].x + colOffset + CANVAS_COL, 
                                                    curAvailableObj[i].instance[m].y + rowOffset + CANVAS_ROW, 
                                                    w * scale, h * scale);
                                    } else if (curAvailableObj[i].instance[m].flip == 1) {
                                        ctx.setTransform(-1, 0, 0, 1, 0, 0);
                                        ctx.drawImage(curClipartImgs[i][indexP], 0, 0, w, h, 
                                                    -curAvailableObj[i].instance[m].x + colOffset - CANVAS_COL, 
                                                    curAvailableObj[i].instance[m].y + rowOffset + CANVAS_ROW, 
                                                    w * scale, h * scale);
                                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                                    }
                                    */
                                }
                            }
                        }
                    }

                    // remain the same for objects
                    for (i = numObjTypeShow['paperdoll']; i < numAvailableObjects; i++) {
                        if (curAvailableObj[i].instance[0].depth0 == k) {
                            for (m = 0; m < curAvailableObj[i].numInstance; m++) {
                                if (curAvailableObj[i].instance[m].present == true && 
                                    curAvailableObj[i].instance[m].z == j && 
                                    curAvailableObj[i].instance[m].depth1 == l) {
                                    
                                    var scale = curZScale[curAvailableObj[i].instance[m].z];

                                    var w = curClipartImgs[i][curAvailableObj[i].instance[m].poseID].width;
                                    var h = curClipartImgs[i][curAvailableObj[i].instance[m].poseID].height;

                                    var rowOffset = -h / 2;
                                    var colOffset = -w / 2;
                                    rowOffset *= scale;
                                    colOffset *= scale;

                                    if (curAvailableObj[i].instance[m].flip == 0) {
                                        ctx.drawImage(curClipartImgs[i][curAvailableObj[i].instance[m].poseID], 
                                                      0, 0, w, h, 
                                                      curAvailableObj[i].instance[m].x + colOffset + CANVAS_COL, 
                                                      curAvailableObj[i].instance[m].y + rowOffset + CANVAS_ROW, 
                                                      w * scale, h * scale);
                                    } else if (curAvailableObj[i].instance[m].flip == 1) {
                                        ctx.setTransform(-1, 0, 0, 1, 0, 0);
                                        ctx.drawImage(curClipartImgs[i][curAvailableObj[i].instance[m].poseID], 
                                                      0, 0, w, h, 
                                                      -curAvailableObj[i].instance[m].x + colOffset - CANVAS_COL, 
                                                      curAvailableObj[i].instance[m].y + rowOffset + CANVAS_ROW, 
                                                      w * scale, h * scale);
                                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, CANVAS_COL, canvas_fix.height);
    ctx.fillRect(0, 0, CANVAS_COL + CANVAS_WIDTH, CANVAS_ROW);
    ctx.fillRect(CANVAS_COL + CANVAS_WIDTH, 0, CLIPART_COL, canvas_fix.height);
    ctx.fillRect(0, CANVAS_ROW + CANVAS_HEIGHT, CLIPART_COL, canvas_fix.height);

    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 10, canvas_fix.width, 5);

}

function draw_tab(x, y, w, h, rad) {
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x, y + h);           // Create a starting point
    ctx.lineTo(x, y + rad);          // Create a horizontal line
    ctx.arcTo(x, y, x + rad, y, rad); // Create an arc
    ctx.lineTo(x + w - rad, y);         // Continue with vertical line
    ctx.arcTo(x + w, y, x + w, y + rad, rad); // Create an arc
    ctx.lineTo(x + w, y + h);         // Continue with vertical line
    ctx.fill();
    ctx.stroke();

}

function draw_clipart() {
    
    var w = TAB_WIDTH * 4;
    var h = TAB_HEIGHT;

    // Draw the clipart tabs
    ctx.fillStyle = "#B4B4B4";
    draw_tab(CLIPART_COL, CLIPART_ROW, TAB_WIDTH, TAB_HEIGHT, 8);
    draw_tab(CLIPART_COL + TAB_WIDTH, CLIPART_ROW, TAB_WIDTH, TAB_HEIGHT, 8);
    draw_tab(CLIPART_COL + 2 * TAB_WIDTH, CLIPART_ROW, TAB_WIDTH, TAB_HEIGHT, 8);
    draw_tab(CLIPART_COL + 3 * TAB_WIDTH, CLIPART_ROW, TAB_WIDTH, TAB_HEIGHT, 8);

    ctx.lineWidth = 2;
    ctx.fillStyle = "#D9D9D9";
    ctx.fillRect(CLIPART_COL, CLIPART_ROW + TAB_HEIGHT, CLIPART_WIDTH, CLIPART_HEIGHT);
    ctx.fillStyle = "#494646";
    ctx.strokeRect(CLIPART_COL, CLIPART_ROW + TAB_HEIGHT + 1, CLIPART_WIDTH, CLIPART_HEIGHT - 1);

    ctx.fillStyle = "#D9D9D9";
    ctx.fillRect(ATTR_COL, ATTR_ROW, ATTR_WIDTH, ATTR_HEIGHT);
    ctx.lineWidth = 2;
    ctx.fillStyle = "#494646";
    ctx.strokeRect(ATTR_COL, ATTR_ROW, ATTR_WIDTH, ATTR_HEIGHT);

    // Draw the selected tab
    ctx.fillStyle = "#D9D9D9";
    draw_tab(CLIPART_COL + selectedTabIdx * TAB_WIDTH, CLIPART_ROW, TAB_WIDTH, TAB_HEIGHT + 2, 8);

    // Add the tab labels
    ctx.font = "18px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    
    // SA: TODO Make this dependent on objectTypeOrder
    ctx.fillText("People", CLIPART_COL + TAB_WIDTH / 2, CLIPART_ROW + TAB_HEIGHT / 2 + 8);
    ctx.fillText("Animals", CLIPART_COL + 3 * TAB_WIDTH / 2, CLIPART_ROW + TAB_HEIGHT / 2 + 8);
    ctx.fillText("Large", CLIPART_COL + 5 * TAB_WIDTH / 2, CLIPART_ROW + TAB_HEIGHT / 2 - 3);
    ctx.fillText("objects", CLIPART_COL + 5 * TAB_WIDTH / 2, CLIPART_ROW + TAB_HEIGHT / 2 + 17);
    ctx.fillText("Small", CLIPART_COL + 7 * TAB_WIDTH / 2, CLIPART_ROW + TAB_HEIGHT / 2  - 3);
    ctx.fillText("objects", CLIPART_COL + 7 * TAB_WIDTH / 2, CLIPART_ROW + TAB_HEIGHT / 2 + 17);

    if (loadedObjectsAndBG == true) {

        curType = objectData[selectedTab].objectType;
        curSelectedType = curType;

        if (selectedIdx >= 0) {
            curSelectedType = curAvailableObj[selectedIdx].instance[selectedIns].type;
        }

        ctx.fillStyle = "#000000";
        ctx.font = "18px Arial";
        ctx.lineWidth = 0;
        ctx.textAlign = "center";
        var attrLabel = "Type";
        
        if (curSelectedType == "animal") {
            attrLabel = "Pose";
        } else if (curSelectedType == "paperdoll") {
            attrLabel = "Expression";
        }
        
        ctx.fillStyle = "#D9D9D9";
        draw_tab(ATTR_TYPE_COL, ATTR_TYPE_ROW, ATTR_TYPE_WIDTH, ATTR_TYPE_HEIGHT + 1, 8);

        ctx.fillStyle = "#000000";
        ctx.fillText(attrLabel, ATTR_TYPE_COL + ATTR_TYPE_WIDTH/2, ATTR_TYPE_ROW + 24);
    
        for (r = 0; r < NUM_CLIPART_VERT; r++) {
            for (c = 0; c < NUM_CLIPART_HORZ; c++) {
                var idx = r * NUM_CLIPART_HORZ + c + tabPage;

                // Only do something if there is an object of that type for selected idx 
                if ( idx < numObjTypeShow[curType] ) {
                    idx += clipartIdxStart[selectedTabIdx]; // to that page
                    if (selectedIdx == idx) { // Draws the "select" box background
                        ctx.drawImage(selectedImg, 
                                      CLIPART_COL + c * CLIPART_SKIP +
                                      (CLIPART_BUFFER / 2) + CLIPART_OBJECT_OFFSET_COL, 
                                      CLIPART_ROW + TAB_HEIGHT + r * CLIPART_SKIP +
                                      (CLIPART_BUFFER / 2) + CLIPART_OBJECT_OFFSET_ROW, 
                                      CLIPART_SKIP, CLIPART_SKIP);
                    }
                    
                    var indexCR;
                    var left = 1;
                    var Size = 13;
                    var locationOffset = 11;

                    if ( curType == "human" ) {

                        if (curAvailableObj[idx].smallestUnusedInstanceIdx < curAvailableObj[idx].numInstance) {
                            indexCR = curAvailableObj[idx].instance[curAvailableObj[idx].smallestUnusedInstanceIdx].expressionID;
                        } else {
                            ctx.drawImage(noLeftImg, 
                                          CLIPART_COL + c * CLIPART_SKIP +
                                          (CLIPART_BUFFER / 2) + CLIPART_OBJECT_OFFSET_COL, 
                                          CLIPART_ROW + TAB_HEIGHT + r * CLIPART_SKIP +
                                          (CLIPART_BUFFER / 2) + CLIPART_OBJECT_OFFSET_ROW, 
                                          CLIPART_SKIP, CLIPART_SKIP);
                            continue;
                        }

                        if (typeof curPeopleExprImgs[idx] == "undefined") { // just sometimes it is not even loaded yet...
                            continue;
                        }

                        for (i = curAvailableObj[idx].smallestUnusedInstanceIdx + 1; i < curAvailableObj[idx].numInstance; i++) {
                            if (curAvailableObj[idx].instance[i].present == false) {
                                left++;
                            }
                        }
                        
                        var w = curPeopleExprImgs[idx][indexCR].width;
                        var h = curPeopleExprImgs[idx][indexCR].height;
                        
                        var newW = Math.min(w, CLIPART_SIZE * w / Math.max(w, h));
                        var newH = Math.min(h, CLIPART_SIZE * h / Math.max(w, h));

                        var rowOffset = (CLIPART_SIZE - newH) / 2 + CLIPART_BUFFER / 2;
                        var colOffset = (CLIPART_SIZE - newW) / 2 + CLIPART_BUFFER / 2;
                        var xo = CLIPART_COL + c * CLIPART_SKIP + CLIPART_BUFFER + colOffset;
                        var yo = CLIPART_ROW + TAB_HEIGHT + r * CLIPART_SKIP + CLIPART_BUFFER + rowOffset;

                        ctx.drawImage(curPeopleExprImgs[idx][indexCR], 0, 0, w, h, 
                                      Math.floor(xo) + CLIPART_OBJECT_OFFSET_COL, 
                                      Math.floor(yo) + CLIPART_OBJECT_OFFSET_ROW, 
                                      newW, newH);
                        
                        xo = CLIPART_COL + (c + 1) * CLIPART_SKIP - 1;
                        yo = CLIPART_ROW + TAB_HEIGHT + (r + 1) * CLIPART_SKIP - locationOffset;
                        ctx.drawImage(numBorderImg,
                                      Math.floor(xo - Size + 1) + CLIPART_OBJECT_OFFSET_COL, 
                                      Math.floor(yo - Size + 1) + CLIPART_OBJECT_OFFSET_ROW, 
                                      Size, Size);

                        ctx.save();
                        ctx.textAlign = 'center';
                        ctx.font = '10pt Calibri';
                        ctx.fillStyle = "#444444";
                        var optionsW = ctx.measureText("0").width;
                        var optionsH = Size;
                        xo = CLIPART_COL + (c + 1) * CLIPART_SKIP;
                        yo = CLIPART_ROW + (r + 1) * CLIPART_SKIP;
                        ctx.fillText(left, 
                                     Math.floor(xo - optionsW) + CLIPART_OBJECT_OFFSET_COL, 
                                     Math.floor(yo - optionsH) + CLIPART_OBJECT_OFFSET_ROW);
                        ctx.restore();
                        
                    } else {
                        if (curAvailableObj[idx].smallestUnusedInstanceIdx < curAvailableObj[idx].numInstance) {
                            indexCR = curAvailableObj[idx].instance[curAvailableObj[idx].smallestUnusedInstanceIdx].poseID;
                        } else {
                            ctx.drawImage(noLeftImg, 
                                          CLIPART_COL + c * CLIPART_SKIP +
                                          (CLIPART_BUFFER / 2) + CLIPART_OBJECT_OFFSET_COL, 
                                          CLIPART_ROW + TAB_HEIGHT + r * CLIPART_SKIP +
                                          (CLIPART_BUFFER / 2) + CLIPART_OBJECT_OFFSET_ROW, 
                                          CLIPART_SKIP, CLIPART_SKIP);
                            continue;
                        }

                        if (typeof curClipartImgs[idx] == "undefined") { // just sometimes it is not even loaded yet...
                            continue;
                        }

                        for (i = curAvailableObj[idx].smallestUnusedInstanceIdx + 1; i < curAvailableObj[idx].numInstance; i++) {
                            if (curAvailableObj[idx].instance[i].present == false) {
                                left++
                            }
                        }

                        var w = curClipartImgs[idx][indexCR].width;
                        var h = curClipartImgs[idx][indexCR].height;
                        
                        var newW = Math.min(w, CLIPART_SIZE * w / Math.max(w, h));
                        var newH = Math.min(h, CLIPART_SIZE * h / Math.max(w, h));

                        var rowOffset = (CLIPART_SIZE - newH) / 2 + CLIPART_BUFFER / 2;
                        var colOffset = (CLIPART_SIZE - newW) / 2 + CLIPART_BUFFER / 2;
                        var xo = CLIPART_COL + c * CLIPART_SKIP + CLIPART_BUFFER + colOffset;
                        var yo = CLIPART_ROW + TAB_HEIGHT + r * CLIPART_SKIP + CLIPART_BUFFER + rowOffset;

                        ctx.drawImage(curClipartImgs[idx][indexCR], 0, 0, w, h, 
                                      Math.floor(xo) + CLIPART_OBJECT_OFFSET_COL, 
                                      Math.floor(yo) + CLIPART_OBJECT_OFFSET_ROW, 
                                      newW, newH);
                        
                        xo = CLIPART_COL + (c + 1) * CLIPART_SKIP - 1;
                        yo = CLIPART_ROW + TAB_HEIGHT + (r + 1) * CLIPART_SKIP - locationOffset;
                        ctx.drawImage(numBorderImg, 
                                      Math.floor(xo - Size + 1) + CLIPART_OBJECT_OFFSET_COL, 
                                      Math.floor(yo - Size + 1) + CLIPART_OBJECT_OFFSET_ROW, 
                                      Size, Size);

                        ctx.save();
                        ctx.textAlign = 'center';
                        ctx.font = '10pt Calibri';
                        ctx.fillStyle = "#444444";
                        var optionsW = ctx.measureText("0").width;
                        var optionsH = Size;
                        xo = CLIPART_COL + (c + 1) * CLIPART_SKIP;
                        yo = CLIPART_ROW + TAB_HEIGHT + (r + 1) * CLIPART_SKIP;
                        ctx.fillText(left, 
                                     Math.floor(xo - optionsW) + CLIPART_OBJECT_OFFSET_COL, 
                                     Math.floor(yo - optionsH) + CLIPART_OBJECT_OFFSET_ROW);
                        ctx.restore();
                    }
                }
            }
        }
        
        // Draw tab page buttons
        if (tabPage_more_above()) {
            ctx.drawImage(tabPageUpImg, 
                          tabPageUpRect.x1 + CLIPART_COL, 
                          tabPageUpRect.y1 + CLIPART_ROW, 
                          rect_width(tabPageUpRect), 
                          rect_height(tabPageUpRect));
        }
        
        if (tabPage_more_below()) {
            ctx.drawImage(tabPageDownImg, 
                          tabPageDownRect.x1 + CLIPART_COL, 
                          tabPageDownRect.y1 + CLIPART_ROW, 
                          rect_width(tabPageDownRect), 
                          rect_height(tabPageDownRect));
        }
        
        if (selectedIdx != notUsed) {
            if (selectedIdx < numObjTypeShow['human']) {
                                // people
                if (selectedAttributeType == 0) { // Pose SA: TODO UPDATE
                    for (i = 0; i < curAvailableObj[selectedIdx].instance[0].numPose; i++) {
                        // just to show it is selected
                        if (i == curAvailableObj[selectedIdx].instance[selectedIns].poseID) {
                            ctx.drawImage(selectedImg, 
                                        ATTR_COL + i * CLIPART_SKIP + CLIPART_BUFFER / 2, 
                                        ATTR_ROW + CLIPART_BUFFER, 
                                        CLIPART_SKIP, CLIPART_SKIP);
                        }
                        var indexP = i * curAvailableObj[selectedIdx].instance[0].numExpression

                        var w = curClipartImgs[selectedIdx][indexP].width;
                        var h = curClipartImgs[selectedIdx][indexP].height;

                        var newW = Math.min(w, CLIPART_SIZE * w / Math.max(w, h));
                        var newH = Math.min(h, CLIPART_SIZE * h / Math.max(w, h));

                        var rowOffset = (CLIPART_SIZE - newH) / 2 + CLIPART_BUFFER / 2;
                        var colOffset = (CLIPART_SIZE - newW) / 2 + CLIPART_BUFFER / 2;

                        var xo = ATTR_COL + i * CLIPART_SKIP + CLIPART_BUFFER + colOffset;
                        var yo = ATTR_ROW + CLIPART_BUFFER + rowOffset;

                        // only draw the first one
                        ctx.drawImage(curClipartImgs[selectedIdx][indexP], 0, 0, w, h, 
                                    Math.floor(xo), Math.floor(yo), newW, newH);
                    }
                    // SA: TODO Good to remove?
                    // then expressions
//                     for (i = 1; i < curAvailableObj[selectedIdx].instance[0].numExpression; i++) {
//                         // just to show it is selected
//                         if (i == curAvailableObj[selectedIdx].instance[selectedIns].expressionID)
//                             ctx.drawImage(selectedImg, 
//                                         ATTR2_COL + (i - 1) * CLIPART_SKIP + CLIPART_BUFFER / 2, 
//                                         ATTR2_ROW + CLIPART_BUFFER, 
//                                         CLIPART_SKIP, CLIPART_SKIP);
// 
//                         var w = curPeopleExprImgs[selectedIdx][i].width;
//                         var h = curPeopleExprImgs[selectedIdx][i].height;
//                         var newW = Math.min(w, CLIPART_SIZE * w / Math.max(w, h));
//                         var newH = Math.min(h, CLIPART_SIZE * h / Math.max(w, h));
// 
//                         var rowOffset = (CLIPART_SIZE - newH) / 2 + CLIPART_BUFFER / 2;
//                         var colOffset = (CLIPART_SIZE - newW) / 2 + CLIPART_BUFFER / 2;
// 
//                         var xo = ATTR2_COL + (i - 1) * CLIPART_SKIP + CLIPART_BUFFER + colOffset;
//                         var yo = ATTR2_ROW + CLIPART_BUFFER + rowOffset;
// 
//                         // only draw the first one
//                         ctx.drawImage(curPeopleExprImgs[selectedIdx][i], 0, 0, w, h, Math.floor(xo), Math.floor(yo), newW, newH);
//                     }
                }
            } else { // Not human
                for (i = 0; i < curAvailableObj[selectedIdx].instance[0].numPose; i++) {
                    if (i == curAvailableObj[selectedIdx].instance[selectedIns].poseID) {
                        ctx.drawImage(selectedImg, 
                                    ATTR_COL + i * CLIPART_SKIP + CLIPART_BUFFER / 2, 
                                    ATTR_ROW + CLIPART_BUFFER, 
                                    CLIPART_SKIP, CLIPART_SKIP);
                    }

                    var w = curClipartImgs[selectedIdx][i].width;
                    var h = curClipartImgs[selectedIdx][i].height;
                    var newW = Math.min(w, CLIPART_SIZE * w / Math.max(w, h));
                    var newH = Math.min(h, CLIPART_SIZE * h / Math.max(w, h));

                    var rowOffset = (CLIPART_SIZE - newH) / 2 + CLIPART_BUFFER / 2;
                    var colOffset = (CLIPART_SIZE - newW) / 2 + CLIPART_BUFFER / 2;

                    var xo = ATTR_COL + i * CLIPART_SKIP + CLIPART_BUFFER + colOffset;
                    var yo = ATTR_ROW + CLIPART_BUFFER + rowOffset;

                    ctx.drawImage(curClipartImgs[selectedIdx][i], 0, 0, w, h, 
                                Math.floor(xo), Math.floor(yo), newW, newH);
                }
            }
        }
    }
}

function draw_buttons() {
    
    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 10, canvas_fix.width, 5);


    ctx.fillStyle = "#000000";
    ctx.font = "20px Arial";
    ctx.fillText("Size", SCALE_COL - 40, SCALE_ROW + 20);
    ctx.fillText("Flip", FLIP_COL - 30, SCALE_ROW + 20);
//   ctx.fillText("Flip" + numObjTypeShow['animal'], FLIP_COL - 40, FLIP_ROW);
//   numObjTypeShow['paperdoll'];
    
    buttonW = buttonImg.width / 2;
    buttonH = buttonImg.height / 5;
    w = buttonW;
    h = buttonH;

    if (w > 0 && h > 0) {
        var wMark = slideMarkImg.width;
        var hMark = slideMarkImg.height;
        var wSlide = slideBarImg.width;
        var hSlide = slideBarImg.height;

        ctx.drawImage(slideBarImg, 0, 0, wSlide, hSlide, 
                      SCALE_COL, 
                      SCALE_ROW + (SCALE_HEIGHT - hSlide) / 2, 
                      SCALE_WIDTH, hSlide);
        if (selectedIdx != notUsed && loadedObjectsAndBG == true) {
            ctx.drawImage(slideMarkImg, 0, 0, wMark, hMark, 
                          SCALE_COL + 
                          curAvailableObj[selectedIdx].instance[selectedIns].z * (SCALE_WIDTH / (numZSize - 1)) - 
                          wMark / 2, 
                          SCALE_ROW, wMark, SCALE_HEIGHT);
        }

        for (i = 0; i < 2; i++) {
            if (selectedIdx != notUsed && loadedObjectsAndBG == true) {
                if (i == curAvailableObj[selectedIdx].instance[selectedIns].flip) {
                    ctx.drawImage(buttonImg, w, (i + 3) * h, w, h, 
                                  i * w + FLIP_COL, 
                                  FLIP_ROW, w, h);
                }
                else {
                    ctx.drawImage(buttonImg, 0, (i + 3) * h, w, h, 
                                  i * w + FLIP_COL, 
                                  FLIP_ROW, w, h);
                }
            } else {
                ctx.drawImage(buttonImg, 0, (i + 3) * h, w, h, 
                              i * w + FLIP_COL, 
                              FLIP_ROW, w, h);
            }
        }
    }
}

// ===========================================================
// Code to allow for mouse-based user interaction.
// Let's users drag-and-drop objects in/onto the scene,
// select object size, flip, pose, expression (for humans).
// ===========================================================
function mouseup_canvas(event) {
    
    moveClipart = false;

    if (selectedIdx != notUsed &&
        loadedObjectsAndBG == true) {
        // record the movement data
        if (selectedIdx != lastIdx || selectedIns != lastIns || 
                curAvailableObj[selectedIdx].instance[selectedIns].x != lastX || 
                curAvailableObj[selectedIdx].instance[selectedIns].y != lastY || 
                curAvailableObj[selectedIdx].instance[selectedIns].z != lastZ) {

            log_user_data("mouseup1");

            lastIdx = selectedIdx;
            lastIns = selectedIns;
            lastX = curAvailableObj[selectedIdx].instance[selectedIns].x;
            lastY = curAvailableObj[selectedIdx].instance[selectedIns].y;
            lastZ = curAvailableObj[selectedIdx].instance[selectedIns].z;
        }

        if (curAvailableObj[selectedIdx].instance[selectedIns].present == false) {
            // should find a smart way to deal with the pointer
            if (selectedIns < curAvailableObj[selectedIdx].smallestUnusedInstanceIdx) {
                curAvailableObj[selectedIdx].smallestUnusedInstanceIdx = selectedIns;
                curAvailableObj[selectedIdx].smallestUnusedInstanceIdx = selectedIns;
            }

            selectedIdx = notUsed;
            selectedIns = notUsed;
            log_user_data("mouseup2"); // SA: TODO Add? Doesn't seem to get triggered

            draw_canvas();
        }
    }
    
    attrSelectorDown = false;
    flipDown = false;
    scaleSliderDown = false;
}

function mousedown_canvas(event) {
    
    var redrawCanvas = false;
        
    // XL: Handle bug related to user moving outside of canvas
    // and letting object be lost to the void.
    if (moveClipart == true) {
        mouseup_canvas(event);
    }
    
    if (selectPaperdollPose == true) {
        selectPaperdollPose = false;
        redrawCanvas = true;
    }

    var ev = event || window.event;

    scaleSliderDown = false;

    if (ev.pageX) {
        cx = ev.pageX;
    } else if (ev.clientX) {
        cx = ev.clientX;
        if (document.documentElement.scrollLeft) {
            cx += document.documentElement.scrollLeft;
        } else {
            cx += document.body.scrollLeft;
        }
    }
    
    if (ev.pageY) {
        cy = ev.pageY;
    } else if (ev.clientY) {
        cy = ev.clientY;
        if (document.documentElement.scrollTop) {
            cy += document.documentElement.scrollTop;
        } else {
            cy += document.body.scrollTop;
        }
    }
    
    // Select attribute type - not currently used
/*  var attrTypeX = cx - ATTR_TYPE_COL - canvas_fix.offsetLeft;
    var attrTypeY = cy - ATTR_TYPE_ROW - canvas_fix.offsetTop;

    if (attrTypeY > 0 && attrTypeY < ATTR_TYPE_HEIGHT && loadedObjectsAndBG == true)
    {
        var attrSelectedIdx = Math.floor(attrTypeX / ATTR_TYPE_WIDTH);
        if (attrSelectedIdx >= 0 && attrSelectedIdx <= 2)
        {
            selectedAttributeType = attrSelectedIdx;
            redrawCanvas = true;
        }
    }
*/

    // Select clipart object type using tabs
    var tabsX = cx - CLIPART_COL - canvas_fix.offsetLeft;
    var tabsY = cy - (CLIPART_ROW) - canvas_fix.offsetTop;

    if (tabsX < CLIPART_WIDTH && tabsX > 0 && 
        tabsY < TAB_HEIGHT && tabsY > 0 &&
        loadedObjectsAndBG == true) {
        
        selectedTabIdx = Math.floor(tabsX / Math.floor(CLIPART_WIDTH / NUM_TABS));
        selectedTab = objectTypeOrder[selectedTabIdx];
        tabPage = 0;
        //log_user_data("tab"); // SA: TODO Add?
        redrawCanvas = true;
    }

    // Select clipart objects to add to canvas
    var clipartX = cx - CLIPART_COL - 
                   canvas_fix.offsetLeft - 
                   CLIPART_OBJECT_OFFSET_COL;
    var clipartY = cy - CLIPART_ROW - 
                   canvas_fix.offsetTop - TAB_HEIGHT - 
                   CLIPART_OBJECT_OFFSET_ROW;

    if (clipartX < CLIPART_SKIP * NUM_CLIPART_HORZ && clipartX > 0 && 
            clipartY < CLIPART_SKIP * NUM_CLIPART_VERT && clipartY > 0 &&
            loadedObjectsAndBG == true) {
        
        var prevSelectedIdx = selectedIdx;
        selectedIdx = Math.floor(clipartY / CLIPART_SKIP);
        selectedIdx *= NUM_CLIPART_HORZ;
        selectedIdx += Math.floor(clipartX / CLIPART_SKIP) + tabPage;

        // SA: TODO Fix it so selectedTabIdx corresponds to objectTypeOrder
        // Currently, the menu positions are hardcoded (by the menu image), which is sub-optimal.        
    
        if (selectedIdx < numObjTypeShow[objectTypeOrder[selectedTabIdx]]) {
            selectedIdx += clipartIdxStart[selectedTabIdx];
            
            if (selectedIdx < numObjTypeShow['paperdoll']) {
                selectPaperdollPose = true;
                selectedPart = 'Torso';
            }

            if (curAvailableObj[selectedIdx].smallestUnusedInstanceIdx == curAvailableObj[selectedIdx].numInstance) {
                // deselect it
                selectedIdx = notUsed;
                selectedIns = notUsed;
            } else {
                for (i = curAvailableObj[selectedIdx].smallestUnusedInstanceIdx; i < curAvailableObj[selectedIdx].numInstance; i++) {
                    if (curAvailableObj[selectedIdx].instance[i].present == false) {
                        selectedIns = i;
                        // Find smallest unused instance index
                        for (j = i + 1; j < curAvailableObj[selectedIdx].numInstance && 
                                curAvailableObj[selectedIdx].instance[j].present == true; j++)
                            ;
                        curAvailableObj[selectedIdx].smallestUnusedInstanceIdx = j;
                        break;
                    }
                }

                mouse_offset_X = 0;
                mouse_offset_Y = 0;
                wasOnCanvas = false;
                moveClipart = true;
                // log_user_data("Transition to scene?"); // SA: TODO Add?
                redrawCanvas = true;
            }
        } else {
            // If the user clicks in the select object part of menu
            // but it's not a valid object, then leave selectedIdx
            // at it's previous value. Much better UX, since a
            // selected object (in the scene) stays selected.
            selectedIdx = prevSelectedIdx;
        }

        if (selectedIdx != notUsed && selectedTabIdx == 0 && curLoadAll[selectedIdx] == 1) {
            // should do some loading
            var s = 0;
            for (j = 0; j < curAvailableObj[selectedIdx].instance[0].numPose; j++) {
                s++; // for the first one
                for (k = 1; k < curAvailableObj[selectedIdx].instance[0].numExpression; k++) { // start with the first one
                    
                    if (j == curAvailableObj[selectedIdx].instance[selectedIns].poseID && 
                            curAvailableObj[selectedIdx].instance[selectedIns].expressionID == k) { // already loaded
                        s++;
                        continue;
                    }
                    curClipartImgs[selectedIdx][s] = new Image();
                    curClipartImgs[selectedIdx][s].src = 
                        obj_img_filename_pose_expr(curAvailableObj[selectedIdx].instance[selectedIns], j, k);   
                    curClipartImgs[selectedIdx][s].onload = draw_canvas;
                    s++;
                }
            }
            curLoadAll[selectedIdx] = 2; // all loaded
        }
    }

    var clipartX = cx - CLIPART_COL - canvas_fix.offsetLeft;
    var clipartY = cy - CLIPART_ROW - canvas_fix.offsetTop;
    
    // Check if it's interacting with tab page buttons
    if (is_in_rect(clipartX, clipartY, tabPageUpRect) && 
        tabPage_more_above()) {
        
        tabPage = tabPage - NUM_CLIPART_VERT * NUM_CLIPART_HORZ;
        draw_canvas();
    }
    
    if (is_in_rect(clipartX, clipartY, tabPageDownRect) && 
        tabPage_more_below()) {
        
        tabPage = tabPage + NUM_CLIPART_VERT * NUM_CLIPART_HORZ;
        draw_canvas();
    }

    // Select clipart attributes
    var attrX = cx - ATTR_COL - canvas_fix.offsetLeft;
    var attrY = cy - ATTR_ROW - canvas_fix.offsetTop;

    if (selectedIdx != notUsed &&
            loadedObjectsAndBG == true) {
        if (selectedAttributeType == 0) {
            var numAttr = curAvailableObj[selectedIdx].instance[0].numPose;
            if (numAttr > MAX_NUM_ATTR) {
                numAttr = MAX_NUM_ATTR;
            }

            if (attrX < CLIPART_SKIP * numAttr && attrX > 0 && attrY < CLIPART_SKIP && attrY > 0) {
                curAvailableObj[selectedIdx].instance[selectedIns].poseID = Math.floor(attrX / CLIPART_SKIP);
                log_user_data("pose");
                redrawCanvas = true;
                attrSelectorDown = true;
            }
        }
    }

//     // Select the 2nd clipart attributes for people expressions
//     var attr2X = cx - ATTR2_COL - canvas_fix.offsetLeft;
//     var attr2Y = cy - ATTR2_ROW - canvas_fix.offsetTop;
// 
//     if (selectedIdx != notUsed &&
//             loadedObjectsAndBG == true) {
//         var numAttr = curAvailableObj[selectedIdx].instance[0].numExpression; // the total number
// 
//         if (attr2X < CLIPART_SKIP * (numAttr - 1) && attr2X > 0 && attr2Y < CLIPART_SKIP && attr2Y > 0) {
//             curAvailableObj[selectedIdx].instance[selectedIns].expressionID = Math.floor(attr2X / CLIPART_SKIP) + 1; 
//             log_user_data("expression");
//             draw_canvas();
//         }
//     }

    // Select clipart on the canvas
    var canvasX = cx - CANVAS_COL - canvas_fix.offsetLeft;
    var canvasY = cy - CANVAS_ROW - canvas_fix.offsetTop;

    if (loadedObjectsAndBG == true) {
        if (canvasX < CANVAS_WIDTH && canvasX > 0 && 
            canvasY < CANVAS_HEIGHT && canvasY > 0) {

            if (selectedIdx != notUsed) {
                redrawCanvas = true;
            }
            
            selectedIdx = notUsed;
            selectedIns = notUsed;

            // Make sure we get the depth ordering correct
            for (k = numDepth0 - 1; k >= 0; k--) {
                if (curDepth0Used[k] <= 0) { // not used, just to accelerate the process
                    continue;
                }
                
                for (j = numZSize - 1; j >= 0; j--) {
                    for (l = numDepth1 - 1; l >= 0; l--) {
                        if (curDepth1Used[l] <= 0) {// not used, just to accelerate the process
                            continue;
                        }
                        for (i = 0; i < numAvailableObjects; i++) {
                            if ( curAvailableObj[i].instance[0].depth0 == k && curAvailableObj[i].instance[0].depth1 == l) {
                                for (m = 0; m < curAvailableObj[i].numInstance; m++) {
                                    if (curAvailableObj[i].instance[m].present == true && curAvailableObj[i].instance[m].z == j) {
                                        
                                        if (i < numObjTypeShow['paperdoll']) {
                                            // Handle the paperdolls in a separate function
                                            check_paperdoll_selection(canvasX, canvasY, i, m);
                                        } else {
                                            var scale = curZScale[curAvailableObj[i].instance[m].z];
                                            var w0 = curClipartImgs[i][curAvailableObj[i].instance[m].poseID].width;
                                            var h0 = curClipartImgs[i][curAvailableObj[i].instance[m].poseID].height;
                                            var w = Math.floor(scale * w0);
                                            var h = Math.floor(scale * h0);

                                            var rowOffset = -h / 2;
                                            var colOffset = -w / 2;

                                            var x = curAvailableObj[i].instance[m].x + colOffset;
                                            var y = curAvailableObj[i].instance[m].y + rowOffset;

                                            if (canvasX >= x && canvasX < x + w && 
                                                canvasY >= y && canvasY < y + h) {

                                                // Make sure the piece of clipart is actually visible below the mouse click
                                                var newCanvas = document.createElement('canvas');
                                                newCanvas.width = w;
                                                newCanvas.height = h;
                                                var c = newCanvas.getContext("2d");
                                                c.drawImage(curClipartImgs[i][curAvailableObj[i].instance[m].poseID],
                                                    0, 0, curClipartImgs[i][curAvailableObj[i].instance[m].poseID].width, curClipartImgs[i][curAvailableObj[i].instance[m].poseID].height,
                                                    0, 0, w, h);

                                                // create a new pixel array
                                                imageData = c.getImageData(0, 0, w, h);
                                                var imgX = Math.floor(canvasX - x);
                                                if (curAvailableObj[i].instance[m].flip == 1)
                                                    imgX = w - 1 - imgX;
                                                var imgY = Math.floor(canvasY - y);
                                                var alpha = imageData.data[(imgX + imgY * w) * 4 + 3];

                                                // Is the clipart visible?
                                                if (alpha > 0) {
                                                    mouse_offset_X = (x + w / 2) - canvasX;
                                                    mouse_offset_Y = (y + h / 2) - canvasY;

                                                    selectedIdx = i;
                                                    selectedIns = m;
                                                }
                                                // log_user_data("mousedown_selected"); // Doesn't seem necessary
                                            
                                                // SA: TODO Should this be here?
                                                mouse_offset_X = (x + w / 2) - canvasX;
                                                mouse_offset_Y = (y + h / 2) - canvasY;

                                                // SA: TODO Should clicking on a selected object (on canvas) change tab?
                                                // Uncommenting below will enable that feature.
                                                // selectedTab = curAvailableObj[selectedIdx].instance[selectedIns].type;
                                                // selectedTabIdx = objectTypeToIdx[selectedTab];
                                                // log_user_data("tab"); // SA: TODO Add?
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            if (selectedIdx >= 0) {
                if (moveClipart === true) {
                    curAvailableObj[selectedIdx].instance[selectedIns].x = canvasX + mouse_offset_X;
                    curAvailableObj[selectedIdx].instance[selectedIns].y = canvasY + mouse_offset_Y;
                    // log_user_data("mousedown_if"); // Doesn't seem necessary?, Also, never seems to happen.
                    moveClipart = false;
                } else {
                    curAvailableObj[selectedIdx].instance[selectedIns].x = canvasX + mouse_offset_X;
                    curAvailableObj[selectedIdx].instance[selectedIns].y = canvasY + mouse_offset_Y;
                    // log_user_data("mousedown_else"); // Doesn't seem necessary?
                    moveClipart = true;
                }
                redrawCanvas = true;
            }
        }

        // Scale clipart objects
        var scaleSliderX = cx - canvas_fix.offsetLeft - SCALE_COL;
        var scaleSliderY = cy - canvas_fix.offsetTop - SCALE_ROW;

        if (scaleSliderX >= 0 && scaleSliderX < SCALE_WIDTH && scaleSliderY >= 0 && scaleSliderY < SCALE_HEIGHT) {
            if (selectedIdx != notUsed) {
                var position = Math.floor(scaleSliderX / (SCALE_WIDTH / (2 * (numZSize - 1))));
                position += 1;
                position /= 2;
                position = Math.floor(position);
                curAvailableObj[selectedIdx].instance[selectedIns].z = Math.max(0, Math.min(numZSize - 1, position));
    //             log_user_data("scale"); // Isn't needed, gets logged via mouse-up
                redrawCanvas = true;
                scaleSliderDown = true;
            }
        }

        // Flip clipart objects
        var flipButtonX = cx - canvas_fix.offsetLeft - FLIP_COL;
        var flipButtonY = cy - canvas_fix.offsetTop - FLIP_ROW;

        if (flipButtonX >= 0 && flipButtonX < buttonW * 2 && flipButtonY >= 0 && flipButtonY < buttonH) {
            if (selectedIdx != notUsed) {
                curAvailableObj[selectedIdx].instance[selectedIns].flip = Math.floor(flipButtonX / buttonW);
                log_user_data("flip");
                redrawCanvas = true;
                flipDown = true;
            }
        }
    } else {
        console.log("Should I be here?");
//         debugger;
        load_obj_category_data();
    }

    if (redrawCanvas == true) {
        draw_canvas();
    }
}


function check_paperdoll_selection(canvasX, canvasY, objIdx, instIdx) {
    var paperdoll = curAvailableObj[objIdx].instance[instIdx];
    var numBodyParts = paperdoll.body.length;
    var scale = paperdoll.globalScale * curZScale[paperdoll.z];

    for (partIdx = 0; partIdx < numBodyParts; partIdx++) {
        var w = curPaperdollPartImgs[objIdx][partIdx].width;
        var h = curPaperdollPartImgs[objIdx][partIdx].height;
        var ws = Math.floor(scale * curPaperdollPartImgs[objIdx][partIdx].width);
        var hs = Math.floor(scale * curPaperdollPartImgs[objIdx][partIdx].height);

        var x0 = canvasX / scale - paperdoll.paperdollX[partIdx];
        var y0 = canvasY / scale - paperdoll.paperdollY[partIdx];

        var rotMatrix = [];
        rotMatrix.push(Math.cos(-paperdoll.paperdollGRotation[partIdx]));
        rotMatrix.push(-Math.sin(-paperdoll.paperdollGRotation[partIdx]));
        rotMatrix.push(Math.sin(-paperdoll.paperdollGRotation[partIdx]));
        rotMatrix.push(Math.cos(-paperdoll.paperdollGRotation[partIdx]));

        var x1 = rotMatrix[0] * x0 + rotMatrix[1] * y0 + paperdoll.body[partIdx].childX;
        var y1 = rotMatrix[2] * x0 + rotMatrix[3] * y0 + paperdoll.body[partIdx].childY;

        x1 *= scale;
        y1 *= scale;

        if (x1 >= 0 && x1 < ws && y1 >= 0 && y1 < hs) {

            // Make sure the piece of clipart is actually visible below the mouse click
            var newCanvas = document.createElement('canvas');
            newCanvas.width = ws;
            newCanvas.height = hs;
            var c = newCanvas.getContext("2d");
            c.drawImage(curPaperdollPartImgs[objIdx][partIdx],
                        0, 0, w, h,
                        0, 0, ws, hs);

            // create a new pixel array
            imageData = c.getImageData(0, 0, ws, hs);
            var imgX = Math.floor(x1);
            if (paperdoll.flip == 1) {
                imgX = ws - 1 - imgX;
            }
            var imgY = Math.floor(y1);
            var alpha = imageData.data[(imgX + imgY * ws) * 4 + 3];

            // If the piece of clipart visible?
            if (alpha > 0) {
                selectedIdx = objIdx;
                selectedIns = instIdx;
                if (paperdoll.body[partIdx].clickTransfer == 'null') {
                    selectedPart = paperdoll.body[partIdx].part;
                } else {
                    selectedPart = paperdoll.body[partIdx].clickTransfer;
                }

                mouse_offset_X = (curAvailableObj[objIdx].instance[instIdx].x) - canvasX;
                mouse_offset_Y = (curAvailableObj[objIdx].instance[instIdx].y) - canvasY;
                selectPaperdollPose = true;
            }
        }
    }
}

//update the current location of the keypoint
function mousemove_canvas(event) {
    
    var ev = event || window.event;

    if (ev.pageX) {
        cx = ev.pageX;
    } else if (ev.clientX) {
        cx = ev.clientX;
        if (document.documentElement.scrollLeft) {
            cx += document.documentElement.scrollLeft;
        } else {
            cx += document.body.scrollLeft;
        }
    }
    
    if (ev.pageY) {
        cy = ev.pageY;
    } else if (ev.clientY) {
        cy = ev.clientY;
        if (document.documentElement.scrollTop) {
            cy += document.documentElement.scrollTop;
        } else {
            cy += document.body.scrollTop;
        }
    }
    
    if (selectedIdx != notUsed && 
        moveClipart == true && 
        wasOnCanvas === true &&
        loadedObjectsAndBG == true) {
        curAvailableObj[selectedIdx].instance[selectedIns].present = false;
//         log_user_data("mousemove_unselect"); // Changes too frequently with mouse movement
        draw_canvas();
    }

    var canvasX = cx - CANVAS_COL - canvas_fix.offsetLeft;
    var canvasY = cy - CANVAS_ROW - canvas_fix.offsetTop;

    if (canvasX < CANVAS_WIDTH && 
        canvasX > 0 && 
        canvasY < CANVAS_HEIGHT && 
        canvasY > 0 &&
        loadedObjectsAndBG == true) {
        
        wasOnCanvas = true;

        if (selectedIdx != notUsed && moveClipart === true) {
            if (selectedIdx < numObjTypeShow['paperdoll']) {
                curAvailableObj[selectedIdx].instance[selectedIns].present = true;
                var paperdollInst = curAvailableObj[selectedIdx].instance[selectedIns];
                
                if (selectedPart == 'Torso') {
                    paperdollInst.x = canvasX + mouse_offset_X;
                    paperdollInst.y = canvasY + mouse_offset_Y;
                    paperdollInst.present = true;
                } else {
                    if (selectedPart == 'Head') {
                        var x0 = canvasX - paperdollInst.x;
                        var y0 = canvasY - paperdollInst.y;

                        paperdollInst.paperdollGRotation[0] = Math.atan2(x0, -y0);
                    } else {
                        selectedPartIdx = paperdollInst.partIdxList[selectedPart];
                        selectedParentIdx = paperdollInst.partIdxList[paperdollInst.body[selectedPartIdx].parent];

                        var scale = paperdollInst.globalScale * curZScale[paperdollInst.z];
                        var x0 = canvasX/scale - paperdollInst.paperdollX[selectedPartIdx];
                        var y0 = canvasY/scale - paperdollInst.paperdollY[selectedPartIdx];

                        if (paperdollInst.flip == 1) {
                            paperdollInst.paperdollLRotation[selectedPartIdx] = -Math.atan2(-x0, y0);

                            if (paperdollInst.parent != 'null') {
                                paperdollInst.paperdollLRotation[selectedPartIdx] += paperdollInst.paperdollGRotation[selectedParentIdx];
                            }
                        } else {
                            paperdollInst.paperdollLRotation[selectedPartIdx] = Math.atan2(-x0, y0);

                            if (paperdollInst.parent != 'null') {
                                paperdollInst.paperdollLRotation[selectedPartIdx] -= paperdollInst.paperdollGRotation[selectedParentIdx];
                            }
                        }
                    }
                }
                draw_canvas();
            } else {
                curAvailableObj[selectedIdx].instance[selectedIns].x = canvasX + mouse_offset_X;
                curAvailableObj[selectedIdx].instance[selectedIns].y = canvasY + mouse_offset_Y;
                curAvailableObj[selectedIdx].instance[selectedIns].present = true;
    //             log_user_data("mousemove_select"); // Changes too frequently with mouse movement
                draw_canvas();
            }
        }
    }

    if (attrSelectorDown == true) {
        var attrX = cx - ATTR_COL - canvas_fix.offsetLeft;
        var attrY = cy - ATTR_ROW - canvas_fix.offsetTop;

        if (selectedIdx != notUsed &&
                loadedObjectsAndBG == true) {
            if (selectedAttributeType == 0) {
                var numAttr = curAvailableObj[selectedIdx].instance[0].numPose;
                if (numAttr > MAX_NUM_ATTR)
                    numAttr = MAX_NUM_ATTR;

                if (attrX < CLIPART_SKIP * numAttr && attrX > 0 && attrY < CLIPART_SKIP && attrY > 0) {
                    curAvailableObj[selectedIdx].instance[selectedIns].poseID = Math.floor(attrX / CLIPART_SKIP);
                    log_user_data("pose");
                    draw_canvas();
                }
            }
        }
    }

    if (scaleSliderDown == true) {
        var scaleSliderX = cx - canvas_fix.offsetLeft - SCALE_COL;
        var scaleSliderY = cy - canvas_fix.offsetTop - SCALE_ROW;

        if (selectedIdx != notUsed && loadedObjectsAndBG == true) {
            var position = Math.floor(scaleSliderX / (SCALE_WIDTH / (2 * (numZSize - 1))));
            position += 1;
            position /= 2;
            position = Math.floor(position);
            curAvailableObj[selectedIdx].instance[selectedIns].z = Math.max(0, Math.min(numZSize - 1, position));
            // log_user_data("zScale slider movement"); // Doesn't seem necessary
            draw_canvas();
        }
    }

    if (flipDown == true) {
        var flipButtonX = cx - canvas_fix.offsetLeft - FLIP_COL;
        var flipButtonY = cy - canvas_fix.offsetTop - FLIP_ROW;

        if (flipButtonX >= 0 && flipButtonX < buttonW * 2 && 
            flipButtonY >= 0 && flipButtonY < buttonH) {
            
            if (selectedIdx != notUsed) {
                curAvailableObj[selectedIdx].instance[selectedIns].flip = Math.floor(flipButtonX / buttonW);
                log_user_data("flip");
                draw_canvas();
            }
        }
    }
}

// Check if possible to change tab page
function tabPage_more_above() {
    return ((tabPage - 
            NUM_CLIPART_VERT*NUM_CLIPART_HORZ) >= 0);
}

function tabPage_more_below() {
    return ((tabPage + 
             NUM_CLIPART_VERT*NUM_CLIPART_HORZ) < numObjTypeShow[selectedTab]);
}

// rect functions
// A general function to check if (x,y) is in rect
function is_in_rect(x, y, rect) {
    return (x >= rect.x1 && 
            x < rect.x2 && 
            y >= rect.y1 && 
            y < rect.y2);
}

// A general function to get rect relative to another rect
function relative_to_rect(rect1, rect) {
    return {x1: rect1.x1 - rect.x1,
            x2: rect1.x2 - rect.x1,
            y1: rect1.y1 - rect.y1,
            y2: rect1.y2 - rect.y2};
}

function rect_height(rect) {
    return (rect.y2 - rect.y1)
}

function rect_width(rect) {
    return (rect.x2 - rect.x1);
}

// ===========================================================
// Let users use keyboard shortcuts for certain features.
// Selected can be shrunk/enlarged (CTRL + a/CTRL + z), 
// sent backward/forward like PPT (CTRL + s/ CTRL + x),
// and its flip toggled (CTRL + c).
// ===========================================================
function handle_key_down(event) {
    
    var e = window.event || event;
    
    // "17" == control key
    if (e.keyCode == "17") {
        CTRL_DOWN = true;
    } else if (CTRL_DOWN == true && loadedObjectsAndBG == true) {
        
        if (e.keyCode == "83") {// s
            e.preventDefault();
            //alert("Move object back.");
            if (selectedIdx != notUsed) {
                curDepth1Used[curAvailableObj[selectedIdx].instance[selectedIns].depth1]--;
                curAvailableObj[selectedIdx].instance[selectedIns].depth1 = Math.min(curAvailableObj[selectedIdx].instance[selectedIns].depth1+1, numDepth1-1);
                curDepth1Used[curAvailableObj[selectedIdx].instance[selectedIns].depth1]++;
                log_user_data("key press");
                draw_canvas();
            }
        } else if (e.keyCode == "88") { // x
            e.preventDefault();
            //alert("Move object forward.");
            if (selectedIdx != notUsed) {
                curDepth1Used[curAvailableObj[selectedIdx].instance[selectedIns].depth1]--;
                curAvailableObj[selectedIdx].instance[selectedIns].depth1 = Math.max(curAvailableObj[selectedIdx].instance[selectedIns].depth1-1, 0);
                curDepth1Used[curAvailableObj[selectedIdx].instance[selectedIns].depth1]++;
                log_user_data("key press");
                draw_canvas();
            }
        } else if (e.keyCode == "90") { // z
            e.preventDefault();
            //alert("Increase object size.");
            if (selectedIdx != notUsed) {
                curAvailableObj[selectedIdx].instance[selectedIns].z = Math.max(curAvailableObj[selectedIdx].instance[selectedIns].z-1, 0);
                log_user_data("key press");
                draw_canvas();
            }
        } else if (e.keyCode == "65") { // a
            e.preventDefault();
            //alert("Decrease object size.");
            if (selectedIdx != notUsed) {
                curAvailableObj[selectedIdx].instance[selectedIns].z = Math.min(curAvailableObj[selectedIdx].instance[selectedIns].z+1, numZSize-1);
                log_user_data("key press");
                draw_canvas();
            }
        } else if (e.keyCode == "67") { // c
            e.preventDefault();
            //alert("Change flip.");
            if (selectedIdx != notUsed) {
                /// Flip is 0 or 1, so this is a clever way to flip
                curAvailableObj[selectedIdx].instance[selectedIns].flip = 1 - curAvailableObj[selectedIdx].instance[selectedIns].flip;
                log_user_data("key press");
                draw_canvas();
            }
        }
    }
}

function handle_key_up(event) {
    
    var e = window.event || event;
    // "17" == control key
    if (e.keyCode == "17") {
        CTRL_DOWN = false;
    }
}
