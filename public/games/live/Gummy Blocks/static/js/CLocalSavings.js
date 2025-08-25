
function clearLocalStorage(){
    s_iBestScore = 0;
    if(s_bStorageAvailable){
        var iCont = 0;
        while(iCont < localStorage.length){
            var szKey = localStorage.key(iCont);
            if(szKey.indexOf(GAME_NAME) !== -1){
                localStorage.removeItem(szKey);
            }else{
                iCont++;
            }
        }
    }
};

//clearLocalStorage();
//GET SAVED BEST SCORE 
function getBestScore(){
    if(!s_bStorageAvailable){
        return 0;
    }

    var iBestScore = getItem(GAME_NAME+"_best_score");
    if(iBestScore === null){
        return 0;
    }else{
        return iBestScore;
    }
}



//SAVE BEST SCORE
function saveBestScore(iScore){
    if(!s_bStorageAvailable){
        return;
    }
    
    saveItem(GAME_NAME+"_best_score", iScore);
}


//SAVE CURRENT SCORE
function saveScore(iScore){
    if(!s_bStorageAvailable){
        return;
    }
    
    saveItem(GAME_NAME+"_tmp_score", iScore);
}


function saveBoardState(aCells){
    if(!s_bStorageAvailable){
        return;
    }
    
    saveItem(GAME_NAME+"_board", JSON.stringify(aCells));
}

function getBoardState(){
    if(!s_bStorageAvailable){
        return null;
    }
    
    var oState = getItem(GAME_NAME+"_board");

    if(oState !== null){
        return JSON.parse(oState);
    }
    
    return null;
}

function getScoreSaved(){
    if(!s_bStorageAvailable){
        return 0;
    }
    
    var iScore = getItem(GAME_NAME+"_tmp_score");

    if(iScore === null){
        return 0;
    }else{
        return parseInt(iScore);
    }
}

function clearBoardState(){
    if(!s_bStorageAvailable){
        return;
    }
    localStorage.removeItem(GAME_NAME+"_board");
}

//SAVE AVAILABLE PIECES IN BOARD
function saveBoardPieces(aPiecesInfo){
    if(!s_bStorageAvailable){
        return null;
    }
    
    saveItem(GAME_NAME+"_pieces", JSON.stringify(aPiecesInfo));
}

function getSavedPieces(){
    if(!s_bStorageAvailable){
        return null;
    }
    
    var oPieces = getItem(GAME_NAME+"_pieces");
    if(oPieces !== null){
        return JSON.parse(oPieces);
    }
    
    return null;
}

