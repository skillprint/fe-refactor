var PopupConfirm = function(o = {}){

	var me = this;

	var canvas = document.getElementById("canvas_popups");
	var stage = BlitStage(canvas, {webgl:false});
	
	var frame = stage.addChild(new lib.popup_confirm);
	var IsLocked = true;

	var callback_cancel = o.callback_cancel || function(){};
	var callback_ok = o.callback_ok || function(){};

	//---------------------------
	// init
	//---------------------------

	this.doInit = function(){
		me.forget=false;
		update_queue.push(me);
		me.doResizeUpdate();
		RESIZER.needUpdate = true;

		trace(frame.panel.txt);

		__utils.doText(frame.panel.txt, oLANG[o.msg]);

		frame.panel.b_ok.helper = new __utils.ButtonHelper(stage, frame.panel.b_ok, "norm", "over");
		frame.panel.b_ok.addEventListener("click", me.doChooseOk);

		frame.panel.b_cancel.helper = new __utils.ButtonHelper(stage, frame.panel.b_cancel, "norm", "over");
		frame.panel.b_cancel.addEventListener("click", me.doChooseCancel);

		canvas.style.display = "block";

	}



	this.doChooseCancel =  function(){
		__snds.playSound("snd_click_2", "ui");
		me.doDestroy();
		callback_cancel();	
	}

	this.doChooseOk =  function(){
		__snds.playSound("snd_click_2", "ui");
		me.doDestroy();
		callback_ok();

	}


	this.doDestroy = function(){
		stage.removeAllChildren();
		stage.enableMouseOver(0);
		me.forget = true;
		stage.needUpdate = true;
		canvas.style.display = "none";
	}
 


	//------------------------
	// resize
	//------------------------

	this.doResizeUpdate = function(){

		//recache
		if(me.scale != oSTAGE.scale){
			
		}

		frame.panel.x = oSTAGE.game_center_x;
		frame.panel.y = oSTAGE.game_center_y;



		frame.x = oSTAGE.game_width_margins;
		frame.y = oSTAGE.game_height_margins;
		me.scale = oSTAGE.scale;
	}
	

	me.doInit();

}