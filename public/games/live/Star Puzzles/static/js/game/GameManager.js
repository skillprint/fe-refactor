var LinePuzzleGameManager = function () {
  var me = this;

  this.doNewGame =  function(){
    //nothing to do here for this one

  }

  this.doGetPuzzle =  function(which){
 
    //structure -> "node1.order, node1.X, node2.Y|node2.order, node2.X, node2.Y|...|?line1.sourceNode.order, line1.destinationNode.order, line1.direction|line1.sourceNode.order, line2.destinationNode.order, line2.direction|...|
    //ex -> "80,210,330|90,210,930|355,870,330|365,870,930|?355,80,0|365,355,0|90,365,0|80,90,0|"

    var puzzle_data = oCONFIG.puzzles[which-1];
    var node_data = puzzle_data.split("?")[0];
    var line_data = puzzle_data.split("?")[1];
    
    var nodes = node_data.split("|");
    var lines = line_data.split("|");
    
    var minx = Infinity;
    var miny = Infinity;
    var maxx = 0;
    var maxy = 0;

    var puzzle = {};
    puzzle.dots = [];
    puzzle.lines = [];

    for(let i=0; i<nodes.length; i++){
      let node = nodes[i].split(",");
      if(node.length == 3){
        
        let dot = {};
        dot.myid = parseInt(node[0]);
        dot.myx = parseInt(node[1]);
        dot.myy = parseInt(node[2]);

        minx = Math.min(minx, dot.myx);
        miny = Math.min(miny, dot.myy);
        maxx = Math.max(maxx, dot.myx);
        maxy = Math.max(maxy, dot.myy);
        
        puzzle.dots.push(dot);
      }
    }

    for(let i=0; i<lines.length; i++){
      let node = lines[i].split(",");
      if(node.length == 3){
        let line = {};
        line.pt1 = parseInt(node[0]);
        line.pt2 = parseInt(node[1]);
        line.connected = false;
        puzzle.lines.push(line);
      }
    }

    //adjust to center
    puzzle.boundsx = Math.abs(maxx - minx);
    puzzle.boundsy = Math.abs(maxy - miny);
    puzzle.size = Math.max(puzzle.boundsx, puzzle.boundsy);

    let offsetx = (minx + maxx) * 0.5;
    let offsety = (miny + maxy) * 0.5;

    for(let i=0; i<puzzle.dots.length;i++){
      puzzle.dots[i].myx = (puzzle.dots[i].myx - offsetx);
      puzzle.dots[i].myy = (puzzle.dots[i].myy - offsety);
    }

    return puzzle;

  }

};