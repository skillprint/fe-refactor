using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.IO;
public class Coloring : MonoBehaviour {

	public static Coloring myInstance;
	public static Coloring Instance
	{
		get{
			if(myInstance==null)
				myInstance=FindObjectOfType(typeof(Coloring)) as Coloring;
			return myInstance;
		}
	}
	public GUISkin customSkin;
	public GUIStyle customStyle;
	private Rect imageRect,palleteRect,selRect,unDoRect,saveRect,shareRect,topBannerRect,topWhiteRect,bannerRect,fbRect,instaRect,shareMessageRect,
	shareEmailRect,homeRect,popUpRect,startoverRect,ContinueRect,OrRect,toneRect,lockColorRect,shareTextRect,homeTextRect,undoTextRect,
	saveImageRect,saveImgTextRect,inappPopupRect,premiumRect,IAPColorsRect,origImgRect,closeIAPRect,saveToGallRect,closeShareRect,watermarkImageRect,rateRect;
	private Rect[] pencilRect,IAPRect; 
	public Texture2D selectedBorder,white,black,mainImage,testImage,selectedColor,unDo,shareFB,shareEmail,shareInsta,
	shareMessage,FBShare,home,popUpColor,fadedShare,fadedHome,fadedUndo,lockColor,saveImage,fadedsaveImg,transImg,IAPPopUp,Premium,priceBlock,restore,watermark,
	sharePopUp,rate,saveToGall,closeIAP,testwaterImage;
	public Texture2D[] pencils,pencilTones;
	private float scale_x,scale_y,baseRes_X,baseRes_Y;
	int TouchCount;
	Touch firstTouch,secondTouch;
	bool[] pencilSelection;
	bool[] topSelection;
	bool colorSelected,showInapp,sendMail,sendSMS,moveToShare;
	GUIStyle popUpStyle;
	Color32 fillColor;
	List<string> Pricing = new List<string> ();

	public enum TouchEvent{Panning,Zooming,None};
	TouchEvent currentEvent,previousEvent;
	string[] categories ={"MANDALAS","ANIMALS","FLOWERS","WORLDCULTURES","ANTISTRESS"};
	string uploadedImgPath;
	string domain="http://www.koulumb.com/colorjoy/";
	string sharingDomain="http://apple.co/1XmQW30";
	#if UNITY_ANDROID
	AndroidJavaObject androidClass;
	#endif
	public Vector2 selRectPos,selRectDim;
	void skillprint_complete()
	{
		Dictionary<string,string> t = new Dictionary<string, string>();
		t.Add("event", "LEVEL_COMPLETE");
		Skillprint.sendTelemetry(t);
	}
	void skillprint_tap(Color32 fillColor)
	{
		Dictionary<string, string> t = new Dictionary<string, string>();
		t.Add("event", "TAP");
		t.Add("color", fillColor.r.ToString() + "," + fillColor.g.ToString() + "," + fillColor.b.ToString());
		Skillprint.sendTelemetry(t);
	}
	void skillprint_select(Color32 fillColor)
	{
		Dictionary<string, string> t = new Dictionary<string, string>();
		t.Add("event", "SELECT");
		t.Add("color", fillColor.r.ToString() + "," + fillColor.g.ToString() + "," + fillColor.b.ToString());
		Skillprint.sendTelemetry(t);
	}
	void skillprint_start()
	{
		Dictionary<string, string> t = new Dictionary<string, string>();
		t.Add("event", "LEVEL_START");
		t.Add("pattern", DataManager.Instance.selectedFileName);
		Skillprint.sendTelemetry(t);
	}
	void OnDestroy()
    {
		skillprint_complete();
    }
	IEnumerator UploadImage()
	{
		WWWForm imgUploadForm = new WWWForm ();
		imgUploadForm.AddBinaryData("img",testwaterImage.EncodeToPNG(),"abcd");
		WWW imageUploadURL=new WWW(domain+"imageupload.php",imgUploadForm);
		yield return imageUploadURL;
		if (imageUploadURL.isDone) 
		{
			if(imageUploadURL.error==null)
			{
				Debug.Log(imageUploadURL.text.ToString());
				uploadedImgPath=imageUploadURL.text.ToString().Trim();
				uploadComplete=true;
			}
		}
	}
	bool uploadComplete=false;
	bool showWaterMark=false;
	bool waterMarkComeplete=false;
	Texture2D waterImage;
//	void MoveToShare()
//	{
//		moveToShare = false;
//	}
	void  DrawWatermark()
	{
		if(watermark==null)
			watermark=Resources.Load<Texture2D>(ImagePathHolder.LoadWaterMark());
//		testwaterImage = new Texture2D (watermark.width, watermark.height,TextureFormat.RGB24,false); 
//		testwaterImage.SetPixels (watermark.GetPixels ());
//		testwaterImage.Apply ();
		int idx = 0;
		Color[] wmm = watermark.GetPixels ();
		Color[] bgm = mainImage.GetPixels ();
		//			if(idx<0 || idx+wmm.Length-1>bgm.Length)return;
		for(int i=0;i<wmm.Length;i++){
			wmm[i+idx]=(wmm[i]*wmm[i].a+bgm[i+idx]*bgm[i+idx].a*(1-wmm[i].a))/(wmm[i].a+bgm[idx+i].a*(1-wmm[i].a));
		}
		watermark.SetPixels(bgm);
		watermark.Apply();
//		if(saveGalleryImage)
//		{
//			saveGalleryImage=false;
//			SaveToGallery();
//		}
//
//		int idx = (testwaterImage.width - mainImage.width) / 2;
//		int idy = (testwaterImage.height - mainImage.height) / 2;
//		for (int i=0; i<mainImage.width; i++) 
//		{
//			idx++;
//			idy=(testwaterImage.height - mainImage.height) / 2;
//			for (int j=0; j<mainImage.height; j++)
//			{
//				testwaterImage.SetPixel (idx, idy,mainImage.GetPixel(i,j));
//				idy++;
//			}	
//		}
//		testwaterImage.Apply ();	
//		showWaterMark = false;
//		waterMarkComeplete = true;
//		DataManager.Instance.waterMarkedImage = new Texture2D (watermark.width, watermark.height);
//		DataManager.Instance.waterMarkedImage.SetPixels (watermark.GetPixels ());
//		DataManager.Instance.waterMarkedImage.Apply ();
//		Application.LoadLevel("Share");
//		return mainImage;
	}
	
	
	//		waterImage.SetPixels32(pix1);
	////		tex1.Apply();
	//		waterImage.Apply();
	//		showWaterMark = false;
	//		waterMarkComeplete = true;
	//		return waterImage;
	////		imageRect = new Rect (170 * scale_x, 350 * scale_y, 1200 * scale_x, 1200 * scale_y);
	//
	//	}
	void DrawShare()
	{
		GUI.DrawTexture (new Rect (0, 0, Screen.width, Screen.height), transImg);
		if (((float)Screen.width / (float)Screen.height) > 0.7f) {
			GUI.DrawTexture (new Rect (200 * scale_x, 500 * scale_y, 1100 * scale_x, 1000 * scale_y), sharePopUp);
			GUI.DrawTexture (new Rect (1170 * scale_x, 520 * scale_y, 75 * scale_x, 60 * scale_y), closeIAP);
			GUI.DrawTexture (new Rect (475 * scale_x, 670 * scale_y, 150 * scale_x, 150 * scale_y), FBShare);
			GUI.DrawTexture (new Rect (875 * scale_x, 670 * scale_y, 150 * scale_x, 150 * scale_y), shareInsta);
			GUI.DrawTexture (new Rect (475 * scale_x, 920 * scale_y, 150 * scale_x, 150 * scale_y), shareEmail);
			GUI.DrawTexture (new Rect (875 * scale_x, 920 * scale_y, 150 * scale_x, 150 * scale_y), shareMessage);
			GUI.DrawTexture (new Rect (475 * scale_x, 1220 * scale_y, 150 * scale_x, 150 * scale_y), rate);
			GUI.DrawTexture (new Rect (875 * scale_x, 1220 * scale_y, 150 * scale_x, 150 * scale_y), saveToGall);
			customStyle.normal.textColor = Color.black;
			customStyle.fontSize = Mathf.CeilToInt (35 * scale_y);
			GUI.Label (new Rect (455 * scale_x, 830 * scale_y, 200 * scale_x, 100 * scale_y), "FACEBOOK", customStyle);
			GUI.Label (new Rect (855 * scale_x, 830 * scale_y, 200 * scale_x, 100 * scale_y), "INSTAGRAM", customStyle);
			GUI.Label (new Rect (485 * scale_x, 1080 * scale_y, 200 * scale_x, 100 * scale_y), "EMAIL", customStyle);
			GUI.Label (new Rect (875 * scale_x, 1080 * scale_y, 200 * scale_x, 100 * scale_y), "MESSAGE", customStyle);
			GUI.Label (new Rect (495 * scale_x, 1380 * scale_y, 200 * scale_x, 100 * scale_y), "RATE US", customStyle);
			GUI.Label (new Rect (905 * scale_x, 1380 * scale_y, 200 * scale_x, 100 * scale_y), "SAVE", customStyle);
		}
		else
		{
			
			GUI.DrawTexture (new Rect (200 * scale_x, 500 * scale_y, 1150 * scale_x, 1000 * scale_y), sharePopUp);
			GUI.DrawTexture (new Rect (1240 * scale_x, 520 * scale_y, 75 * scale_x, 60 * scale_y), closeIAP);
			GUI.DrawTexture (new Rect (475 * scale_x, 690 * scale_y, 150 * scale_x, 120 * scale_y), FBShare);
			GUI.DrawTexture (new Rect (875 * scale_x, 690 * scale_y, 150 * scale_x, 120 * scale_y), shareInsta);
			GUI.DrawTexture (new Rect (475 * scale_x, 940 * scale_y, 150 * scale_x, 120 * scale_y), shareEmail);
			GUI.DrawTexture (new Rect (875 * scale_x, 940 * scale_y, 150 * scale_x, 120 * scale_y), shareMessage);
			GUI.DrawTexture (new Rect (475 * scale_x, 1240 * scale_y, 150 * scale_x, 120 * scale_y), rate);
			GUI.DrawTexture (new Rect (875 * scale_x, 1240 * scale_y, 150 * scale_x, 120 * scale_y), saveToGall);
			customStyle.normal.textColor = Color.black;
			customStyle.fontSize = Mathf.CeilToInt (35 * scale_y);
			GUI.Label (new Rect (445 * scale_x, 830 * scale_y, 200 * scale_x, 100 * scale_y), "FACEBOOK", customStyle);
			GUI.Label (new Rect (845 * scale_x, 830 * scale_y, 200 * scale_x, 100 * scale_y), "INSTAGRAM", customStyle);
			GUI.Label (new Rect (485 * scale_x, 1080 * scale_y, 200 * scale_x, 100 * scale_y), "EMAIL", customStyle);
			GUI.Label (new Rect (855 * scale_x, 1080 * scale_y, 200 * scale_x, 100 * scale_y), "MESSAGE", customStyle);
			GUI.Label (new Rect (475 * scale_x, 1380 * scale_y, 200 * scale_x, 100 * scale_y), "RATE US", customStyle);
			GUI.Label (new Rect (885 * scale_x, 1380 * scale_y, 200 * scale_x, 100 * scale_y), "SAVE", customStyle);
			
		}
	}
	void DrawIAP()
	{
		GUI.DrawTexture (new Rect (0, 0, Screen.width, Screen.height), IAPPopUp);


		customSkin.customStyles [0].alignment = TextAnchor.MiddleCenter;
		customSkin.customStyles [0].normal.textColor = Color.black;
		customSkin.customStyles [0].fontSize = Mathf.CeilToInt (105 * scale_y);
		GUI.Label(new Rect (630 * scale_x, 85 * scale_y, 250 * scale_x, 180 * scale_y),"STORE",customSkin.customStyles[0]);
		closeIAPRect = new Rect (1280 * scale_x, 105 * scale_y, 95 * scale_x, 100 * scale_y);
		GUI.DrawTexture (new Rect (1280 * scale_x, 105 * scale_y, 95 * scale_x, 100 * scale_y), closeIAP);
		customStyle.fontSize = Mathf.CeilToInt (66 * scale_y);
		customStyle.normal.textColor = Color.black;
		Debug.Log (customSkin.customStyles [0].alignment);
		customSkin.customStyles [0].normal.textColor = Color.white;
		customSkin.customStyles [0].fontSize = Mathf.CeilToInt (55 * scale_y);
		customSkin.customStyles [0].alignment = TextAnchor.MiddleLeft;
		for (int i=0; i<IAPRect.Length; i++) 
		{
			GUI.DrawTexture(IAPRect[i],priceBlock);
			switch(i)
			{
			case 0:GUI.Label(new Rect(IAPRect[i].x+50*scale_x,IAPRect[i].y+20*scale_y,IAPRect[i].width,IAPRect[i].height),"Unlock All Categories",customSkin.customStyles[0]);
				GUI.Label(new Rect(IAPRect[i].x+850*scale_x,IAPRect[i].y+20*scale_y,IAPRect[i].width,IAPRect[i].height),Pricing[0],customSkin.customStyles[0]);
					break;
			case 1:GUI.Label(new Rect(IAPRect[i].x+50*scale_x,IAPRect[i].y+20*scale_y,IAPRect[i].width,IAPRect[i].height),"Unlock All Colors",customSkin.customStyles[0]);
				GUI.Label(new Rect(IAPRect[i].x+850*scale_x,IAPRect[i].y+20*scale_y,IAPRect[i].width,IAPRect[i].height),Pricing[1],customSkin.customStyles[0]);
				    break;
			case 2:GUI.Label(new Rect(IAPRect[i].x+50*scale_x,IAPRect[i].y+20*scale_y,IAPRect[i].width,IAPRect[i].height),"Unlock Everything",customSkin.customStyles[0]);
				GUI.Label(new Rect(IAPRect[i].x+850*scale_x,IAPRect[i].y+20*scale_y,IAPRect[i].width,IAPRect[i].height),Pricing[2],customSkin.customStyles[0]);
					break;
			}
		}
//		GUI.Label (new Rect (210*scale_x,765*scale_y,300*scale_x,200*scale_y), "ALL COLORS",customStyle);
//		GUI.Label (new Rect (210*scale_x,885*scale_y,300*scale_x,200*scale_y), "MANDALAS",customStyle);
//		GUI.Label (new Rect (210*scale_x,1005*scale_y,300*scale_x,200*scale_y), "ANIMALS",customStyle);
//		//		GUI.Label (new Rect (210*scale_x,1125*scale_y,300*scale_x,200*scale_y), "ARTS",customStyle);
//		GUI.Label (new Rect (210*scale_x,1125*scale_y,300*scale_x,200*scale_y), "FLOWERS",customStyle);
//		GUI.Label (new Rect (210*scale_x,1245*scale_y,300*scale_x,200*scale_y), "WORLD CULTURES",customStyle);
//		GUI.Label (new Rect (210*scale_x,1365*scale_y,300*scale_x,200*scale_y), "ANTI-STRESS THERAPY",customStyle);
//		GUI.DrawTexture (new Rect (1080 * scale_x, 750 * scale_y, 220 * scale_x, 100 * scale_y), priceBlock);
//		GUI.DrawTexture (new Rect (1080 * scale_x, 870 * scale_y, 220 * scale_x, 100 * scale_y), priceBlock);
//		GUI.DrawTexture (new Rect (1080 * scale_x, 990 * scale_y, 220 * scale_x, 100 * scale_y), priceBlock);
//		//		GUI.DrawTexture (new Rect (1080 * scale_x, 1110 * scale_y, 220 * scale_x, 100 * scale_y), priceBlock);
//		GUI.DrawTexture (new Rect (1080 * scale_x, 1110 * scale_y, 220 * scale_x, 100 * scale_y), priceBlock);
//		GUI.DrawTexture (new Rect (1080 * scale_x, 1230 * scale_y, 220 * scale_x, 100 * scale_y), priceBlock);
//		GUI.DrawTexture (new Rect (1080 * scale_x, 1350 * scale_y, 220 * scale_x, 100 * scale_y), priceBlock);
//		customStyle.fontSize = Mathf.CeilToInt (65 * scale_y);
//		customStyle.normal.textColor = Color.white;
//		GUI.Label (new Rect (1100 * scale_x, 765 * scale_y, 200 * scale_x, 150 * scale_y), "$0.99", customStyle); 
//		GUI.Label (new Rect (1100 * scale_x, 885 * scale_y, 200 * scale_x, 150 * scale_y), "$0.99", customStyle); 
//		GUI.Label (new Rect (1100 * scale_x, 1005 * scale_y, 200 * scale_x, 150 * scale_y), "$0.99", customStyle); 
//		GUI.Label (new Rect (1100 * scale_x, 1125 * scale_y, 200 * scale_x, 150 * scale_y), "$0.99", customStyle); 
//		GUI.Label (new Rect (1100 * scale_x, 1245 * scale_y, 200 * scale_x, 150 * scale_y), "$0.99", customStyle); 
//		GUI.Label (new Rect (1100 * scale_x, 1365 * scale_y, 200 * scale_x, 150 * scale_y), "$0.99", customStyle); 
		//		GUI.Label (new Rect (1100 * scale_x, 1485 * scale_y, 200 * scale_x, 150 * scale_y), "$0.99", customStyle); 
		//		GUI.DrawTexture (new Rect (630 * scale_x, 1600 * scale_y, 250 * scale_x, 60 * scale_y), restore);
	} 
	Color GetColorFromString(string color)
	{

		string[] strings = color.Substring(1,color.Length-2).Split(","[0] );

		Color output=Color.blue;
		for (int i = 0; i < 4; i++) {
			output[i] = System.Single.Parse(strings[i]);
		}
		return output;
	}
	void DrawSavedImage()
	{
		GUI.DrawTexture (new Rect (0, 0, Screen.width, Screen.height), transImg);
		popUpStyle = new GUIStyle (GUI.skin.label);
		popUpStyle.normal.textColor = Color.black;
		GUI.DrawTexture (new Rect (0, 0, Screen.width, Screen.height),popUpColor);
		popUpStyle.fontSize = 20;
		customSkin.customStyles[0].font=Resources.Load<Font>("font/calibri");
		customSkin.customStyles [0].fontSize = Mathf.CeilToInt(110 * scale_y);
		customSkin.customStyles [0].normal.textColor = GetColorFromString(ImagePathHolder.LoadPopUpButtonColors()[0]);
//		GUI.Label (startoverRect, "START OVER", customSkin.customStyles[0]);
		GUI.Label (startoverRect,ImagePathHolder.LoadPopUpButtonNames()[0], customSkin.customStyles[0]);
		//		customSkin.customStyles [0].normal.textColor = Color.red;
		//		GUI.Label (OrRect, "OR", customSkin.customStyles[0]);
		customSkin.customStyles [0].normal.textColor = GetColorFromString(ImagePathHolder.LoadPopUpButtonColors()[1]);
//		GUI.Label (ContinueRect, "CONTINUE",customSkin.customStyles[0]);
		GUI.Label (ContinueRect,ImagePathHolder.LoadPopUpButtonNames()[1],customSkin.customStyles[0]);
	}
	void MessagePosted()
	{
		//		eagerShare=false;
		//		showShares = false;
		palleteRect.y=2048*scale_y;
		bannerRect.y=1848*scale_y;
		//		shareMessageRect.y =
		shareEmailRect.y = fbRect.y = instaRect.y = 1898 * scale_y;
		StartCoroutine(HidePallete(palleteRect,!hideBanner,(2048*scale_y),(1848*scale_y)));
	}
	void ShowShareBanner()
	{
		colorSelected = false;
		palleteRect.y=1848*scale_y;
		//		shareMessageRect.y = 
		shareEmailRect.y = fbRect.y = instaRect.y =bannerRect.y=2048*scale_y;
		StartCoroutine(HidePallete(palleteRect,hideBanner,(1848*scale_y),(2048*scale_y)));
	}
	bool showSavedPopUp=false;
	// Use this for initialization
	void LoadSavedImage()
	{
		showSavedPopUp=false;
		string testFile = "";
		testFile = DataManager.Instance.selectedFileName;//get file-name of selected image in categories
		mainImage=new Texture2D(testImage.width, testImage.height);

		Debug.Log (testFile);
		//		if (DataManager.Instance != null)
		mainImage.LoadImage (DataManager.Instance.FileReaderBytes (testFile));// load image colors of original image into image for coloring
		
		mainImage.Apply ();
	}
	void LoadActualImage()
	{
		PlayerPrefs.SetInt (DataManager.Instance.selectedFileName, 0);
		showSavedPopUp=false;
		testImage = Resources.Load <Texture2D>(DataManager.Instance.selectedResourceName);
		mainImage = new Texture2D (testImage.width, testImage.height);
		mainImage.SetPixels (testImage.GetPixels ());
		mainImage.Apply ();
	}
	void OnFBInitiated()
	{
		Debug.Log("Fb initialized");
	}
	
	void Start () {
		//		testImage = Resources.Load<Texture2D> (PathStorage.GetFilePathInResource (DataManager.Instance.selectedFileName));
		//		FB.Init (OnFBInitiated, null, null);
		if(DataManager.Instance!=null)
			//Debug.Log (DataManager.Instance.selectedFileName);
		testImage = new Texture2D (1024, 1024, TextureFormat.PVRTC_RGBA4, false);
		testImage.LoadImage (DataManager.Instance.FileReaderBytes (DataManager.Instance.selectedFileName));
		testImage.Apply ();
//		testImage = Resources.Load<Texture2D> (DataManager.Instance.selectedResourceName);
		if (!DataManager.Instance.fromDrawings&&PlayerPrefs.GetInt (DataManager.Instance.selectedFileName)>0) {
			showSavedPopUp=true;
		}
//		
		Init ();

		//AdManager.SharedManager.HideBanner ();
		skillprint_start();
	}
	void PrepareAttachment()
	{
		System.IO.File.WriteAllBytes (Application.persistentDataPath+"/tempImage.png",mainImage.EncodeToPNG ());
		uploadedImgPath = Application.persistentDataPath + "/tempImage.png";
		if (sendMail) {
			sendMail=!sendMail;
			SendMail();
		}
	}
	void SendMail()
	{
		//		Application.OpenURL("mailto:"+"?subject=Check%20out%20this%20image&body="+uploadedImgPath); 
		
		uploadComplete = false;
		showSharePopUp = false;
		sendMail = false;
		SendMailWithAttachment.SendMailAttach("Check this coloring app, it is awesome! "+sharingDomain,testwaterImage.EncodeToPNG());
		
	}
	void SendSMS()
	{
		//		if (Application.platform == RuntimePlatform.IPhonePlayer) 
		//		{
		//			Application.OpenURL("sms:"+"&body="+uploadedImgPath+"%20Check%20out%20this%20image%20made%20through%20this%20new%20application%20called%20Color%20Joy!");
		//		}
		
		uploadComplete = false;
		showSharePopUp = false;
		sendSMS = false;
		SendMailWithAttachment.SendMessageWithImage("Check this coloring app, it is awesome! "+sharingDomain,testwaterImage.EncodeToPNG());
		
	}
	bool hitOnthis = false;
	bool FadeButton(Rect rt)
	{
		if (rt.Contains (new Vector2 (Input.mousePosition.x, (Screen.height - Input.mousePosition.y))) && Input.GetMouseButtonDown (0)) {

			hitOnthis=true;
		}
		if (rt.Contains (new Vector2 (Input.mousePosition.x, (Screen.height - Input.mousePosition.y))) && Input.GetMouseButton (0)) {
			//			hitOnthis=true;
		}
		if (hitOnthis && rt.Contains (new Vector2 (Input.mousePosition.x, (Screen.height - Input.mousePosition.y))) && Input.GetMouseButtonUp (0)) {
			hitOnthis = false;
			for (int i=0; i<topSelection.Length; i++)
				topSelection [i] = false;
			//Debug.Log(!hitOnthis);
			return (!hitOnthis);
		}
		else if (hitOnthis && Input.GetMouseButtonUp (0))
		{
			for (int i=0; i<topSelection.Length; i++)
				topSelection [i] = false;
			return false;
		}
		return false;
	}
	bool ButtonFade(Rect rt,int index)
	{
		
		if (rt.Contains (new Vector2 (Input.mousePosition.x, (Screen.height - Input.mousePosition.y))) && Input.GetMouseButtonDown (0)) {
			if(index>=0)
				topSelection[index]=true;
			hitOnthis=true;
		}
		if (rt.Contains (new Vector2 (Input.mousePosition.x, (Screen.height - Input.mousePosition.y))) && Input.GetMouseButton (0)) {
			//			hitOnthis=true;
		}
		if (hitOnthis && rt.Contains (new Vector2 (Input.mousePosition.x, (Screen.height - Input.mousePosition.y))) && Input.GetMouseButtonUp (0)) {
			hitOnthis = false;
			for (int i=0; i<topSelection.Length; i++)
				topSelection [i] = false;
			//Debug.Log(!hitOnthis);
			return (!hitOnthis);
		}
		else if (hitOnthis && Input.GetMouseButtonUp (0))
		{
			for (int i=0; i<topSelection.Length; i++)
				topSelection [i] = false;
			return false;
		}
		return false;
	}
	void FindPixelWithinTone(int hitPixelX,int hitPixelY )
	{
		colorSelected=true;
		colorHolds=true;
		float startPixelToneX, startPixelToneY,startPixelToneW,startPixelToneH;
		startPixelToneX = 0;
		startPixelToneY = toneRect.y;
		startPixelToneW = toneRect.width / 11f;
		startPixelToneH = toneRect.height;
		do
		{
			if(hitPixelX>startPixelToneX&&hitPixelX<(startPixelToneX+startPixelToneW))	
			{
				break;
			}
			else
			{
				startPixelToneX+=startPixelToneW;
			}
		}while(startPixelToneX<Screen.width);
		selRect.x = startPixelToneX;
		selRect.y = startPixelToneY;
		selRect.width = toneRect.width / 11f;
		selRect.height = startPixelToneH;
		
	}

	public Vector2 firstTouchStart, secondTouchStart;
	public float startScale;
	void UpdateTouches()
	{
		TouchCount = Input.touchCount;
		if (TouchCount == 2)
		{
			firstTouch = Input.GetTouch(0);
			secondTouch = Input.GetTouch(1);
		}
		else if (Input.touchCount == 1)
		{
			firstTouch = Input.GetTouch(0);
		}
		else return;

		if (firstTouch.phase == TouchPhase.Began)
		{
			startScale = scale; 
			firstTouchStart = firstTouch.position;
		}
		if (secondTouch.phase == TouchPhase.Began) secondTouchStart = secondTouch.position;
	}
	int GetTouchStatus()
	{
		TouchCount = Input.touchCount;
		if (TouchCount == 1) 
		{
			
			if(firstTouch.phase==TouchPhase.Moved)//Panning
				return 1;
			else if(firstTouch.phase==TouchPhase.Ended)//coloring
				return 2;
			
			
		}
		if (TouchCount == 2) 
		{
			firstTouch = Input.GetTouch (0);
			secondTouch = Input.GetTouch (1);
			if(firstTouch.phase==TouchPhase.Moved||secondTouch.phase==TouchPhase.Moved)//zooming
				return 3;
		}
		return 0;
	}
	void SaveToGallery()
	{
		showSharePopUp=false;
		#if UNITY_IPHONE&&!UNITY_EDITOR
		SaveImage.SaveToGallery(DataManager.Instance.selectedFileName,testwaterImage.EncodeToPNG());
		#endif
		#if UNITY_ANDROID
		AndroidJavaClass unityClass = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
		androidClass = new AndroidJavaObject("com.example.imagesave.SaveImageUnityBridge");
		androidClass.CallStatic("CallSaveImage",mainImage.EncodeToPNG());
		#endif
//		TextureScale.Bilinear (testwaterImage, 512, 512);
//		PlayerPrefs.SetInt ("SavedWaterMark", 1);
//		DataManager.Instance.StoreWatermark (testwaterImage.EncodeToPNG (), DataManager.Instance.selectedFileName);
//		StoreImageChange ();
	}
	void Init()
	{
		//		Chartboost.showInterstitial (CBLocation.Default);
		sendMail = sendSMS = false;
		TouchCount = 0;

		topSelection = new bool[4];
		for (int i=0; i<4; i++)
			topSelection [i] = false;
		mainImage = new Texture2D (testImage.width, testImage.height);
		mainImage.SetPixels (testImage.GetPixels ());
		mainImage.Apply ();
		//		testwaterImage = new Texture2D (watermark.width, watermark.height);
		//		testwaterImage.SetPixels (watermark.GetPixels ());
		//		testwaterImage.Apply ();
		baseRes_X = 1536f;
		baseRes_Y = 2048f;
		scale_y = Screen.height/baseRes_Y;
		scale_x = Mathf.Clamp(Screen.width / baseRes_X,scale_y/3f,scale_y/1.5f);

		float startX = (Screen.width - baseRes_X * scale_x) / 2;
		GUI.matrix = Matrix4x4.TRS (new Vector3(0, 0, 0), Quaternion.identity, new Vector3 (scale_x, scale_y, 1));
		colorSelected = false;
		showInapp = false;
		topWhiteRect = new Rect (0, 0, Screen.width, 220 * scale_y);
		topBannerRect = new Rect (0, 220*scale_y, Screen.width, 10 * scale_y);
		fbRect = new Rect (475 * scale_x, 670 * scale_y, 150 * scale_x, 200 * scale_y);
		//		shareEmailRect=new Rect (675 * scale_x, 1888 * scale_y, 150 * scale_x, 140 * scale_y);
		shareEmailRect = new Rect (475 * scale_x, 920 * scale_y, 150 * scale_x, 200 * scale_y);
		instaRect = new Rect (875 * scale_x, 670 * scale_y, 150 * scale_x, 200 * scale_y);
		//		instaRect=new Rect (875 * scale_x, 1888 * scale_y, 150 * scale_x, 140 * scale_y);
		//		shareMessageRect=new Rect (975 * scale_x, 1888 * scale_y, 150 * scale_x, 120 * scale_y);
		shareMessageRect = new Rect (875 * scale_x, 920 * scale_y, 150 * scale_x, 200 * scale_y);
		saveRect = new Rect (Screen.width - 250 * scale_x, 1600 * scale_y, 200 * scale_x, 200 * scale_y);
		toneRect = new Rect (0, 1948 * scale_y, Screen.width, 150 * scale_y);
		bannerRect=new Rect (startX, 1848 * scale_y, Screen.width, 200 * scale_y);
		pencilRect = new Rect[pencils.Length-1];
		saveToGallRect=new Rect (875 * scale_x, 1220 * scale_y, 150 * scale_x, 200 * scale_y);
		palleteRect = new Rect(0 * scale_x, 1848 * scale_y, Screen.width, 200 * scale_y);
		pencilSelection = new bool[pencilRect.Length];
		for (int pencilIndex=0; pencilIndex<pencils.Length-1; pencilIndex++) {
			pencilRect [pencilIndex] = new Rect (startX + (140* (pencilIndex)) * scale_x, 1808 * scale_y, 142 * scale_x, 255 * scale_y);
			pencilSelection[pencilIndex]=false;
		}
		if(scale_x==scale_y)
		{
			origImgRect=new Rect (startX+170 * scale_x, 350 * scale_y, 1200 * scale_x, 1200 * scale_y);
			watermarkImageRect = new Rect (startX+120 * scale_x, 320 * scale_y, 1300 * scale_x, 1300 * scale_y);
		}
		else
		{
			origImgRect=new Rect (startX+90 * scale_x, 350 * scale_y, 1350 * scale_x, 1000 * scale_y);
			watermarkImageRect = new Rect (startX+70 * scale_x, 320 * scale_y, 1450 * scale_x, 1040 * scale_y);
		}
		Pricing = ImagePathHolder.GetPricing ();
		imageRect = origImgRect;
		customSkin.customStyles[0].font=Resources.Load<Font>("font/calibri");
		customStyle.font=Resources.Load<Font>("font/calibri");
		selRect = new Rect (Screen.width / 2 - (50 * scale_x), 1600 * scale_y, 100 * scale_x, 100 * scale_y);
		inappPopupRect = new Rect (120 * scale_x, 420 * scale_y, 1300 * scale_x, 1150 * scale_y);
		saveImageRect = new Rect (910 * scale_x, 20 * scale_y, 155 * scale_x, 125 * scale_y);
		saveImgTextRect=new Rect (915 * scale_x, 165 * scale_y, 255 * scale_x, 225 * scale_y);
		homeRect = new Rect(startX+90 * scale_x, 45 * scale_y, 170 * scale_x, 125 * scale_y);
		homeTextRect = new Rect(startX+100 * scale_x, 165 * scale_y, 270 * scale_x, 125 * scale_y);
		unDoRect = new Rect(startX + 320 * scale_x, 45 * scale_y, 170 * scale_x, 125 * scale_y);
		undoTextRect = new Rect(700 * scale_x, 165 * scale_y, 250 * scale_x, 225 * scale_y);
		shareRect = new Rect();// startX+1310 * scale_x, 30 * scale_y, 165 * scale_x, 145 * scale_y);
		shareTextRect = new Rect();// 1315 * scale_x, 165 * scale_y, 155 * scale_x, 125 * scale_y);
		rateRect =new Rect (475 * scale_x, 1220 * scale_y, 250 * scale_x, 250 * scale_y);
		popUpRect = new Rect (165 * scale_x, 400 * scale_y, 1200 * scale_x, 950 * scale_y);
		startoverRect = new Rect (startX + 550 * scale_x, 650 * scale_y, 400 * scale_x, 300 * scale_y);
		ContinueRect = new Rect (startX + 560 * scale_x, 1050 * scale_y, 400 * scale_x, 300 * scale_y);
		closeIAPRect = new Rect (1220 * scale_x, 415 * scale_y, 175 * scale_x, 120 * scale_y);
		OrRect=new Rect(startoverRect.x+(20*scale_x),startoverRect.y + (150 * scale_y), startoverRect.width, startoverRect.height);
		selectedColor = new Texture2D (100, 100);
		usedColors=new Stack<Color32>(); 
		IAPColorsRect = new Rect (1020 * scale_x, 750 * scale_y, 220 * scale_x, 100 * scale_y);
		IAPRect = new Rect[3];
		for (int IAPindex=0; IAPindex<IAPRect.Length; IAPindex++)
			IAPRect [IAPindex] = new Rect (220 * scale_x, (700+(240*IAPindex)) * scale_y, 1080 * scale_x, 150 * scale_y);
		premiumRect = new Rect (180 * scale_x, 540 * scale_y, 1150 * scale_x, 180 * scale_y);
		if(((float)(Screen.width)/(float)(Screen.height))<0.7f)
			closeShareRect = new Rect (1210 * scale_x, 500 * scale_y, 175 * scale_x, 120 * scale_y);
		else
			closeShareRect = new Rect (1170 * scale_x, 520 * scale_y, 175 * scale_x, 120 * scale_y);
		if (DataManager.Instance.fromDrawings) 
		{
			LoadSavedImage();

		}
		GetUIImages ();
		Resources.UnloadUnusedAssets();
	}
	void GetUIImages()
	{
		List<string> UIIconPaths = new List<string> ();
		UIIconPaths = ImagePathHolder.LoadUIIcons ();
		foreach (string s in UIIconPaths) 
		{
			switch(UIIconPaths.IndexOf(s))
			{
			case 0:unDo=Resources.Load<Texture2D>(s);
				break;
			case 1: shareFB=Resources.Load<Texture2D>(s);
				break;
			case 2:home=Resources.Load<Texture2D>(s);
				break;
			case 3:closeIAP=Resources.Load<Texture2D>(s);
				break;
			}
		}
	}
	void TwitterShare()
	{
		eagerShare = false;
		//			TwitterSNS.Instance().PostImage(mainImage.EncodeToPNG(),"Shared via Color&Share! #colorandshare #colorapp");
	}
	void CreateWatermark()
	{
		if(watermark==null)
			watermark=Resources.Load<Texture2D>(ImagePathHolder.LoadWaterMark());
		testwaterImage = new Texture2D (watermark.width, watermark.height,TextureFormat.RGB24,false); 
		testwaterImage.SetPixels (watermark.GetPixels ());
		testwaterImage.Apply ();
		int idx = (testwaterImage.width - mainImage.width) / 2;
		int idy = (testwaterImage.height - mainImage.height) / 2;
		for (int i=0; i<mainImage.width; i++) 
		{
			idx++;
			idy=(testwaterImage.height - mainImage.height) / 2;
			for (int j=0; j<mainImage.height; j++)
			{
				testwaterImage.SetPixel (idx, idy,mainImage.GetPixel(i,j));
				idy++;
			}	
		}
		testwaterImage.Apply ();	
		showWaterMark = true;
		waterMarkComeplete = true;
		Debug.Log (testwaterImage.width);
		Debug.Log (testwaterImage.height);
//		

		if ((moveToShare&&oldFillers.Count>0)||DataManager.Instance.fromDrawings) 
		{
			DataManager.Instance.waterMarkedImage = testwaterImage.EncodeToPNG ();
			if(oldFillers.Count>0)
			StoreImageChange ();
			else if(DataManager.Instance.fromDrawings)
				DataManager.Instance.fromDrawings=false;

			//AdManager.SharedManager.ShowBanner ();
			DataManager.Instance.LoadScene("Share",0.25f);
//			AutoFade.LoadLevel ("Share", 0.25f, 0.25f, Color.white);
		}

//		if(saveGalleryImage)
//		{
//			saveGalleryImage=false;
//			SaveToGallery();
//		}
//		if (!showWaterMark&&fbshare) {
//			StartCoroutine(UploadImage());
//		}
//		if(!showWaterMark&&sendSMS)
//			SendSMS();
//		if(!showWaterMark&&sendMail)
//			SendMail();
//		if(!showWaterMark&&instaShare)
//			ShareToInstagram();
	}
	void ShareToInstagram()
	{
		instaShare = false;
		eagerShare = false;
		
		uploadComplete = false;
		showSharePopUp = false;
		Debug.Log (transform.name);
		#if UNITY_ANDROID
		AndroidJavaClass unityClass = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
		androidClass = new AndroidJavaObject("com.example.instagram.MainActivity");
		androidClass.Call("callbackToUnityMethod",mainImage.EncodeToPNG(), transform.name, "ImagePosted",unityClass.GetStatic<AndroidJavaObject>("currentActivity"));
		#endif
		#if UNITY_IOS
		InstagramShare.PostToInstagram("#tinge", testwaterImage.EncodeToPNG());
		#endif
		
		
	}
	void ImagePosted(string resp)
	{
		if(resp=="READY")
			MessagePosted ();
	}
	
	IEnumerator HidePallete(Rect hideRect,bool show,float startVal,float endVal)
	{
		float frameTime = 40.0f;
		float speed = Mathf.Abs(startVal-endVal) / frameTime;
		float speedforButts = Mathf.Abs (2048 * scale_y - 1898 * scale_y) / frameTime;
		hideRect.y = startVal;
		if (show) {
			while (palleteRect.y>endVal) {
				palleteRect.y -= speed;
				bannerRect.y+=speed;
				//								shareMessageRect.y+=speedforButts;
				shareEmailRect.y+=speedforButts;
				instaRect.y+=speedforButts;
				fbRect.y+=speedforButts;
				yield return new WaitForEndOfFrame ();
			}
		} 
		else
		{	
			while (palleteRect.y<endVal) {
				
				palleteRect.y += speed;
				bannerRect.y-=speed;
				//				shareMessageRect.y-=speedforButts;
				shareEmailRect.y-=speedforButts;
				instaRect.y-=speedforButts;
				fbRect.y-=speedforButts;
				yield return new WaitForEndOfFrame ();
			}
		}
		
		if (shareEmailRect.y >= 2048 * scale_y&&colorHolds)
			colorSelected = true;
	}
	void OnDisable()
	{
		
	}
	void HandleIAP()
	{
		
		if (ButtonHit (IAPRect[2])) 
		{
			
			if(InAppManager.Instance!=null)
				InAppManager.Instance.SetPremium();
			showInapp=false;
		}
		if (ButtonHit (IAPRect[1])) 
		{
			
			if(InAppManager.Instance!=null)
				InAppManager.Instance.SetUnlockedColors();
			showInapp=false;
		}
		if (ButtonHit (IAPRect[0])) 
		{
			if(InAppManager.Instance!=null)
				InAppManager.Instance.SetUnlockedCategory();
			showInapp=false;
		}
	}
	Stack<FillInfo> oldFillers = new Stack<FillInfo> ();
	bool isPanning=false;
	bool isZooming=false;
	bool colorHolds=false;
	bool eagerShare=false;
	bool fbshare=false;
	bool twitterShare=false;
	bool instaShare=false;
	
	void OnLoggedInFB()
	{
		eagerShare = false;
		//		if(isLoggedIn)
		
		uploadComplete = false;
		showSharePopUp = false;
		fbshare=false;
		
//		FacebookSNS.Instance ().PostStoryWithFeedDialog ("", "Image from Color Joy", "Check this Out!", "", uploadedImgPath, uploadedImgPath, uploadedImgPath);
		
		//		FacebookSNS.Instance ().PostImage (mainImage.EncodeToPNG (), "Shared via Color and Share! #colorandshare #colorapp");
		//		GFaceBook.Instance.PostPic("Shared via Tinge! #tinge #colorapp",mainImage.EncodeToPNG());
		
	}
	void FBShareCode()
	{
		//			eagerShare=true;
		//		if(GFaceBook.Instance.facebookLoginDone)
		//		if(isLoggedIn) 
		//		{
		
		fbshare=false;
		uploadComplete = false;

		
		showSharePopUp = false;
//		FacebookSNS.Instance ().PostStoryWithFeedDialog ("", "Image from Color Joy", "Check this Out!", "", uploadedImgPath, uploadedImgPath, uploadedImgPath);
		
		
		//		}
		//		else
		//		{
		//			FacebookSNS.Instance().Login();
		////			GFaceBook.Instance.Login();
		//		}
	}
	void TwitterShareCode()
	{
		//		if(TwitterSNS.Instance().IsUserLoggedIn())
		//		{
		//			eagerShare=false;
		//			twitterShare=false;
		//			TwitterSNS.Instance().PostImage(mainImage.EncodeToPNG(),"Shared via Tinge!");
		//			MessagePosted();
		//		}
		//		else
		//			TwitterSNS.Instance().Login();
	}
	bool showSharePopUp=false;
	int selectedToneIndex=-1;
	bool hideBanner=false;
	
	Vector2 NormalizeDeltaTouch(Touch t)
	{
		float dt=Time.deltaTime/t.deltaTime;
		if(float.IsNaN(dt)||float.IsInfinity(dt))
			dt=1f;
		return t.deltaPosition*dt;
	}
	public float scale = 1f;
	private float maxScale = 4f;
	private float minScale = 1f;
	
	void Pinch()
	{
		//Vector2 firstTouchPrevPos;
		//Vector2 secondTouchPrevPos;
		//if (firstTouch.phase == TouchPhase.Moved || secondTouch.phase == TouchPhase.Moved)
		//{
		//	firstTouchPrevPos = firstTouch.position - firstTouch.deltaPosition;
		//	secondTouchPrevPos = secondTouch.position - secondTouch.deltaPosition;
		//}
		//else  {
		//	firstTouchPrevPos = firstTouch.position;
		//	secondTouchPrevPos = secondTouch.position;
		//}

		float oldDistance = Vector2.Distance (firstTouchStart, secondTouchStart);
		float newDistance = Vector2.Distance (firstTouch.position, secondTouch.position);
		float scaleMagnitude = (newDistance/ oldDistance );
		scale = startScale * scaleMagnitude;
		scale = Mathf.Clamp(scale, minScale, maxScale);
		float newWidth = origImgRect.width * scale;
		float newHeight = origImgRect.height * scale;
		imageRect.x += (imageRect.width - newWidth) / 2;
		imageRect.y += (imageRect.height - newHeight) / 2;
		imageRect.width = newWidth;
		imageRect.height = newHeight;

		currentEvent = TouchEvent.Zooming;
		isZooming = true;
		colorHolds = false;
	}
	
	void Pan()
	{
		if (firstTouch.deltaPosition.magnitude > 5f && firstTouch.phase == TouchPhase.Moved)
		{
			//touch origin is bottom left, image origin is top left
			imageRect.x -= (firstTouch.deltaPosition.x);
			imageRect.y += (firstTouch.deltaPosition.y);
			currentEvent = TouchEvent.Panning;
			panTimer = 0.2f;
			isPanning = true;
			colorHolds = false;

		}
	}
	public float panTimer;
	bool saveGalleryImage=false;
	int currentTouchStatus;
	public bool isLoggedIn=false;
	void Update () {
#if UNITY_EDITOR
		//editor transform testing
		if (Input.GetKey(KeyCode.A))
		{
			imageRect.x += 10 * scale;
		}
		if (Input.GetKey(KeyCode.D))
		{
			imageRect.x -= 10 * scale;
		}
		if (Input.GetKey(KeyCode.W))
		{
			imageRect.y += 10 * scale;
		}
		if (Input.GetKey(KeyCode.S))
		{
			imageRect.y -= 10 * scale;
		}
		bool scaled = false;
		if (Input.GetKey(KeyCode.Q))
		{
			scale *= 1.1f;
			scaled = true;
		}
		if (Input.GetKey(KeyCode.E))
		{
			scale *= 0.9f;
			scaled = true;
		}
		if (scaled)
		{
			scale = Mathf.Clamp(scale, minScale, maxScale);
			float newWidth = origImgRect.width * scale;
			float newHeight = origImgRect.height * scale;
			imageRect.x += (imageRect.width - newWidth) / 2;
			imageRect.y += (imageRect.height - newHeight) / 2;
			imageRect.width = newWidth;
			imageRect.height = newHeight;
			scaled = false;
		}
#endif
		UpdateTouches();
		if (TouchCount>1) {
			colorHolds=false;
		}
		else if(colorSelected)
			colorHolds=true;
		//		if (sendSMS && uploadComplete && showSharePopUp)
		//			SendSMS ();
		//		if (sendMail && uploadComplete&&showSharePopUp)
		//			SendMail ();
		if (fbshare && uploadComplete && showSharePopUp)
			FBShareCode ();
		if (!isPanning && !showSavedPopUp && TouchCount == 2 && !showInapp && !showSharePopUp)
		{
			Pinch();
		}
		else if (!isZooming && !showSavedPopUp && TouchCount == 1 && !showInapp && !showSharePopUp)
		{
			Pan();
		}
		else if (isZooming && TouchCount == 1) {
			startScale = scale;
		}

		if (!showSavedPopUp&&!isZooming&&!isPanning&&!showInapp&&ButtonFade(homeRect,1)&&!showSharePopUp) {
			
			goHome=true;
			StoreImageChange();
		}
	
		if(showSharePopUp&&ButtonHit(saveToGallRect)&&!showInapp)
		{
			showWaterMark=true;
			saveGalleryImage=true;
		}
		
		//		if (GFaceBook.Instance.facebookLoginDone&&eagerShare&&fbshare) {
		if(eagerShare&&fbshare)
		{
//			FacebookSNS.Instance().Login();
			Debug.Log("Facebook Logged in");
			OnLoggedInFB();
			eagerShare=false;
			fbshare=false;
		}
		//		if (TwitterSNS.Instance ().IsUserLoggedIn ()&&eagerShare&&twitterShare) {
		//			TwitterShare();
		//			eagerShare=false;
		//			twitterShare=false;
		//				}
	
//		if ( ButtonFade (saveImageRect, 3)&&!showInapp&&!showSharePopUp) {
//			showWaterMark=true;
//			saveGalleryImage=true;
//						SaveToGallery();
//		}
		if (!showInapp&&!showSavedPopUp&&!isZooming&&!isPanning&&ButtonFade(shareRect,2)) {
			moveToShare=true;
			CreateWatermark();
//			DrawWatermark();
			//			showShares=true;
			//			eagerShare=!eagerShare;
			//			Debug.Log(showShares.ToString()+"ShowShares");
			//			Debug.Log(eagerShare.ToString()+"eagerShares");
			//			if(eagerShare)
			//			{
			//				Chartboost.showInterstitial(CBLocation.Default);
			//				ShowShareBanner();
			//			}
			//			else
			//				MessagePosted();
		}
		if (!showInapp && showSharePopUp && ButtonHit (closeShareRect)) {
			showSharePopUp = false;
			colorHolds=false;
		}
		if (panTimer > 0f) panTimer -= Time.deltaTime;
		if (!showInapp&&!showSavedPopUp&&colorHolds&&!isZooming&&!isPanning&&!eagerShare&&!ButtonFade(unDoRect,0)&&!ButtonFade(shareRect,2)&&!ButtonFade(homeRect,1)&&ButtonHit(imageRect)&&currentEvent==TouchEvent.None&&!showSharePopUp) {
			// color fill area based on selected color and store hit position and original color in stack
			if(panTimer<=0f&&colorHolds&&colorSelected&&(Screen.height - Input.mousePosition.y)>topBannerRect.y&&(Screen.height - Input.mousePosition.y)<(1808 * scale_y))
			{ 
				FloodFiller.RevisedQueueFloodFill(mainImage,Mathf.CeilToInt((Input.mousePosition.x-imageRect.x)*mainImage.width/imageRect.width),Mathf.CeilToInt(mainImage.height-( Screen.height-Input.mousePosition.y-imageRect.y)*(mainImage.height/(imageRect.height))),fillColor,false);
				usedColors.Push(FloodFiller.tarGetCol);
				oldFillers.Push (new FillInfo (FloodFiller.tarGetCol,Mathf.CeilToInt((Input.mousePosition.x-imageRect.x)*mainImage.width/imageRect.width),Mathf.CeilToInt(mainImage.height-( Screen.height-Input.mousePosition.y-imageRect.y)*(mainImage.height/(imageRect.height)))));
				mainImage.Apply();
				skillprint_tap(fillColor);
			}


		}


		if (TouchCount == 0 && firstTouch.phase == TouchPhase.Ended)
		{
			startScale = scale;
			currentEvent = TouchEvent.None;
			isPanning = false;
			isZooming = false;
		}

		for (int i=0; i< pencilRect.Length; i++) {
			
			if (!showInapp&&!showSavedPopUp&&!isZooming&&!isPanning&&ButtonHit (pencilRect [i])&&selectedToneIndex<0&&!eagerShare&&!showInapp&&!showSharePopUp) {
				
				selectedToneIndex=i;
				pencilSelection [i] = !pencilSelection[i];
				//Debug.Log(((float)Screen.width/(float)Screen.height).ToString()+"InPencil Selection");
				if(((float)Screen.width/(float)Screen.height)<0.7f)
				{
					fillColor=pencilTones[selectedToneIndex].GetPixel((int)((pencilTones[selectedToneIndex].width/7-toneRect.x)*pencilTones[selectedToneIndex].width/Screen.width),60);
					FindPixelWithinTone((int)pencilTones[selectedToneIndex].width/7,60);
				}
				else
				{
					
					fillColor=pencilTones[selectedToneIndex].GetPixel((int)((pencilTones[selectedToneIndex].width/6-toneRect.x)*pencilTones[selectedToneIndex].width/Screen.width),60);
					FindPixelWithinTone((int)pencilTones[selectedToneIndex].width/6,60);
				}
				if(fillColor==Color.black)
					fillColor=new Color(0.1f,0.1f,0.1f);
				
				for(int M=0;M<=100;M++)
				{
					for(int N=0;N<=100;N++)
						selectedColor.SetPixel(M,N,fillColor);
				}
				//Debug.Log(fillColor);
				selectedColor.Apply();
				skillprint_select(fillColor);
				break;
			}	
			else if(!showInapp&&!showSavedPopUp&&!isZooming&&!isPanning&&ButtonHit (pencilRect [i])&&!ButtonHit(toneRect)&&!eagerShare&&!showInapp&&!showSharePopUp) {
				
				selectedToneIndex=i;
				pencilSelection [i] = !pencilSelection[i];
				//Debug.Log(((float)Screen.width/(float)Screen.height).ToString()+"InPencil Selection");
				if(((float)Screen.width/(float)Screen.height)<0.7f)
				{
					fillColor=pencilTones[selectedToneIndex].GetPixel((int)((pencilTones[selectedToneIndex].width/7-toneRect.x)*pencilTones[selectedToneIndex].width/Screen.width),60);
					FindPixelWithinTone((int)pencilTones[selectedToneIndex].width/7,60);
				}
				else
				{
					//Debug.Log((float)((float)Screen.width/(float)Screen.height));
					fillColor=pencilTones[selectedToneIndex].GetPixel((int)((pencilTones[selectedToneIndex].width/6-toneRect.x)*pencilTones[selectedToneIndex].width/Screen.width),60);
					FindPixelWithinTone((int)pencilTones[selectedToneIndex].width/6,60);
				}
				if(fillColor==Color.black)
					fillColor=new Color(0.1f,0.1f,0.1f);
				
				for(int K=0;K<=100;K++)
				{
					for(int L=0;L<=100;L++)
						selectedColor.SetPixel(K,L,fillColor);
				}
				selectedColor.Apply();
				skillprint_select(fillColor);
				break;
			}	
		}
		
		if (!showInapp&&!showSavedPopUp&&!isZooming&&!isPanning&&ButtonFade(unDoRect,0)||ButtonHit(unDoRect)&&!showInapp&&!showSharePopUp) {
			//Debug.Log("In Undo");
			colorHolds=false;
			//Debug.Log(oldFillers.Count);
			if(oldFillers.Count>0)
				
				UndoFill();
		}
		
		//		if (!eagerShare && !showSavedPopUp && !isZooming && !isPanning &&!ButtonHit(inappPopupRect)&&!ButtonHit(toneRect)&&showInapp)
		//			showInapp=false;
		if (showInapp && ButtonHit (closeIAPRect))
			showInapp = false;
		if (showInapp)
			HandleIAP ();
		if (!eagerShare && !showSavedPopUp && !isZooming && !isPanning && ButtonHit (toneRect) && selectedToneIndex >= 0 && (Mathf.CeilToInt (Input.mousePosition.x) > (990 * scale_x)) && !ImagePathHolder.GetLockedColors ())
			showInapp = false;
		
		if (!showInapp&&!eagerShare&&!showSavedPopUp&&!isZooming&&!isPanning&&ButtonHit (toneRect)&&selectedToneIndex>=0&&!showInapp&&!showSharePopUp) {
			//Selecting tone index based on tone selected for particular pencil
			if((!ImagePathHolder.GetLockedColors()&&(Mathf.CeilToInt(Input.mousePosition.x)<(990*scale_x)))||(ImagePathHolder.GetLockedColors()))
			{
				
				
				fillColor=pencilTones[selectedToneIndex].GetPixel(Mathf.CeilToInt((Input.mousePosition.x-toneRect.x)*pencilTones[selectedToneIndex].width/Screen.width),Mathf.CeilToInt(pencilTones[selectedToneIndex].height-(Screen.height-Input.mousePosition.y-toneRect.y)*toneRect.height/(pencilTones[selectedToneIndex].height)));
				
				FindPixelWithinTone(Mathf.CeilToInt(Input.mousePosition.x),Mathf.CeilToInt(pencilTones[selectedToneIndex].height-(Screen.height-Input.mousePosition.y-toneRect.y)*(pencilTones[selectedToneIndex].height/toneRect.height)));
				if(fillColor==Color.black)
					fillColor=new Color(0.1f,0.1f,0.1f);
				
				for(int i=0;i<=100;i++)
				{
					for(int j=0;j<=100;j++)
						selectedColor.SetPixel(i,j,fillColor);
				}
				skillprint_select(fillColor);
				selectedColor.Apply();
			}
			
			
			
		}
		if (showSavedPopUp && ButtonHit(startoverRect)) {
			showSavedPopUp=false;
			LoadActualImage();
		}
		if (showSavedPopUp && ButtonHit(ContinueRect)) {
			showSavedPopUp=false;
			LoadSavedImage();
		}
	}
	bool goHome=false;
	bool showShares=false;
	bool ButtonDown(Rect rt)
	{
		if (rt.Contains (new Vector2 (Input.mousePosition.x, (Screen.height - Input.mousePosition.y))) && Input.GetMouseButtonDown (0))
			return true;
		else
			return false;
	}
	bool ButtonHit(Rect rt)
	{
		if (rt.Contains (new Vector2 (Input.mousePosition.x, (Screen.height - Input.mousePosition.y))) && Input.GetMouseButtonUp (0))
			return true;
		else
			return false;
	}
	void DrawShareBanner()
	{
		if (showShares) {
			GUI.DrawTexture(bannerRect,white);
			GUI.DrawTexture(fbRect,FBShare);
			GUI.DrawTexture(shareEmailRect,shareEmail);
			GUI.DrawTexture(instaRect,shareInsta);
			//			GUI.DrawTexture(shareMessageRect,shareMessage);
		}
	}
	void DrawTopBanner()
	{
		GUI.DrawTexture (topBannerRect, black);
		GUI.DrawTexture (topWhiteRect, white);
		//if (!topSelection [2])
		//	GUI.DrawTexture (shareRect, shareFB);
		//else 
		//{

		//	GUI.DrawTexture (shareRect, shareFB);
		//	GUI.DrawTexture(shareRect,transImg);
		//}
		//			GUI.DrawTexture (shareRect, fadedShare); 
		if(!topSelection[2])
			GUI.DrawTexture (unDoRect, unDo);
		else
		{

			GUI.DrawTexture (unDoRect, unDo);
			GUI.DrawTexture(unDoRect,transImg);
		}
		if(!topSelection[1])
			GUI.DrawTexture (homeRect, home);
		else
		{

			GUI.DrawTexture (homeRect, home);
			GUI.DrawTexture(homeRect,transImg);
		}
//		if(!topSelection[3])
//			GUI.DrawTexture (saveImageRect, saveImage);
//		else
//			GUI.DrawTexture (saveImageRect, fadedsaveImg);
//		customStyle.normal.textColor = new Color ((57f / 255f), (122f / 255f), (159f / 255f));

		customStyle.normal.textColor = Color.black;
		customStyle.fontSize=Mathf.CeilToInt(55*scale_y);
		//GUI.Label (homeTextRect, "HOME", customStyle);
		//GUI.Label (shareTextRect, "SHARE", customStyle);
		//GUI.Label (undoTextRect, "UNDO", customStyle); 
//		GUI.Label (saveImgTextRect, "SAVE", customStyle);
	}
	void StoreImageChange()
	{
		DataManager.Instance.FileCreatorBytes (mainImage.EncodeToPNG (), DataManager.Instance.selectedFileName);
		if ((oldFillers.Count > 0&&!moveToShare)||DataManager.Instance.fromDrawings) 
		{
			DataManager.Instance.fromDrawings=false;
			PlayerPrefs.SetInt (DataManager.Instance.selectedFileName, 1);
			CreateWatermark ();
			TextureScale.Bilinear(testwaterImage,512,512);
			DataManager.Instance.StoreWatermark (testwaterImage.EncodeToPNG(), DataManager.Instance.selectedFileName);
		}

		if (goHome)
			LoadCategories ();
	}
	void LoadCategories()
	{
		//		colorSelected = false;
		
		//		Texture2D someImg= new Texture2D(mainImage.width,mainImage.height);
		//		someImg.SetPixels(mainImage.GetPixels ());
		//		someImg.Apply ();
		//		TextureScale.Bilinear (someImg, 256, 256);
		//		DataManager.Instance.FileCreatorBytes (someImg.EncodeToPNG (), DataManager.Instance.selectedThumb);// store thumbnail into file
		//		PlayerPrefs.SetString (DataManager.Instance.selectedThumb, DataManager.Instance.selectedThumb);
		//		PlayerPrefs.Save();
		//		for(int i=0;i<=100;i++)
		//		{
		//			for(int j=0;j<=100;j++)
		//				selectedColor.SetPixel(i,j,Color.black);
		//		}
		//		selectedColor.Apply();

		if (goHome)
			goHome = false;
		//AdManager.SharedManager.ShowBanner ();
		DataManager.Instance.LoadScene("Gallery",0);
//		if(SceneManager.Instance!=null)
//			SceneManager.Instance.LoadScene("CategoryIntermediate");
	}
	void DrawPencilAndTones()
	{
		for (int pencilIndex=0; pencilIndex<pencilRect.Length; pencilIndex++) {
			if(pencilIndex!=selectedToneIndex)
				GUI.DrawTexture (pencilRect [pencilIndex], pencils [pencilIndex + 1]);
		}
		if(selectedToneIndex>=0)
		{
			
			GUI.DrawTexture(new Rect(pencilRect[selectedToneIndex].x,pencilRect[selectedToneIndex].y-20*scale_y,pencilRect[selectedToneIndex].width+10*scale_x,pencilRect[selectedToneIndex].height+15*scale_y),pencils[selectedToneIndex+1]);
			//			GUI.DrawTexture(new Rect(pencilRect[selectedToneIndex].x-4*scale_x,pencilRect[selectedToneIndex].y-26*scale_y,pencilRect[selectedToneIndex].width+16*scale_x,pencilRect[selectedToneIndex].height+24*scale_y),pencils[0]);
			GUI.DrawTexture(toneRect,pencilTones[selectedToneIndex]);
			if(!ImagePathHolder.GetLockedColors())
				for(int i=0;i<4;i++)
					GUI.DrawTexture(new Rect((1020+i*135)*scale_x,1958*scale_y,80*scale_x,80*scale_y),lockColor);
		}
		
	}
	void OnGUI()
	{

		//		if (!waterMarkComeplete)
		GUI.DrawTexture(imageRect, mainImage);//,0,true,0,Color.black,5f*scale_y,0);
		GUI.DrawTexture(imageRect, mainImage, 0, true, 0, Color.black, 5f * scale_y, 0);
		//		else
		//		{
		//			GUI.DrawTexture(watermarkImageRect,testwaterImage);
		//			//			GUI.DrawTexture(watermarkImageRect,watermark);
		//			//			GUI.DrawTexture(imageRect,mainImage);
		//		}

		//		if (showWaterMark) {
		//			showWaterMark=false;
		//			CreateWatermark ();
		//		}
		//		if (showWaterMark)
		//			GUI.DrawTexture (watermarkImageRect, testwaterImage);
		DrawTopBanner ();
		DrawPencilAndTones ();
		//DrawShareBanner ();
		if(!isZooming)
			EventHandle ();
		if(showSavedPopUp)
			DrawSavedImage ();

		if (colorSelected) {
			GUI.DrawTexture(new Rect(selRect.x-(5*scale_x),selRect.y-(4*scale_y),selRect.width+(10*scale_x),selRect.height+(8*scale_y)),selectedBorder);
			GUI.DrawTexture (selRect, selectedColor);
		}
		//if(showInapp)
		//	DrawIAP (); 
		//		if (showWaterMark)
		//		{
		//			waterImage=DrawWatermark ();
		//			showWaterMark=false;
		//		}		
//		if(showSharePopUp)
//			DrawShare ();
	}
	void EventHandle()
	{
		if(imageRect.width<origImgRect.width||imageRect.height<origImgRect.height)
		{// clamping image dimensions to original dimensions when trying to zoom out originally
			imageRect = origImgRect;
		}
		if (Event.current.type==EventType.MouseUp) {
			//clamping image position and dimensions to stay within viewport
			if(imageRect.y<(550f*scale_y-imageRect.height))
				imageRect.y=(450*scale_y)-imageRect.height;
			if(imageRect.x<(250f*scale_x-imageRect.width))
				imageRect.x=(300*scale_x)-imageRect.width;
			if(imageRect.x>(Screen.width-250*scale_x))
				imageRect.x=Screen.width-250*scale_x;
			if(imageRect.y>(Screen.height-420*scale_y))
				imageRect.y=Screen.height-450*scale_y;
			if(imageRect.width>=(3f*origImgRect.width))
				imageRect.width=2.995f*origImgRect.width;
			if(imageRect.height>=(3f*origImgRect.height))
				imageRect.height=2.995f*origImgRect.height;
		}
	}
	Stack<Color32> usedColors;
	public struct Point
	{
		public short x;
		public short y;
		public Point(short aX, short aY) { x = aX; y = aY; }
		public Point(int aX, int aY) : this((short)aX, (short)aY) { }
	}
	
	public struct FillInfo
	{
		public Color oldColor;
		public byte[] oldColorRGBs ;
		public int x, y;
		public FillInfo(Color32 olderCol,int startPosX,int startPosY){oldColor=olderCol;oldColorRGBs=new byte[4];oldColorRGBs[0]=olderCol.r;oldColorRGBs[1]=olderCol.g;oldColorRGBs[2]=olderCol.b;oldColorRGBs[3]=olderCol.a;x=startPosX;y=startPosY;}
	}

	void UndoFill()
	{//pop last operation from stack and apply operation.
		FillInfo lastFill = oldFillers.Pop ();
		Color32 lastCol = new Color32 (lastFill.oldColorRGBs [0], lastFill.oldColorRGBs [1], lastFill.oldColorRGBs [2], lastFill.oldColorRGBs [3]);
		Color32 lastColUsed=new Color32();
		if(usedColors.Count>0)
			lastColUsed = usedColors.Pop ();
		if(lastColUsed.r==lastCol.r&&lastColUsed.g==lastCol.g&&lastColUsed.b==lastCol.b&&lastColUsed.a==lastCol.a)
			FloodFiller.RevisedQueueFloodFill (mainImage, lastFill.x, lastFill.y, lastCol,true);
		mainImage.Apply ();
	}

}
