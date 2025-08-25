function CLevel(iLevel){
    var _aLevel = new Array();
    var _aBlock = new Array();
    var _aCellLabel;
    var _aGoal;
    var _aMoves = new Array();
    
    this._init = function(){
        //level 1
        _aBlock[0] = new Array();
        _aBlock[0].push({obj_x: 4, obj_y: 0, obj_type: "vertical_3"});
        _aBlock[0].push({obj_x: 3, obj_y: 3, obj_type: "vertical_2"});
        _aBlock[0].push({obj_x: 4, obj_y: 4, obj_type: "horizzontal_2"});
        _aBlock[0].push({obj_x: 2, obj_y: 2, obj_type: "player"});
        _aMoves.push( 5 );
        
        _aLevel[0] = _aBlock[0];
        
        //level 2
        _aBlock[1] = new Array();
        _aBlock[1].push({obj_x: 0, obj_y: 0, obj_type: "vertical_2"});
        _aBlock[1].push({obj_x: 5, obj_y: 0, obj_type: "vertical_3"});
        _aBlock[1].push({obj_x: 4, obj_y: 3, obj_type: "horizzontal_2"});
        _aBlock[1].push({obj_x: 2, obj_y: 4, obj_type: "vertical_2"});
        _aBlock[1].push({obj_x: 3, obj_y: 5, obj_type: "horizzontal_3"});
        _aBlock[1].push({obj_x: 0, obj_y: 2, obj_type: "player"});
        _aMoves.push( 5 );
        
        _aLevel[1] = _aBlock[1];
        
        //level 3
        _aBlock[2] = new Array();
        _aBlock[2].push({obj_x: 2, obj_y: 0, obj_type: "vertical_3"});
        _aBlock[2].push({obj_x: 5, obj_y: 1, obj_type: "vertical_2"});
        _aBlock[2].push({obj_x: 1, obj_y: 3, obj_type: "vertical_2"});
        _aBlock[2].push({obj_x: 2, obj_y: 4, obj_type: "horizzontal_2"});
        _aBlock[2].push({obj_x: 4, obj_y: 3, obj_type: "vertical_3"});
        _aBlock[2].push({obj_x: 0, obj_y: 2, obj_type: "player"});
        _aMoves.push( 12 );
        
        _aLevel[2] = _aBlock[2];
        
        //level 4
        _aBlock[3] = new Array();
        _aBlock[3].push({obj_x: 2, obj_y: 0, obj_type: "horizzontal_3"});
        _aBlock[3].push({obj_x: 2, obj_y: 1, obj_type: "vertical_2"});
        _aBlock[3].push({obj_x: 5, obj_y: 0, obj_type: "vertical_3"});
        _aBlock[3].push({obj_x: 2, obj_y: 4, obj_type: "horizzontal_2"});
        _aBlock[3].push({obj_x: 4, obj_y: 4, obj_type: "horizzontal_2"});
        _aBlock[3].push({obj_x: 0, obj_y: 2, obj_type: "player"});
        _aMoves.push( 5 );
        
        _aLevel[3] = _aBlock[3];
        
        //level 5
        _aBlock[4] = new Array();
        _aBlock[4].push({obj_x: 2, obj_y: 0, obj_type: "vertical_3"});
        _aBlock[4].push({obj_x: 0, obj_y: 4, obj_type: "vertical_2"});
        _aBlock[4].push({obj_x: 1, obj_y: 4, obj_type: "horizzontal_2"});
        _aBlock[4].push({obj_x: 4, obj_y: 3, obj_type: "vertical_3"});
        _aBlock[4].push({obj_x: 0, obj_y: 2, obj_type: "player"});
        _aMoves.push( 11 );
        
        _aLevel[4] = _aBlock[4];
        
        //level 6
        _aBlock[5] = new Array();
        _aBlock[5].push({obj_x: 2, obj_y: 0, obj_type: "vertical_2"});
        _aBlock[5].push({obj_x: 2, obj_y: 2, obj_type: "vertical_3"});
        _aBlock[5].push({obj_x: 0, obj_y: 5, obj_type: "horizzontal_3"});
        _aBlock[5].push({obj_x: 5, obj_y: 3, obj_type: "vertical_3"});
        _aBlock[5].push({obj_x: 0, obj_y: 2, obj_type: "player"});
        _aMoves.push( 8 );
        
        _aLevel[5] = _aBlock[5];
        
        //level 7
        _aBlock[6] = new Array();
        _aBlock[6].push({obj_x: 2, obj_y: 1, obj_type: "horizzontal_2"});
        _aBlock[6].push({obj_x: 4, obj_y: 0, obj_type: "vertical_2"});
        _aBlock[6].push({obj_x: 4, obj_y: 2, obj_type: "vertical_2"});
        _aBlock[6].push({obj_x: 5, obj_y: 0, obj_type: "vertical_3"});
        _aBlock[6].push({obj_x: 4, obj_y: 4, obj_type: "horizzontal_2"});
        _aBlock[6].push({obj_x: 3, obj_y: 4, obj_type: "vertical_2"});
        _aBlock[6].push({obj_x: 2, obj_y: 3, obj_type: "vertical_3"});
        _aBlock[6].push({obj_x: 2, obj_y: 2, obj_type: "player"});
        _aMoves.push( 9 );
        
        _aLevel[6] = _aBlock[6];
        
        //level 8
        _aBlock[7] = new Array();
        _aBlock[7].push({obj_x: 3, obj_y: 0, obj_type: "vertical_2"});
        _aBlock[7].push({obj_x: 3, obj_y: 2, obj_type: "vertical_2"});
        _aBlock[7].push({obj_x: 4, obj_y: 2, obj_type: "vertical_2"});
        _aBlock[7].push({obj_x: 4, obj_y: 0, obj_type: "horizzontal_2"});
        _aBlock[7].push({obj_x: 5, obj_y: 1, obj_type: "vertical_3"});
        _aBlock[7].push({obj_x: 0, obj_y: 4, obj_type: "vertical_2"});
        _aBlock[7].push({obj_x: 1, obj_y: 4, obj_type: "horizzontal_3"});
        _aBlock[7].push({obj_x: 4, obj_y: 4, obj_type: "vertical_2"});
        _aBlock[7].push({obj_x: 0, obj_y: 2, obj_type: "player"});
        _aMoves.push( 10 );
        
        _aLevel[7] = _aBlock[7];
        
        //level 9
        _aBlock[8] = new Array();
        _aBlock[8].push({obj_x: 1, obj_y: 1, obj_type: "vertical_2"});
        _aBlock[8].push({obj_x: 1, obj_y: 0, obj_type: "horizzontal_2"});
        _aBlock[8].push({obj_x: 3, obj_y: 0, obj_type: "vertical_2"});
        _aBlock[8].push({obj_x: 4, obj_y: 0, obj_type: "horizzontal_2"});
        _aBlock[8].push({obj_x: 5, obj_y: 1, obj_type: "vertical_3"});
        _aBlock[8].push({obj_x: 4, obj_y: 1, obj_type: "vertical_2"});
        _aBlock[8].push({obj_x: 4, obj_y: 3, obj_type: "vertical_3"});
        _aBlock[8].push({obj_x: 2, obj_y: 3, obj_type: "vertical_2"});
        _aBlock[8].push({obj_x: 0, obj_y: 3, obj_type: "horizzontal_2"});
        _aBlock[8].push({obj_x: 2, obj_y: 2, obj_type: "player"});
        _aMoves.push( 11 );
        
        _aLevel[8] = _aBlock[8];
        
        //level 10
        _aBlock[9] = new Array();
        _aBlock[9].push({obj_x: 0, obj_y: 0, obj_type: "horizzontal_2"});
        _aBlock[9].push({obj_x: 2, obj_y: 0, obj_type: "vertical_2"});
        _aBlock[9].push({obj_x: 4, obj_y: 0, obj_type: "horizzontal_2"});
        _aBlock[9].push({obj_x: 4, obj_y: 2, obj_type: "vertical_2"});
        _aBlock[9].push({obj_x: 0, obj_y: 4, obj_type: "horizzontal_2"});
        _aBlock[9].push({obj_x: 2, obj_y: 4, obj_type: "horizzontal_3"});
        _aBlock[9].push({obj_x: 5, obj_y: 4, obj_type: "vertical_2"});
        _aBlock[9].push({obj_x: 2, obj_y: 2, obj_type: "player"});
        _aMoves.push( 8 );
        
        _aLevel[9] = _aBlock[9];
    };
    
    this.getLevel = function(iLevel){
        return(_aLevel[iLevel]);
    };
    
    this.getCellValueInLevel = function(iLevel,iCellIndex){
        return _aCellLabel[parseInt(_aLevel[iLevel].charAt(iCellIndex))];
    };
    
    this.getGoalInLevel = function(iLevel){
        return _aMoves[iLevel];
    };
    
    this.getGoalNumberInLevel = function(iLevel){
        return _aGoal[iLevel].length;
    };
    
    this._init();
}