using UnityEngine;
using System.Collections;
#if UNITY_EDITOR
using UnityEditor;
using System.Collections.Generic;
public class ColorizeWindow : EditorWindow {
	string myString = "Hello World";
	int numCategories;
	bool groupEnabled;
	bool myBool = false;
	bool CreateCat=false;
	float myFloat = 1.23f;
	string name="";
	int imgAssetListCount=0;
	int selected=0;
	private static Vector2 scrollViewVector;
	string[] toolBarStrs= new string[] {"Category","Settings","IAP","Ads"};
	public SettingAssets settingAsset;
	public ImageAssetList listImageAssets;
	public CategoryList listOfCategories;
	public IAPSetting iapSetting;
	public AdsAsset adSett;
	private int viewIndex, viewImageAssetListInd=-1;
	// Add menu named "My Window" to the Window menu
	[MenuItem ("Window/Colorize Editor")]
	static void Init () {
		// Get existing open window or if none, make a new one:

		ColorizeWindow window = (ColorizeWindow)EditorWindow.GetWindow (typeof (ColorizeWindow));
		window.Show(); 
	}
	[MenuItem ("Assets/Create/Category List")] 
	public static CategoryList CreateCategoryList()
	{
		
		CategoryList asset = ScriptableObject.CreateInstance<CategoryList> ();
		AssetDatabase.CreateAsset (asset, "Assets/Resources/AllImageAssets/CategoryList.asset");

		AssetDatabase.SaveAssets ();
		EditorUtility.FocusProjectWindow ();
		Selection.activeObject = asset;
		return asset;
	}
	[MenuItem ("Assets/Create/Image Asset List")]
	public static ImageAssetList CreateImageAssetList(string listName)
	{
		
		ImageAssetList asset = ScriptableObject.CreateInstance<ImageAssetList> ();
		AssetDatabase.CreateAsset (asset, "Assets/Resources/AllImageAssets/"+listName+".asset");
		AssetDatabase.SaveAssets ();
		EditorUtility.FocusProjectWindow ();
		Selection.activeObject = asset;
		return asset;
	}
	[MenuItem ("Assets/Create/Category")] 
	public static Category CreateCategory()
	{
	
		Category asset = ScriptableObject.CreateInstance<Category> ();
		AssetDatabase.CreateAsset(asset,"Assets/Resources/AllImageAssets/ImageCategories/Category.asset");
		AssetDatabase.SaveAssets ();
		EditorUtility.FocusProjectWindow ();
		Selection.activeObject = asset;
		return asset;
	}
	[MenuItem ("Assets/Create/Image Asset")]
	public static ImageAsset CreateImageAsset()
	{
		
		ImageAsset asset = ScriptableObject.CreateInstance<ImageAsset> ();
		AssetDatabase.CreateAsset (asset, "Assets/Resources/AllImageAssets/ImageAssets/ImageAsset.asset");
		AssetDatabase.SaveAssets ();
		EditorUtility.FocusProjectWindow ();
		Selection.activeObject = asset;
		return asset;
	}
	public static SettingAssets CreateSettingAsset()
	{
		SettingAssets asset = ScriptableObject.CreateInstance<SettingAssets> ();
		AssetDatabase.CreateAsset (asset, "Assets/Resources/AllImageAssets/ImageAssets/SettingAssets.asset");
		AssetDatabase.SaveAssets ();
		EditorUtility.FocusProjectWindow ();
		Selection.activeObject = asset;
		return asset;
	}
	public static IAPSetting CreateIAPAsset()
	{
		IAPSetting asset = ScriptableObject.CreateInstance<IAPSetting> ();
		AssetDatabase.CreateAsset (asset, "Assets/Resources/AllImageAssets/ImageAssets/IAPSetting.asset");
		AssetDatabase.SaveAssets ();
		EditorUtility.FocusProjectWindow ();
		Selection.activeObject = asset;
		return asset;
	}
	public static AdsAsset CreateAdsAsset()
	{
		AdsAsset asset = ScriptableObject.CreateInstance<AdsAsset> ();
		AssetDatabase.CreateAsset (asset, "Assets/Resources/AllImageAssets/ImageAssets/AdsAsset.asset");
		AssetDatabase.SaveAssets ();
		EditorUtility.FocusProjectWindow ();
		Selection.activeObject = asset;
		return asset;
	}
	void ShowcategoryTab()
	{

		GUILayout.EndHorizontal();
		GUILayout.BeginHorizontal ();
		GUILayout.Label ("Category Editor", EditorStyles.boldLabel);
		if (listOfCategories != null) {
			SomeSpace(10);
			if (GUILayout.Button("Show Category List")) 
			{
				EditorUtility.FocusProjectWindow();
				Selection.activeObject = listOfCategories;
			}
		}
		GUILayout.EndHorizontal ();
		
		if (listOfCategories == null) 
		{
			GUILayout.BeginHorizontal ();
			GUILayout.Space(10);
			if (GUILayout.Button("Create New Category List", GUILayout.ExpandWidth(false))) 
			{
				//					CreateNewItemList(); 
				CreateCat=true;
			}
			if(CreateCat)
			{
				imgAssetListCount=EditorGUILayout.IntField("List Size",imgAssetListCount);
				if(GUILayout.Button("Create", GUILayout.ExpandWidth(false)))
				{
					CreateNewItemList(); 
					name="";
					myBool=false;
					if(imgAssetListCount>0)
						GenerateCategoryList(imgAssetListCount);
				}
			}
			if (GUILayout.Button("Open Existing Category List", GUILayout.ExpandWidth(false))) 
			{
				OpenItemList();
			}
			GUILayout.EndHorizontal ();
		}
		
		GUILayout.Space(20);
		
		if (listOfCategories != null)
		{
			GUILayout.BeginHorizontal ();
			
			
			GUILayout.Space (10);
			
			if (GUILayout.Button ("Previous Category", GUILayout.ExpandWidth (false))) {
				if (viewIndex > 1)
					viewIndex --;
			}
			GUILayout.Space (5);
			if (GUILayout.Button ("Next Category", GUILayout.ExpandWidth (false))) {
				if (viewIndex < listOfCategories.ListOfCategories.Count) {
					viewIndex ++;
				}
			}
			
			GUILayout.Space (60);
			
			if (GUILayout.Button ("Add Category", GUILayout.ExpandWidth (false))) {
				AddItem ();
			}
			if (GUILayout.Button ("Delete Category", GUILayout.ExpandWidth (false))) {
				DeleteItem (viewIndex - 1);
			}
			
			GUILayout.EndHorizontal ();
			if (listOfCategories.ListOfCategories == null)
				Debug.Log ("Category List Empty or not Initialized. Please create one before adding/deleting categories");
			if (listOfCategories.ListOfCategories.Count > 0) {
				GUILayout.BeginHorizontal ();
				viewIndex = Mathf.Clamp (EditorGUILayout.IntField ("Current Category", viewIndex, GUILayout.ExpandWidth (false)), 1, listOfCategories.ListOfCategories.Count); 
				//Mathf.Clamp (viewIndex, 1, listOfCategories.ListOfCategories.Count);
				EditorGUILayout.LabelField ("of   " + listOfCategories.ListOfCategories.Count.ToString () + "  Categories", "", GUILayout.ExpandWidth (false)); 
				GUILayout.EndHorizontal (); 
				
				listOfCategories.ListOfCategories [viewIndex - 1].CategoryName = EditorGUILayout.TextField ("Category Name", listOfCategories.ListOfCategories [viewIndex - 1].CategoryName as string); 
				listOfCategories.ListOfCategories [viewIndex - 1].mainImage = EditorGUILayout.ObjectField ("Main Image", listOfCategories.ListOfCategories [viewIndex - 1].mainImage, typeof(Texture2D), false) as Texture2D; 
				if(listImageAssets==null)
				{
					GUILayout.BeginVertical();
					GUILayout.BeginHorizontal();
					if (GUILayout.Button("Create New Image Asset List", GUILayout.ExpandWidth(false))) 
					{
						myBool=true;
					}
					if (GUILayout.Button("Open Existing Image Asset List", GUILayout.ExpandWidth(false))) 
					{
						OpenImageAssetList();
					}
					GUILayout.EndVertical();
					if(myBool)
					{
						SomeSpace(10);
						GUILayout.BeginVertical();
												GUILayout.BeginHorizontal();

						name= EditorGUILayout.TextField("Image Asset List Name",name);
						imgAssetListCount=EditorGUILayout.IntField("List Size",imgAssetListCount);
						GUILayout.EndVertical();
						GUILayout.EndHorizontal();
						GUILayout.BeginHorizontal();
						if(GUILayout.Button("Create", GUILayout.ExpandWidth(false))&&name!="Image Asset List Name"&&name.Trim()!="")
						{
							CreateNewImageAssetList(name);
							name="";
							myBool=false;
							if(imgAssetListCount>0)
								GenerateImageAssetList(imgAssetListCount);
						}
						else if(name=="Image Asset List Name")
							GUILayout.Label("Please re-name to avoid overwriting previous asset list.");
												GUILayout.EndHorizontal();
					}
					GUILayout.EndHorizontal ();
				}
				if(listImageAssets!=null)
				{
					GUILayout.BeginHorizontal ();
					
					GUILayout.Space (10);
					
					if (GUILayout.Button ("Prev", GUILayout.ExpandWidth (false))) {
						if (viewImageAssetListInd > 1)
							viewImageAssetListInd --;
					}
					GUILayout.Space (5);
					if (GUILayout.Button ("Next", GUILayout.ExpandWidth (false))) {
						if (viewImageAssetListInd < listImageAssets.ListOfImageAssets.Count) {
							viewImageAssetListInd ++;
						}
					}
					
					GUILayout.Space (60);
					
					if (GUILayout.Button ("Add Image Asset", GUILayout.ExpandWidth (false))) {
						AddImageAsset ();
					}
					if (GUILayout.Button ("Delete Image Asset", GUILayout.ExpandWidth (false))) {
						DeleteImageAsset (viewImageAssetListInd - 1);
					}
					GUILayout.EndHorizontal ();
					if (listImageAssets.ListOfImageAssets == null)
						Debug.Log ("Image Asset List Empty or not Initialized. Please create one before adding/deleting image assets");
					if (listImageAssets.ListOfImageAssets.Count > 0) {
						GUILayout.BeginHorizontal ();
						viewImageAssetListInd = Mathf.Clamp (EditorGUILayout.IntField ("Current Image Asset", viewImageAssetListInd, GUILayout.ExpandWidth (false)), 1, listImageAssets.ListOfImageAssets.Count); 
						GUILayout.EndHorizontal ();
						//Mathf.Clamp (viewIndex, 1, listOfCategories.ListOfCategories.Count);
						EditorGUILayout.LabelField ("of   " + listImageAssets.ListOfImageAssets.Count.ToString () + "  Image Assets", "", GUILayout.ExpandWidth (false)); 
						listImageAssets.ListOfImageAssets[viewImageAssetListInd-1].name=EditorGUILayout.TextField ("Image Asset Name", listImageAssets.ListOfImageAssets[viewImageAssetListInd-1].name);
						listImageAssets.ListOfImageAssets[viewImageAssetListInd-1].image=EditorGUILayout.ObjectField ("Image", listImageAssets.ListOfImageAssets[viewImageAssetListInd-1].image, typeof(Texture2D), false) as Texture2D;
						listImageAssets.ListOfImageAssets[viewImageAssetListInd-1].isLocked=EditorGUILayout.Toggle ("Lock Status", listImageAssets.ListOfImageAssets[viewImageAssetListInd-1].isLocked);
						
					}
					SomeSpace(10);
					if(GUILayout.Button ("Add Image Asset List To Category", GUILayout.ExpandWidth (false)))
					{
						AssetDatabase.SaveAssets();
						listOfCategories.ListOfCategories [viewIndex - 1].images=listImageAssets;
						
						listImageAssets=null;
					}	
				}
				
				
				//				listOfCategories.ListOfCategories [viewIndex - 1].images = (ImageAssetList)EditorGUILayout.ObjectField ("Image List", listOfCategories.ListOfCategories [viewIndex - 1].images, typeof(ImageAssetList), true);
			} 

		}
		SomeSpace(10);
		if (listOfCategories != null)
			if (GUILayout.Button ("Save Data")) 
		{
			EditorUtility.SetDirty(listOfCategories);
			Debug.Log (listOfCategories.ListOfCategories.Count);
			ImagePathHolder.SaveData (listOfCategories);
		}
	}
	void ShowIAP()
	{
		GUILayout.EndHorizontal();
		SomeSpace (10);
		if (iapSetting == null&&GUILayout.Button("Create IAP Setting Asset",GUILayout.ExpandWidth(false)))
			CreateNewIAPSetting ();
		if (iapSetting != null) 
		{
			GUILayout.BeginHorizontal ();
			GUILayout.BeginVertical ();
			
			for (int i=0; i<iapSetting.SKUs.Length; i++) 
			{		
				SomeSpace (5);
				string buttName="";	
				switch(i)
				{
				case 0:buttName="Unlock All Categories";
					break;
				case 1:buttName="Unlock All Colors";
					break;			
				case 2:buttName="Unlock Everything";
					break;
				
				}
				iapSetting.SKUs [i] = EditorGUILayout.TextField (buttName, iapSetting.SKUs [i], GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15));
				iapSetting.Pricing [i] = EditorGUILayout.TextField ("Price to "+buttName, iapSetting.Pricing [i], GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (100),GUILayout.MaxHeight(15));
			}
			GUILayout.EndHorizontal ();
			GUILayout.EndVertical ();
			SomeSpace(10);
			GUILayout.BeginHorizontal();
			iapSetting.TestMode=EditorGUILayout.Toggle ("Test Mode", iapSetting.TestMode);
			GUILayout.EndHorizontal();
			SomeSpace(10);
			if(GUILayout.Button("Save IAP",GUILayout.ExpandWidth(false)))
			{
				EditorUtility.SetDirty(iapSetting);
				AssetDatabase.SaveAssets();
				ImagePathHolder.SaveIAP(iapSetting);
			}	
		}
	}
	void ShowSettingsTab()
	{
		GUILayout.EndHorizontal();
		if (settingAsset == null&&GUILayout.Button("Create Setting Asset",GUILayout.ExpandWidth(false)))
			CreateNewSettingAsset ();
		
		if (settingAsset != null) 
		{
			GUILayout.BeginVertical();
			GUILayout.Space (10);
			
			GUILayout.BeginHorizontal ();
			
			//		scrollViewVector = EditorGUILayout.BeginScrollView (scrollViewVector, true, true,);
			EditorGUILayout.LabelField("HOME Footer", EditorStyles.boldLabel);
			//		GUILayout.BeginHorizontal ();
			GUILayout.Space (15);
			GUILayout.EndHorizontal ();
			GUILayout.BeginHorizontal ();
			GUILayout.EndVertical();
			
			GUILayout.BeginVertical ();
			
			for (int i=0; i<settingAsset.HomeButtNames.Length; i++) 
			{		
				settingAsset.HomeButtNames [i] = EditorGUILayout.TextField ("Name", settingAsset.HomeButtNames [i], GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15));
				settingAsset.HomeButtonTransitionColors [i] = EditorGUILayout.ColorField ("Color", settingAsset.HomeButtonTransitionColors [i], GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15));
				settingAsset.HomeButtonImages[i]=EditorGUILayout.ObjectField("Image",settingAsset.HomeButtonImages[i], typeof(Texture2D), true,GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15)) as Texture2D;
			}
			GUILayout.EndHorizontal ();
			GUILayout.EndVertical ();
			GUILayout.Space (10);
			
			GUILayout.BeginVertical();
			GUILayout.BeginHorizontal ();
			EditorGUILayout.LabelField("Inspiration Window", EditorStyles.boldLabel);
			//		GUILayout.BeginHorizontal ();
			GUILayout.Space (15);
			GUILayout.EndHorizontal ();
			
			GUILayout.BeginHorizontal ();
			settingAsset.InspirationWebLink = EditorGUILayout.TextField ("Inspiration WebLink", settingAsset.InspirationWebLink, GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15));
			GUILayout.EndHorizontal ();
			GUILayout.EndVertical();
			GUILayout.Space (10);
			
			GUILayout.BeginHorizontal ();
			EditorGUILayout.LabelField("Pop Up Options", EditorStyles.boldLabel);
			//		GUILayout.BeginHorizontal ();
			GUILayout.Space (15);
			GUILayout.EndHorizontal ();
			GUILayout.BeginHorizontal ();
			GUILayout.BeginVertical ();
			for (int j=0; j<settingAsset.PopUpButtNames.Length; j++) 
			{		
				settingAsset.PopUpButtNames [j] = EditorGUILayout.TextField ("Name", settingAsset.PopUpButtNames [j], GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15));
				settingAsset.PopUpButtonTextColors [j] = EditorGUILayout.ColorField ("Color", settingAsset.PopUpButtonTextColors [j], GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15));
			}
			GUILayout.EndHorizontal ();
			GUILayout.EndVertical ();
			GUILayout.Space (10);
			
			GUILayout.BeginHorizontal ();
			EditorGUILayout.LabelField("UI Icons", EditorStyles.boldLabel);
			//		GUILayout.BeginHorizontal ();
			GUILayout.Space (15);
			GUILayout.EndHorizontal ();
			GUILayout.BeginHorizontal ();
			GUILayout.BeginVertical ();
			for (int k=0; k<settingAsset.UIIconImages.Length; k++) 
			{	string buttName="";	
				switch(k)
				{
				case 0:buttName="Undo";
					break;
				case 1:buttName="Share";
					break;			
				case 2:buttName="Home";
					break;
				case 3:buttName="Close";
					break;
				}
				settingAsset.UIIconImages[k]=EditorGUILayout.ObjectField(buttName,settingAsset.UIIconImages[k], typeof(Texture2D), true,GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15)) as Texture2D;
			}
			GUILayout.EndHorizontal ();
			GUILayout.EndVertical ();
			GUILayout.Space (10);
			
			GUILayout.BeginHorizontal ();
			EditorGUILayout.LabelField("Social Icons", EditorStyles.boldLabel);
			//		GUILayout.BeginHorizontal ();
			GUILayout.Space (15);
			GUILayout.EndHorizontal ();
			GUILayout.BeginHorizontal ();
			GUILayout.BeginVertical ();
			for (int l=0; l<settingAsset.SocialIconImages.Length;l++) 
			{		
				string buttName="";	
				switch(l)
				{
				case 0:buttName="Instagram";
					break;
				case 1:buttName="Save";
					break;			
				case 2:buttName="MoreShare";
					break;
				}
				settingAsset.SocialIconImages[l]=EditorGUILayout.ObjectField(buttName,settingAsset.SocialIconImages[l], typeof(Texture2D), true,GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15)) as Texture2D;
			}
			GUILayout.EndHorizontal ();
			GUILayout.EndVertical ();
			GUILayout.Space (10);
			GUILayout.BeginVertical();
			EditorGUILayout.LabelField("Watermark", EditorStyles.boldLabel);
			GUILayout.EndVertical ();
			GUILayout.BeginHorizontal();
			settingAsset.Watermark=EditorGUILayout.ObjectField("Watermark Image",settingAsset.Watermark, typeof(Texture2D), true,GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15)) as Texture2D;
			GUILayout.EndHorizontal();
			GUILayout.Space (10);
			if(GUILayout.Button("Save Settings",GUILayout.ExpandWidth(false)))
			{
				EditorUtility.SetDirty(settingAsset);
				AssetDatabase.SaveAssets();
				ImagePathHolder.SaveSettings(settingAsset);
			}	
		}
		
		//		EditorGUILayout.EndScrollView ();
		
	}
	void SomeSpace(float space)
	{
		GUILayout.BeginVertical ();
		GUILayout.Space(space);
		GUILayout.EndVertical ();
	}
	void ShowAds()
	{
		GUILayout.EndHorizontal ();
		SomeSpace (10);
		if (adSett == null&&GUILayout.Button("Create Ads Asset",GUILayout.ExpandWidth(false)))
			CreateNewAdsAsset ();
		if (adSett != null) 
		{
			SomeSpace(10);
			GUILayout.BeginHorizontal ();
//			adSett.gameIdAndroid=EditorGUILayout.TextField ("Unity Ad ID for Android", adSett.gameIdAndroid, GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15));
			adSett.bannerIdAndroid=EditorGUILayout.TextField ("Banner ID for Android", adSett.bannerIdAndroid, GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15));
			GUILayout.EndHorizontal ();
			SomeSpace(10);
			GUILayout.BeginHorizontal ();
//			adSett.gameIdAndroid=EditorGUILayout.TextField ("Unity Ad ID for Android", adSett.gameIdAndroid, GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15));
			adSett.bannerIdiOS=EditorGUILayout.TextField ("Banner ID for iOS", adSett.bannerIdiOS, GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15));
			GUILayout.EndHorizontal ();
			SomeSpace(10);
			GUILayout.BeginHorizontal ();
//			adSett.gameIdiOS=EditorGUILayout.TextField ("Unity Ad ID for iOS", adSett.gameIdiOS, GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15));
			adSett.interstitialIdAndroid=EditorGUILayout.TextField ("Interstitial ID for Android", adSett.interstitialIdAndroid, GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15));
			GUILayout.EndHorizontal ();
			SomeSpace(10);
			GUILayout.BeginHorizontal ();
//			adSett.gameIdiOS=EditorGUILayout.TextField ("Unity Ad ID for iOS", adSett.gameIdiOS, GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15));
			adSett.interstitialIdiOS=EditorGUILayout.TextField ("Interstitial ID for iOS", adSett.interstitialIdiOS, GUILayout.ExpandWidth (false),GUILayout.ExpandHeight(false),GUILayout.MinWidth (400),GUILayout.MaxHeight(15));
			GUILayout.EndHorizontal ();
			SomeSpace(10);
			GUILayout.BeginHorizontal ();
			adSett.ShowAds=EditorGUILayout.Toggle ("Show Ads", adSett.ShowAds);
			GUILayout.EndHorizontal ();
			SomeSpace(10);
			if(GUILayout.Button("Save Settings",GUILayout.ExpandWidth(false)))
			{
				EditorUtility.SetDirty(adSett);
				AssetDatabase.SaveAssets();
				ImagePathHolder.SaveAds(adSett);
			}	
		}

	}
	void OnGUI () {
//		GUILayout.Label ("Base Settings", EditorStyles.boldLabel);
//		myString = EditorGUILayout.TextField ("Text Field", myString);
//		
//		groupEnabled = EditorGUILayout.BeginToggleGroup ("Optional Settings", groupEnabled);
//		myBool = EditorGUILayout.Toggle ("Toggle", myBool);
//		myFloat = EditorGUILayout.Slider ("Slider", myFloat, -3, 3);
//		EditorGUILayout.EndToggleGroup ();
//		listOfCategories=EditorGUILayout.ObjectField ("Category List",listOfCategories, typeof (CategoryList), false) as CategoryList;
//		numCategories=EditorGUILayout.IntField("Categories", numCategories, new GUILayoutOption[] { GUILayout.Width(50), GUILayout.MaxWidth(200) });

		#if UNITY_EDITOR
		settingAsset =AssetDatabase.LoadAssetAtPath<SettingAssets>("Assets/Resources/AllImageAssets/ImageAssets/SettingAssets.asset");
		listOfCategories = AssetDatabase.LoadAssetAtPath<CategoryList> ("Assets/Resources/AllImageAssets/CategoryList.asset");
		iapSetting =AssetDatabase.LoadAssetAtPath<IAPSetting>("Assets/Resources/AllImageAssets/ImageAssets/IAPSetting.asset");
		adSett=AssetDatabase.LoadAssetAtPath<AdsAsset>("Assets/Resources/AllImageAssets/ImageAssets/AdsAsset.asset");
		#endif
		GUILayout.BeginHorizontal();
		GUILayout.Space(30);
		int oldSelected = selected;
		GUILayout.BeginVertical ();
		GUILayout.Space(10);
		selected = GUILayout.Toolbar(selected, toolBarStrs, new GUILayoutOption[] { GUILayout.Width(400) });
		GUILayout.EndVertical ();
		switch (selected) 
		{
		case 0:ShowcategoryTab();
			break;
		case 1:ShowSettingsTab();
			break;
		case 2: ShowIAP();
			break;
		case 3: ShowAds();
			break;
		}

			
	}

	void CreateNewImageAssetList(string listName)
	{
		viewImageAssetListInd = 1;
		listImageAssets = CreateImageAssetList (listName); 
		if (listImageAssets) 
		{
			listImageAssets.ListOfImageAssets=new List<ImageAsset>();
			string relPath=AssetDatabase.GetAssetPath(listImageAssets);
			EditorPrefs.SetString("ImageAssetListPath",relPath);
		}
	}
	void CreateNewItemList () 
	{
		// There is no overwrite protection here!
		// There is No "Are you sure you want to overwrite your existing object?" if it exists.
		// This should probably get a string from the user to create a new name and pass it ...
		viewIndex = 1;
		listOfCategories = CreateCategoryList ();
		if (listOfCategories) 
		{
			listOfCategories.ListOfCategories=new List<Category>();
			string relPath = AssetDatabase.GetAssetPath(listOfCategories);
			EditorPrefs.SetString("ObjectPath", relPath);
		}
	}
	void OpenImageAssetList()
	{
		string absPath = EditorUtility.OpenFilePanel ("Select Image Asset List", "", "");
		if (absPath.StartsWith(Application.dataPath)) 
		{
			string relPath = absPath.Substring(Application.dataPath.Length - "Assets".Length);
			listImageAssets = AssetDatabase.LoadAssetAtPath (relPath, typeof(ImageAssetList)) as ImageAssetList;
			if (listImageAssets.ListOfImageAssets == null)
				listImageAssets.ListOfImageAssets = new List<ImageAsset>();
			if (listImageAssets) {
				EditorPrefs.SetString("ImageAssetListPath", relPath);
			}
		}
	}
	void OpenItemList () 
	{
		string absPath = EditorUtility.OpenFilePanel ("Select Category List", "", "");
		if (absPath.StartsWith(Application.dataPath)) 
		{
			string relPath = absPath.Substring(Application.dataPath.Length - "Assets".Length);
			listOfCategories = AssetDatabase.LoadAssetAtPath (relPath, typeof(CategoryList)) as CategoryList;
			if (listOfCategories.ListOfCategories == null)
				listOfCategories.ListOfCategories = new List<Category>();
			if (listOfCategories) {
				EditorPrefs.SetString("ObjectPath", relPath);
			}
		}
	}
	void GenerateCategoryList(int listCount)
	{
		for (int i=0; i<listCount; i++)
			AddItem ();
		imgAssetListCount = 0;
	}
	void GenerateImageAssetList(int listCount)
	{
		for (int i=0; i<listCount; i++)
			AddImageAsset ();
		imgAssetListCount = 0;
	}
	void AddImageAsset()
	{
		ImageAsset newItem = new ImageAsset ();
		newItem.name="New Image Asset (Overwrite this name)";
		listImageAssets.ListOfImageAssets.Add (newItem);
		AssetDatabase.AddObjectToAsset (newItem, listImageAssets);
		viewImageAssetListInd = listImageAssets.ListOfImageAssets.Count;
	}
	void DeleteImageAsset(int index)
	{
		listImageAssets.ListOfImageAssets.RemoveAt (index);
	}
	void AddItem () 
	{
		Category newItem = new Category(); 
		newItem.CategoryName = "New Category";
		listOfCategories.ListOfCategories.Add (newItem); 
		AssetDatabase.AddObjectToAsset (newItem, listOfCategories);
		viewIndex = listOfCategories.ListOfCategories.Count;  
	}
	
	void DeleteItem (int index) 
	{
		listOfCategories.ListOfCategories.RemoveAt (index); 
	}
	void CreateNewAdsAsset()
	{
		adSett = CreateAdsAsset ();
		adSett.gameIdAndroid = "";
		adSett.gameIdiOS = "";
	}
	void CreateNewIAPSetting()
	{
		iapSetting = CreateIAPAsset ();
		iapSetting.SKUs = new string[3];
		iapSetting.Pricing = new string[3];
		iapSetting.TestMode = false;
	}
	  void CreateNewSettingAsset()
	{
		settingAsset = CreateSettingAsset ();
		settingAsset.HomeButtNames = new string[3];
		settingAsset.HomeButtonImages = new Texture2D[3];
		settingAsset.HomeButtonTransitionColors = new Color[3];
		settingAsset.InspirationWebLink = "";
		settingAsset.PopUpButtNames = new string[2];
		settingAsset.PopUpButtonTextColors = new Color[2];
		settingAsset.SocialIconImages = new Texture2D[3];
		settingAsset.UIIconImages = new Texture2D[4];
		settingAsset.Watermark = new Texture2D (1,1);
	}
}
#endif