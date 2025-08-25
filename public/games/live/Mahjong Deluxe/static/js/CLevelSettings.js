function CLevelSettings(oJson){
    var _aLayoutInfos;
    var _aTileValues;
    var _aLayoutNames; 
    var _oJson;
    
    
    this._init = function(oJson){
        _oJson = oJson;
        NUM_LEVELS = Object.keys(_oJson).length;

        _aLayoutInfos = new Array();
        _aLayoutNames = new Array();
        for(var i=0;i<NUM_LEVELS;i++){
            _aLayoutInfos[i] = _oJson[i];
            _aLayoutNames[i] = _aLayoutInfos[i].label;
        }

        _aTileValues = new Array("circle1", "circle1", "circle1", "circle1",
                                    "circle2", "circle2", "circle2", "circle2",
                                    "circle3", "circle3", "circle3", "circle3",
                                    "circle4", "circle4", "circle4", "circle4",
                                    "circle5", "circle5", "circle5", "circle5",
                                    "circle6", "circle6", "circle6", "circle6",
                                    "circle7", "circle7", "circle7", "circle7",
                                    "circle8", "circle8", "circle8", "circle8",
                                    "circle9", "circle9", "circle9", "circle9",
                                    "bamboo1", "bamboo1", "bamboo1", "bamboo1",
                                    "bamboo2", "bamboo2", "bamboo2", "bamboo2",
                                    "bamboo3", "bamboo3", "bamboo3", "bamboo3",
                                    "bamboo4", "bamboo4", "bamboo4", "bamboo4",
                                    "bamboo5", "bamboo5", "bamboo5", "bamboo5",
                                    "bamboo6", "bamboo6", "bamboo6", "bamboo6",
                                    "bamboo7", "bamboo7", "bamboo7", "bamboo7",
                                    "bamboo8", "bamboo8", "bamboo8", "bamboo8",
                                    "bamboo9", "bamboo9", "bamboo9", "bamboo9",
                                    "characters1", "characters1", "characters1", "characters1",
                                    "characters2", "characters2", "characters2", "characters2",
                                    "characters3", "characters3", "characters3", "characters3",
                                    "characters4", "characters4", "characters4", "characters4",
                                    "characters5", "characters5", "characters5", "characters5",
                                    "characters6", "characters6", "characters6", "characters6",
                                    "characters7", "characters7", "characters7", "characters7",
                                    "characters8", "characters8", "characters8", "characters8",
                                    "characters9", "characters9", "characters9", "characters9",
                                    "wind1", "wind1", "wind1", "wind1",
                                    "wind2", "wind2", "wind2", "wind2",
                                    "wind3", "wind3", "wind3", "wind3",
                                    "wind4", "wind4", "wind4", "wind4",
                                    "dragon1", "dragon1", "dragon1", "dragon1",
                                    "dragon2", "dragon2", "dragon2", "dragon2",
                                    "dragon3", "dragon3", "dragon3", "dragon3",
                                    "flower1", "flower2", "flower3", "flower4",
                                    "season1", "season2", "season3", "season4");                       
    };
    
    this.getLayoutInfos = function(iIndex){
        return _aLayoutInfos[iIndex];
    };
    
    this.getShuffledTiles = function(){
        _aTileValues  = shuffle(_aTileValues);      
        return _aTileValues;
    };
    
    this.getLayoutNames = function(){
        return _aLayoutNames;
    };
    
    this._init(oJson);
}