function CModeMenu() {
    var _oBg;
    var _oContainerEasy;
    var _oContainerNormal;
    var _oContainerHard;
    var _oTextEasy;
    var _oButEasy;
    var _oTextMedium;
    var _oButMedium;
    var _oTextHard;
    var _oButHard;
    var _oTextTop;

    var _oParent;

    var _oFade;


    this._init = function () {
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_mode_menu'));
        s_oStage.addChild(_oBg);

        _oTextTop = new CTLText(s_oStage,
            CANVAS_WIDTH / 2 - 500, 220, 1000, 100,
            100, "center", PRIMARY_FONT_COLOUR, SECONDARY_FONT, 1,
            0, 0,
            TEXT_TOP_MODE,
            true, true, false,
            false);


        var oTablePos = {
            x: CANVAS_WIDTH / 2,
            y: 300
        };

        _oContainerEasy = new createjs.Container();
        _oContainerEasy.x = oTablePos.x;
        _oContainerEasy.y = oTablePos.y + 120;

        _oContainerNormal = new createjs.Container();
        _oContainerNormal.x = oTablePos.x;
        _oContainerNormal.y = oTablePos.y + 550;

        _oContainerHard = new createjs.Container();
        _oContainerHard.x = oTablePos.x;
        _oContainerHard.y = oTablePos.y + 980;

        _oTextEasy = new CTLText(_oContainerEasy,
            -160, -40, 320, 50,
            50, "center", PRIMARY_FONT_COLOUR, SECONDARY_FONT, 1,
            0, 0,
            TEXT_EASY,
            true, true, false,
            false);

        var oSprite = s_oSpriteLibrary.getSprite('mod_easy_icon');
        _oButEasy = new CGfxButton(oTablePos.x, oTablePos.y + 280, oSprite, s_oStage);
        _oButEasy.addEventListener(ON_MOUSE_UP, this._selectEasy, this);

        _oTextMedium = new CTLText(_oContainerNormal,
            -160, -40, 320, 50,
            50, "center", PRIMARY_FONT_COLOUR, SECONDARY_FONT, 1,
            0, 0,
            TEXT_MEDIUM,
            true, true, false,
            false);

        var oSprite = s_oSpriteLibrary.getSprite('mod_medium_icon');
        _oButMedium = new CGfxButton(oTablePos.x, oTablePos.y + 710, oSprite, s_oStage);
        _oButMedium.addEventListener(ON_MOUSE_UP, this._selectMedium, this);

        _oTextHard = new CTLText(_oContainerHard,
            -160, -40, 320, 50,
            50, "center", PRIMARY_FONT_COLOUR, SECONDARY_FONT, 1,
            0, 0,
            TEXT_HARD,
            true, true, false,
            false);

        var oSprite = s_oSpriteLibrary.getSprite('mod_hard_icon');
        _oButHard = new CGfxButton(oTablePos.x, oTablePos.y + 1140, oSprite, s_oStage);
        _oButHard.addEventListener(ON_MOUSE_UP, this._selectHard, this);

        s_oStage.addChild(_oContainerEasy, _oContainerNormal, _oContainerHard);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        s_oStage.addChild(_oFade);

        createjs.Tween.get(_oFade).to({
            alpha: 0
        }, 400).call(function () {
            _oFade.visible = false;
        });

    };


    this._selectEasy = function () {
        gamedifficulty = "BEGINNER";
        timemode = 0;
        this._SendAPI();

        _oParent.unload();
        $(s_oMain).trigger("start_level", 1);
        s_oMain.gotoGame(0);
    };

    this._selectMedium = function () {
        gamedifficulty = "INTERMEDIATE";
        timemode = 0;
        this._SendAPI();

        _oParent.unload();
        $(s_oMain).trigger("start_level", 1);
        s_oMain.gotoGame(1);
    };

    this._selectHard = function () {
        gamedifficulty = "ADVANCED";
        timemode = 0;
        this._SendAPI();

        _oParent.unload();
        $(s_oMain).trigger("start_level", 1);
        s_oMain.gotoGame(2);
    };

    this._SendAPI = function () {
        Skillprint.LevelStart();
    }
    this.unload = function () {
        s_oStage.removeAllChildren();
        _oBg = null;
    };

    this._onAudioToggle = function () {
        createjs.Sound.setMute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    _oParent = this;
    this._init();
}