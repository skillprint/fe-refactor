function CPieceSettings(){
    var _aPieceConfig;
    
    this._init = function(){
        _aPieceConfig = new Array();
        
        //PIECE 0  #
        _aPieceConfig[0] = {list_pos:[{row:0,col:0}],type:5,num_cell:1};
        
        
        //PIECE 1  ##
        _aPieceConfig[1] = {list_pos:[{row:0,col:0},{row:0,col:1}],type:1,num_cell:2};
        
        
        //PIECE 2  #
        //         #
        _aPieceConfig[2] = {list_pos:[{row:0,col:0},{row:1,col:0}],type:1,num_cell:2};
        
        
        
        //PIECE 3  ###
        _aPieceConfig[3] = {list_pos:[{row:0,col:0},{row:0,col:1},{row:0,col:2}],type:2,num_cell:3};
        
        
        //PIECE 4  #
        //         #
        //         #
        _aPieceConfig[4] = {list_pos:[{row:0,col:0},{row:1,col:0},{row:2,col:0}],type:2,num_cell:3};
        
        
        //PIECE 5  ##
        //         #
        _aPieceConfig[5] = {list_pos:[{row:0,col:0},{row:0,col:1},{row:1,col:0}],type:8,num_cell:3};
        
        
        //PIECE 6  #
        //         ##
        _aPieceConfig[6] = {list_pos:[{row:0,col:0},{row:1,col:0},{row:1,col:1}],type:8,num_cell:3};
        
        
        //PIECE 7  #
        //        ##
        _aPieceConfig[7] = {list_pos:[{row:0,col:1},{row:1,col:0},{row:1,col:1}],type:8,num_cell:3};
        
        
        //PIECE 8  ##
        //          #
        _aPieceConfig[8] = {list_pos:[{row:0,col:0},{row:0,col:1},{row:1,col:1}],type:8,num_cell:3};
        
        
        //PIECE 9  ####
        _aPieceConfig[9] = {list_pos:[{row:0,col:0},{row:0,col:1},{row:0,col:2},{row:0,col:3}],type:3,num_cell:4};
        
        
        //PIECE 10  ###
        //          ###
        //          ###
        _aPieceConfig[10] = {list_pos:[{row:0,col:0},{row:0,col:1},{row:0,col:2},
                                       {row:1,col:0},{row:1,col:1},{row:1,col:2},
                                       {row:2,col:0},{row:2,col:1},{row:2,col:2}],type:9,num_cell:9};
        
        
        
        //PIECE 11  #####
        _aPieceConfig[11] = {list_pos:[{row:0,col:0},{row:0,col:1},{row:0,col:2},{row:0,col:3},{row:0,col:4}],type:4,num_cell:5};
        
        
        
        //PIECE 12  #
        //          #
        //          #
        //          #
        //          #
        _aPieceConfig[12] = {list_pos:[{row:0,col:0},{row:1,col:0},{row:2,col:0},{row:3,col:0},{row:4,col:0}],type:4,num_cell:5};
        
        
        
        //PIECE 13    #
        //            #
        //          ###
        _aPieceConfig[13] = {list_pos:[{row:0,col:2},{row:1,col:2},{row:2,col:0},{row:2,col:1},{row:2,col:2}],type:6,num_cell:5};
        
        
        //PIECE 14  ###
        //            #
        //            #
        _aPieceConfig[14] = {list_pos:[{row:0,col:0},{row:0,col:1},{row:0,col:2},{row:1,col:2},{row:2,col:2}],type:6,num_cell:5};
        
        
        //PIECE 15  ###
        //          #
        //          #
        _aPieceConfig[15] = {list_pos:[{row:0,col:0},{row:0,col:1},{row:0,col:2},{row:1,col:0},{row:2,col:0}],type:6,num_cell:5};
        
        
        //PIECE 16  ##
        //          ##
        _aPieceConfig[16] = {list_pos:[{row:0,col:0},{row:0,col:1},{row:1,col:0},{row:1,col:1}],type:7,num_cell:4};
        
        
        //PIECE 17  #
        //          #
        //          #
        //          #
        _aPieceConfig[17] = {list_pos:[{row:0,col:0},{row:1,col:0},{row:2,col:0},{row:3,col:0}],type:3,num_cell:4};
        
        
        //PIECE 18  #
        //          #
        //          ###
        _aPieceConfig[18] = {list_pos:[{row:0,col:0},{row:1,col:0},{row:2,col:0},{row:2,col:1},{row:2,col:2}],type:6,num_cell:5};
        
        
        NUM_PIECES = _aPieceConfig.length;
       
       
       
       ////////////////////////////

       
    };
    
        
    this.getRandPieceInfos = function(){
        var iRand = Math.floor(Math.random()*NUM_PIECES);
        
        return _aPieceConfig[iRand];
    };

    
    this._init();
}

