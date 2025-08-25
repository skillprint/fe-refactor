using UnityEngine;
using System.Collections;
using System.Collections.Generic;
#if UNITY_EDITOR
using UnityEditor;
#endif
using System.Linq;
using System.IO;
//[System.Serializable]
//public class ImageAsset
//{
//	public Texture2D image;
//	public bool isLocked;
//}

[System.Serializable]
public class ImagePath
{
	public string imagePath;
	public bool isLocked;
	public ImagePath(string Path,bool lockStatus)
	{
		this.imagePath = Path;
		this.isLocked = lockStatus;
	}
}
public class ImagePathHolder {
	public static string[] HomeButtNames,HomeButtImgPaths,PopUpButtNames,UIIconImagePaths,SocialIconImagePaths,HomeButtTransColors,PopUpButtColors;
	public static string InspWebLink,WaterMark,gameIDAndroid,gameIDiOS; 
	public static bool IAPTestMode;
	public  static List<ScriptableObject> ImageCat; 
	private static ImagePathHolder instanceRef;
//	public List<Category> list.ListOfCategories;
	[HideInInspector]
	public  static List<string> imageCategories,imagesInSubCategory,mainCategoryImages,SKUs,Pricing;
	[HideInInspector]
	public  static List<ImagePath> imagesInCategory,editedImagesInCategory,waterMarkedImages;
	[HideInInspector]
	public static List<int> imagesInCategoryCount,imagesInSubcategoryCount;
//	public static ImagePathHolder myInstance;
//	public static ImagePathHolder Instance
//	{
//		get{
//			if(myInstance==null)
//				myInstance=FindObjectOfType(typeof(ImagePathHolder)) as ImagePathHolder;
//			return myInstance;
//		}
//	}
	static void GetSettAsset(SettingAssets s)
	{
		int i = 0;
		HomeButtNames = new string[s.HomeButtNames.Length];
		HomeButtImgPaths = new string[s.HomeButtNames.Length];
		HomeButtTransColors = new string[s.HomeButtNames.Length];
		PopUpButtNames = new string[s.PopUpButtNames.Length];
		PopUpButtColors = new string[s.PopUpButtonTextColors.Length];
		UIIconImagePaths = new string[s.UIIconImages.Length];
		SocialIconImagePaths = new string[s.SocialIconImages.Length];
		WaterMark = "";
		for (i=0; i<s.HomeButtNames.Length; i++) 
		{
			HomeButtNames[i]=s.HomeButtNames[i];
			#if UNITY_EDITOR
			HomeButtImgPaths[i]=AssetDatabase.GetAssetPath (s.HomeButtonImages[i]).Substring(17,AssetDatabase.GetAssetPath (s.HomeButtonImages[i]).Length-21);
			#endif
			HomeButtTransColors[i]=s.HomeButtonTransitionColors[i].ToString().Substring(4);
		}
		InspWebLink = s.InspirationWebLink;
		for (i=0; i<s.PopUpButtNames.Length; i++) 
		{
			PopUpButtNames[i]=s.PopUpButtNames[i];
			PopUpButtColors[i]=s.PopUpButtonTextColors[i].ToString().Substring(4);
		}
		for (i=0; i<s.UIIconImages.Length; i++) 
		{
			#if UNITY_EDITOR
			UIIconImagePaths[i]=AssetDatabase.GetAssetPath (s.UIIconImages[i]).Substring(17,AssetDatabase.GetAssetPath (s.UIIconImages[i]).Length-21);
			#endif
		}
		for (i=0; i<s.SocialIconImages.Length; i++) 
		{
			#if UNITY_EDITOR
			SocialIconImagePaths[i]=AssetDatabase.GetAssetPath (s.SocialIconImages[i]).Substring(17,AssetDatabase.GetAssetPath (s.SocialIconImages[i]).Length-21);
			#endif
		}
		#if UNITY_EDITOR
		WaterMark=AssetDatabase.GetAssetPath(s.Watermark).Substring(17,AssetDatabase.GetAssetPath(s.Watermark).Length-21);
		#endif
		SaveSettingToAsset ();
	}
	public static void SaveSettings(SettingAssets settAsset)
	{
		GetSettAsset (settAsset);
	}
	static void SaveSettingToAsset()
	{
		string[] TAStr = Resources.Load<TextAsset> ("AllImageData").text.Split(new string[] { "?" }, System.StringSplitOptions.RemoveEmptyEntries);

		string saveStr ="HOMEBUTTONS|";
		int i = 0;
		for(i=0;i<HomeButtNames.Length;i++)
			saveStr+=HomeButtNames[i]+",";
		saveStr=saveStr.Substring(0, saveStr.Length - 1);
		saveStr+="\n";
		saveStr += "HOMEBUTTONIMAGES|";
		for(i=0;i<HomeButtImgPaths.Length;i++)
				saveStr+=HomeButtImgPaths[i]+",";
		saveStr=saveStr.Substring(0, saveStr.Length - 1);
		saveStr+="\n";
		saveStr+="HOMEBUTTONCOLORS|";
		for(i=0;i<HomeButtTransColors.Length;i++)
			saveStr+=HomeButtTransColors[i]+":";
		saveStr=saveStr.Substring(0, saveStr.Length - 1);
		saveStr+="\n";
		saveStr+="INSPIRATIONLINK|"+InspWebLink+"\n"+"POPUPBUTTONS|";
		for(i=0;i<PopUpButtNames.Length;i++)
			saveStr+=PopUpButtNames[i]+",";
		saveStr=saveStr.Substring(0, saveStr.Length - 1);
		saveStr+="\n";
		saveStr+="POPUPBUTTONCOLORS|";
		for(i=0;i<PopUpButtColors.Length;i++)
			saveStr+=PopUpButtColors[i]+":";
		saveStr=saveStr.Substring(0, saveStr.Length - 1);
		saveStr+="\n";
		saveStr += "UIICONIMAGES|";
		for(i=0;i<UIIconImagePaths.Length;i++)
			saveStr+=UIIconImagePaths[i]+",";
		saveStr=saveStr.Substring(0, saveStr.Length - 1);
		saveStr+="\n";
		saveStr += "SOCIALICONIMAGES|";
		for(i=0;i<SocialIconImagePaths.Length;i++)
			saveStr+=SocialIconImagePaths[i]+",";
		saveStr=saveStr.Substring(0, saveStr.Length - 1);
		saveStr+="\n";
		saveStr+="WATERMARK|";
		saveStr += WaterMark;
		#if UNITY_EDITOR
		if (Application.platform == RuntimePlatform.OSXEditor || Application.platform == RuntimePlatform.WindowsEditor)
		{
			//Write to file
			string activeDir = Application.dataPath + @"/Resources/";
			string newPath = System.IO.Path.Combine(activeDir, "AllSettings.txt");
			FileStream fs;
			fs=File.Create(newPath);
			byte[] SaveByte=System.Text.Encoding.UTF8.GetBytes(saveStr);
			fs.Write(SaveByte,0,SaveByte.Length);
			fs.Close();
			AssetDatabase.Refresh();
		}
		#endif
	}
	public static void SaveIAP (IAPSetting iap)
	{
		SKUs =new List<string>();
		Pricing = new List<string> ();
		for (int i=0; i<iap.Pricing.Length; i++) 
		{
			SKUs.Add(iap.SKUs[i]);
			Pricing.Add(iap.Pricing[i]);
		}
		IAPTestMode = iap.TestMode;
		SaveIAPToAsset ();
	}
	public static void SaveAds(AdsAsset ad)
	{
//		gameIDAndroid = ad.gameIdAndroid;
//		gameIDiOS = ad.gameIdiOS;
//		string saveStr ="ANDROID|";
//		saveStr += gameIDAndroid;
//		saveStr+="\n";
//		saveStr+="IOS|"+gameIDiOS+"\n";

		string saveStr="ANDROID_BANNER|"+ad.bannerIdAndroid+"\n";
		saveStr += "IOS_BANNER|" + ad.bannerIdiOS + "\n";
		saveStr+="ANDROID_INTERSTITIAL|"+ad.interstitialIdAndroid+"\n";
		saveStr+="IOS_INTERSTITIAL|"+ad.interstitialIdiOS+"\n";

		saveStr += "SHOWADS|" + ad.ShowAds.ToString ();
		#if UNITY_EDITOR
		if (Application.platform == RuntimePlatform.OSXEditor || Application.platform == RuntimePlatform.WindowsEditor)
		{
			//Write to file
			string activeDir = Application.dataPath + @"/Resources/";
			string newPath = System.IO.Path.Combine(activeDir, "AllAds.txt");
			FileStream fs;
			fs=File.Create(newPath);
			byte[] SaveByte=System.Text.Encoding.UTF8.GetBytes(saveStr);
			fs.Write(SaveByte,0,SaveByte.Length);
			fs.Close();
			AssetDatabase.Refresh();
		}
		#endif
	}
	public static bool GetShowAds()
	{
		bool category = false;
		string[] TextInAsset= Resources.Load<TextAsset>("AllAds").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		category = System.Convert.ToBoolean(TextInAsset [4].Replace ("SHOWADS|", string.Empty).Trim ());
		return category;
	}
	public static string GetGameIDAndroid()
	{
		string category = "";
		string[] TextInAsset= Resources.Load<TextAsset>("AllAds").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		category = TextInAsset [0].Replace ("ANDROID|", string.Empty).Trim ();
		return category;
	}
	public static string GetGameIDIOS()
	{
		string category = "";
		string[] TextInAsset= Resources.Load<TextAsset>("AllAds").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		category = TextInAsset [1].Replace ("IOS|", string.Empty).Trim ();
		return category;
	}
	public static string GetBannerIDAndroid()
	{
		string category = "";
		string[] TextInAsset= Resources.Load<TextAsset>("AllAds").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		category = TextInAsset [0].Replace ("ANDROID_BANNER|", string.Empty).Trim ();
		return category;
	}
	public static string GetBannerIDIOS()
	{
		string category = "";
		string[] TextInAsset= Resources.Load<TextAsset>("AllAds").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		category = TextInAsset [1].Replace ("IOS_BANNER|", string.Empty).Trim ();
		return category;
	}
	public static string GetInterstitialIDAndroid()
	{
		string category = "";
		string[] TextInAsset= Resources.Load<TextAsset>("AllAds").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		category = TextInAsset [2].Replace ("ANDROID_INTERSTITIAL|", string.Empty).Trim ();
		return category;
	}
	public static string GetInterstitialIDIOS()
	{
		string category = "";
		string[] TextInAsset= Resources.Load<TextAsset>("AllAds").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		category = TextInAsset [3].Replace ("IOS_INTERSTITIAL|", string.Empty).Trim ();
		return category;
	}
	static void SaveIAPToAsset()
	{
		string saveStr ="SKUS|";
		int i = 0;
		for(i=0;i<SKUs.Count;i++)
			saveStr+=SKUs[i]+",";
		saveStr=saveStr.Substring(0, saveStr.Length - 1);
		saveStr+="\n";
		saveStr+="PRICING|";
		for(i=0;i<Pricing.Count;i++)
			saveStr+=Pricing[i]+",";
		saveStr=saveStr.Substring(0, saveStr.Length - 1);
		saveStr+="\n";
		saveStr+="TESTMODE|"+IAPTestMode.ToString();
		#if UNITY_EDITOR
		if (Application.platform == RuntimePlatform.OSXEditor || Application.platform == RuntimePlatform.WindowsEditor)
		{
			//Write to file
			string activeDir = Application.dataPath + @"/Resources/";
			string newPath = System.IO.Path.Combine(activeDir, "AllIAP.txt");
			FileStream fs;
			fs=File.Create(newPath);
			byte[] SaveByte=System.Text.Encoding.UTF8.GetBytes(saveStr);
			fs.Write(SaveByte,0,SaveByte.Length);
			fs.Close();
			AssetDatabase.Refresh();
		}
		#endif
	}
	public static List<string> GetSKUs()
	{
		List<string> category=new List<string>();
		string[] TextInAsset= Resources.Load<TextAsset>("AllIAP").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		string[] CategoryInAsset=TextInAsset[0].Replace("SKUS|", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset) 
		{
			category.Add (s);
			
		}

		return category;
	}
	public static List<string> GetPricing()
	{
		List<string> category=new List<string>();
		string[] TextInAsset= Resources.Load<TextAsset>("AllIAP").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		string[] CategoryInAsset=TextInAsset[1].Replace("PRICING|", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset) 
		{
			category.Add (s);
			
		}
		return category;
	}
	public static bool GetTestMode()
	{
		bool category = false;
		string[] TextInAsset= Resources.Load<TextAsset>("AllIAP").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		category = System.Convert.ToBoolean(TextInAsset [2].Replace ("TESTMODE|", string.Empty).Trim ());
		return category;
	}
	public static void SetLockedColors()
	{
		PlayerPrefsX.SetBool ("AllColors", true);
	}
	public static bool GetLockedColors()
	{
		if(PlayerPrefs.HasKey("AllColors"))
			return PlayerPrefsX.GetBool("AllColors");
		return true;
	}
	public static string LoadWaterMark()
	{
		string[] TextInAsset= Resources.Load<TextAsset>("AllSettings").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		string[] CategoryInAsset=TextInAsset[8].Split(new string[] { "|" }, System.StringSplitOptions.RemoveEmptyEntries);
		return CategoryInAsset [1];
	}
	public static List<string> LoadSocialIcons()
	{
		List<string> category=new List<string>();
		string[] TextInAsset= Resources.Load<TextAsset>("AllSettings").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		string[] CategoryInAsset=TextInAsset[7].Replace("SOCIALICONIMAGES|", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset) 
		{
			category.Add (s);

		}
		
		return category;
	}
	public static List<string> LoadUIIcons()
	{
		List<string> category=new List<string>();
		string[] TextInAsset= Resources.Load<TextAsset>("AllSettings").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		string[] CategoryInAsset=TextInAsset[6].Replace("UIICONIMAGES|", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset) 
		{
			category.Add (s);
			
		}
		
		return category;
	}
	public static string LoadInspirationWebLink()
	{
		string[] TextInAsset= Resources.Load<TextAsset>("AllSettings").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		string[] CategoryInAsset=TextInAsset[3].Split(new string[] { "|" }, System.StringSplitOptions.RemoveEmptyEntries);
		return CategoryInAsset [1];
	}
	public static List<string>  LoadHomeButtImages()
	{
		List<string> category=new List<string>();
		string[] TextInAsset= Resources.Load<TextAsset>("AllSettings").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		string[] CategoryInAsset=TextInAsset[1].Replace("HOMEBUTTONIMAGES|", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset) 
		{
			category.Add (s);
		
		}
			
		return category;
	}
	public static List<string> LoadPopUpButtonNames()
	{
		List<string> category=new List<string>();
		string[] TextInAsset= Resources.Load<TextAsset>("AllSettings").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		string[] CategoryInAsset=TextInAsset[4].Replace("POPUPBUTTONS|", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset)
			category.Add (s);
		return category;
	}
	public static List<string> LoadPopUpButtonColors()
	{
		List<string> category=new List<string>();
		string[] TextInAsset= Resources.Load<TextAsset>("AllSettings").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		string[] CategoryInAsset=TextInAsset[5].Replace("POPUPBUTTONCOLORS|", string.Empty).Trim().Split(new string[] { ":" }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset)
			category.Add (s);
		return category;
	}
	public static List<string> LoadHomeButtColors()
	{
		List<string> category=new List<string>();
		string[] TextInAsset= Resources.Load<TextAsset>("AllSettings").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		string[] CategoryInAsset=TextInAsset[2].Replace("HOMEBUTTONCOLORS|", string.Empty).Trim().Split(new string[] { ":" }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset)
			category.Add (s);
		return category;
	}
	public static List<string>  LoadHomeButtNames()
	{
		List<string> category=new List<string>();
		string[] TextInAsset= Resources.Load<TextAsset>("AllSettings").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		string[] CategoryInAsset=TextInAsset[0].Replace("HOMEBUTTONS|", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset)
			category.Add (s);
		return category;
	}
	public static void SaveData(CategoryList list)
	{
		PlayerPrefs.DeleteAll ();
//		if (!PlayerPrefsX.GetBool ("ImagesStored")) {
						GetAllPathToImages (list);
//						SetImagePaths ();
//					} else
//						GetImagePaths ();

	}
//	void Start()
//	{
////		PlayerPrefs.DeleteAll ();
//		Debug.Log (Application.dataPath);
//		Debug.Log("Comes Here");
////		foreach (Category c in list.ListOfCategories) 
////		{
////
//////			Debug.Log(AssetDatabase.GetAssetPath (c.mainImage).Length);
//////			Debug.Log(AssetDatabase.GetAssetPath (c.mainImage).Substring(17,AssetDatabase.GetAssetPath (c.mainImage).Length-17));
////		}	
//		if (!PlayerPrefsX.GetBool ("ImagesStored")) {
//			GetAllPathToImages ();
//			SetImagePaths ();
//		} else
//			GetImagePaths ();
//		Resources.UnloadUnusedAssets ();
//		Application.LoadLevel("Gallery");
//
//	}
	public static void SetImagePaths()
	{
		PlayerPrefsX.SetStringArray ("Categories", imageCategories.ToArray());
		PlayerPrefsX.SetStringArray ("MainImages", mainCategoryImages.ToArray ());
		List<string> tmpImagesInCategory = new List<string> ();
		List<bool> tmpImgLockStatus = new List<bool> ();
		foreach (ImagePath i in imagesInCategory) 
		{
			tmpImagesInCategory.Add (i.imagePath);
			tmpImgLockStatus.Add(i.isLocked);
		}	
		PlayerPrefsX.SetIntArray ("CategoryImagesCount", imagesInCategoryCount.ToArray ());
		PlayerPrefsX.SetStringArray ("CategoryImages", tmpImagesInCategory.ToArray ());
		PlayerPrefsX.SetBoolArray ("CategoryLockStatus", tmpImgLockStatus.ToArray ());
		tmpImgLockStatus.Clear ();
		tmpImagesInCategory.Clear ();
		foreach (ImagePath i in editedImagesInCategory) 
		{
			tmpImagesInCategory.Add (i.imagePath);
			tmpImgLockStatus.Add(i.isLocked);
		}
		PlayerPrefsX.SetStringArray ("EditedCategoryImages", tmpImagesInCategory.ToArray ());
		PlayerPrefsX.SetBoolArray ("EditedCategoryLockStatus", tmpImgLockStatus.ToArray ());
		tmpImgLockStatus.Clear ();
		tmpImagesInCategory.Clear ();
	}

	public static void GetImagePaths()
	{
		imageCategories=PlayerPrefsX.GetStringArray ("Categories").ToList ();
		mainCategoryImages = PlayerPrefsX.GetStringArray ("MainImages").ToList ();
		for (int i=0; i<PlayerPrefsX.GetStringArray("CategoryImages").Length; i++) 
		{
			imagesInCategory.Add(new ImagePath(PlayerPrefsX.GetStringArray ("CategoryImages")[i],PlayerPrefsX.GetBoolArray("CategoryLockStatus")[i]));
			editedImagesInCategory.Add(new ImagePath(PlayerPrefsX.GetStringArray ("EditedCategoryImages")[i],PlayerPrefsX.GetBoolArray("EditedCategoryLockStatus")[i]));
		}
		imagesInCategoryCount = PlayerPrefsX.GetIntArray ("CategoryImagesCount").ToList();
	}
	public static void GetAllPathToImages(CategoryList list)
	{
		imagesInSubCategory=new List<string> ();
		mainCategoryImages=new List<string> ();
		imageCategories = new List<string> ();
		imagesInCategory  = new List<ImagePath> ();
		editedImagesInCategory = new List<ImagePath> ();
		waterMarkedImages = new List<ImagePath> ();
		imagesInCategoryCount = new List<int> ();
		imagesInSubcategoryCount = new List<int> ();
		Debug.Log (list.ListOfCategories.Count ());
		int CurrentIndex = 0;
		foreach (Category c in list.ListOfCategories) 
		{
			imageCategories.Add(c.CategoryName);
			imagesInCategoryCount.Add(c.images.ListOfImageAssets.Count);
			CurrentIndex=1;
			foreach(ImageAsset tMain in c.images.ListOfImageAssets)
			{
//				DataManager.Instance.FileCreatorBytes(Resources.Load<Texture2D>(AssetDatabase.GetAssetPath (tMain.image).
//				                                                                Substring(17,AssetDatabase.GetAssetPath (tMain.image).Length-21)).EncodeToPNG(),c.CategoryName+CurrentIndex.ToString())
//				imagesInCategory.Add(new ImagePath(
//					AssetDatabase.GetAssetPath (tMain.image).Substring(17,AssetDatabase.GetAssetPath (tMain.image).Length-21),tMain.isLocked));
				#if UNITY_EDITOR
				imagesInSubCategory.Add (AssetDatabase.GetAssetPath (tMain.image).Substring(17,AssetDatabase.GetAssetPath (tMain.image).Length-21)); 
				#endif
								FileCreatorBytes(tMain.image.EncodeToPNG(),c.CategoryName+CurrentIndex.ToString());
//				FileCopier(c.CategoryName+CurrentIndex.ToString(),c.CategoryName+CurrentIndex.ToString()+"D");
				FileCreatorBytes(tMain.image.EncodeToPNG(),c.CategoryName+CurrentIndex.ToString()+"D");
//				FileCopier(c.CategoryName+CurrentIndex.ToString(),c.CategoryName+CurrentIndex.ToString()+"W");
				imagesInCategory.Add(new ImagePath(c.CategoryName+CurrentIndex.ToString(),tMain.isLocked));
				editedImagesInCategory.Add(new ImagePath(c.CategoryName+CurrentIndex.ToString()+"D",tMain.isLocked));
//				waterMarkedImages.Add(new ImagePath(c.CategoryName+CurrentIndex.ToString()+"W",tMain.isLocked));
//				Resources.UnloadAsset(tMain);
				CurrentIndex++;
			}
            #if UNITY_EDITOR
			mainCategoryImages.Add (AssetDatabase.GetAssetPath (c.mainImage).Substring(17,AssetDatabase.GetAssetPath (c.mainImage).Length-21));
			#endif
//			Resources.UnloadAsset(c.mainImage);
//			if(c.hasSubCategory)
//			{
////				imagesInSubcategoryCount.Add (c.subCategoryImages.Count);
////				foreach(Texture2D tSub in c.subCategoryImages)
////				{
	////					imagesInSubCategory.Add (AssetDatabase.GetAssetPath (tSub).Substring(17,AssetDatabase.GetAssetPath (tSub).Length-17));
////
//////					Resources.UnloadAsset(tSub);
////				}
//					
//			}
		}
//		list.ListOfCategories.Clear ();
		foreach (ImagePath iSub in  imagesInCategory) 
		{

			Debug.Log(iSub.imagePath);
		}
		PlayerPrefsX.SetBool ("ImagesStored", true);
		SaveDataToAsset ();
	}
#if UNITY_ANDROID || UNITY_IOS || UNITY_WEBGL
	public static void ForMobileDeviceOnly(List<string> subImgResPath,List<string> subImgFilePath)
	{
		foreach(string s in subImgResPath)
			FileCreatorBytes(Resources.Load<Texture2D>(s).EncodeToPNG(),subImgFilePath[subImgResPath.IndexOf(s)]);
		PlayerPrefsX.SetBool ("ImagesStoredMobile", true);
		FileCreatorLines ((Resources.Load<TextAsset> ("AllImageData").text).Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries), "AllImageData");
		FileCreatorLines ((Resources.Load<TextAsset> ("AllSettings").text).Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries), "AllSettings");
	} 
#endif
	public static void UnlockCategories()
	{
		imagesInCategory = new List<ImagePath> ();
		imagesInCategory = LoadoriginalSubImagePath ();
		foreach (ImagePath iOrig in imagesInCategory)
			iOrig.isLocked = false;
		editedImagesInCategory = new List<ImagePath> ();
		editedImagesInCategory = LoadSubImagePathFromAsset ();
		foreach (ImagePath iEdit in editedImagesInCategory)
			iEdit.isLocked = false;
		imageCategories = new List<string> ();
		imageCategories = LoadCategoryFromAsset ();
		mainCategoryImages = new List<string> ();
		mainCategoryImages = LoadMainImagePathFromAsset ();
		imagesInCategoryCount = new List<int> ();
		imagesInCategoryCount = LoadSubImageCountFromAsset ();
		imagesInSubCategory = new List<string> ();
		imagesInSubCategory = LoadSubImageResourcePathFromAsset ();
		SaveDataToAsset ();
//		Resources.UnloadUnusedAssets ();
	}
	static void SaveDataToAsset()
	{
		string saveStr = "CATEGORY ";
		foreach(string sCat in imageCategories)
			saveStr+=sCat+",";
		saveStr=saveStr.Substring(0, saveStr.Length - 1);
		saveStr+="\n";
		saveStr+="MAINIMAGEPATH ";
		foreach(string sMain in mainCategoryImages)
			saveStr+=sMain+",";
		saveStr=saveStr.Substring(0, saveStr.Length - 1);
		saveStr+="\n";
		saveStr+="SUBIMAGEPATH ";
		foreach (ImagePath iSub in  imagesInCategory) 
		{
			saveStr+=iSub.imagePath+"|"+iSub.isLocked.ToString()+",";
//			Debug.Log(iSub.imagePath);
		}
		saveStr=saveStr.Substring(0, saveStr.Length - 1);
		saveStr+="\n";
		saveStr+="EDITEDSUBIMAGEPATH ";
		foreach (ImagePath iSubEdit in editedImagesInCategory) 
		{
			Debug.Log(iSubEdit.isLocked.ToString());
			saveStr+=iSubEdit.imagePath+"|"+iSubEdit.isLocked.ToString()+",";
		}
		saveStr=saveStr.Substring(0, saveStr.Length - 1);
		saveStr+="\n";
		saveStr+="IMAGESINCATEGORYCOUNT ";
		foreach(int i in imagesInCategoryCount)
			saveStr+=i.ToString()+",";
		saveStr=saveStr.Substring(0, saveStr.Length - 1);
		saveStr+="\n";
		saveStr+="IMAGEPATHINRESOURCE ";
		foreach(string s in imagesInSubCategory)
			saveStr+=s+",";
		saveStr=saveStr.Substring(0, saveStr.Length - 1);
		//		saveStr+="\n";
		//		saveStr+="WATERMARKEDIMAGES ";
		//		foreach (ImagePath iSubEdit in waterMarkedImages) 
		//		{
		//			saveStr+=iSubEdit.imagePath+" "+iSubEdit.isLocked.ToString()+",";
		//		}
		//		saveStr=saveStr.Substring(0, saveStr.Length - 1);
#if UNITY_ANDROID || UNITY_IOS || UNITY_WEBGL
		Debug.Log("Writing Saved Data into files");
		FileCreatorLines(saveStr.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries),"AllImageData"); 
		#endif
		if (Application.platform == RuntimePlatform.OSXEditor || Application.platform == RuntimePlatform.WindowsEditor)
		{
			//Write to file
			Debug.Log("Writing Saved Data into files in Editor");
			string activeDir = Application.dataPath + @"/Resources/";
			string newPath = System.IO.Path.Combine(activeDir, "AllImageData.txt");
			FileStream fs;
			fs=File.Create(newPath);
			byte[] SaveByte=System.Text.Encoding.UTF8.GetBytes(saveStr);
			fs.Write(SaveByte,0,SaveByte.Length);
			fs.Close();
			#if UNITY_EDITOR
			AssetDatabase.Refresh();
			#endif
		}
	}
	public static List<string> LoadCategoryFromAsset()
	{
		List<string> category=new List<string>();
		string[] TextInAsset=new string[0];
		#if UNITY_EDITOR
		TextInAsset= Resources.Load<TextAsset>("AllImageData").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
#endif
#if UNITY_ANDROID || UNITY_IOS || UNITY_WEBGL
		TextInAsset = FileReaderLines("AllImageData").Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		#endif
		string[] CategoryInAsset=TextInAsset[0].Replace("CATEGORY ", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset)
			category.Add (s);
		return category;
	}
	public static List<string> LoadMainImagePathFromAsset()
	{
		List<string> mainImgPath=new List<string>();
		string[] TextInAsset=new string[0];
#if UNITY_EDITOR
		TextInAsset= Resources.Load<TextAsset>("AllImageData").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
#endif
#if UNITY_ANDROID || UNITY_IOS || UNITY_WEBGL
		TextInAsset = FileReaderLines("AllImageData").Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
#endif

		string[] CategoryInAsset=TextInAsset[1].Replace("MAINIMAGEPATH ", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset)
			mainImgPath.Add (s);
		return mainImgPath;
	}
	public static List<ImagePath> LoadoriginalSubImagePath()
	{
		List<ImagePath> subImgPath=new List<ImagePath>();
		string[] TextInAsset=new string[0];
		#if UNITY_EDITOR
		TextInAsset= Resources.Load<TextAsset>("AllImageData").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
#endif
#if UNITY_ANDROID || UNITY_IOS || UNITY_WEBGL
		TextInAsset = FileReaderLines("AllImageData").Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		#endif

		string[] CategoryInAsset=TextInAsset[2].Replace("SUBIMAGEPATH ", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset) {
			subImgPath.Add (new ImagePath(s.Split(new string[] { "|" }, System.StringSplitOptions.RemoveEmptyEntries)[0],System.Convert.ToBoolean(s.Split(new string[] { "|" }, System.StringSplitOptions.RemoveEmptyEntries)[1])));
		}
		return subImgPath;
	}
	public static List<ImagePath> LoadSubImagePathFromAsset()
	{
		List<ImagePath> subImgPath=new List<ImagePath>();
		string[] TextInAsset=new string[0];
		#if UNITY_EDITOR
		TextInAsset= Resources.Load<TextAsset>("AllImageData").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
#endif
#if UNITY_ANDROID || UNITY_IOS || UNITY_WEBGL
		TextInAsset = FileReaderLines("AllImageData").Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		#endif

		string[] CategoryInAsset=TextInAsset[3].Replace("EDITEDSUBIMAGEPATH ", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset) {
			subImgPath.Add (new ImagePath(s.Split(new string[] { "|" }, System.StringSplitOptions.RemoveEmptyEntries)[0],System.Convert.ToBoolean(s.Split(new string[] { "|" }, System.StringSplitOptions.RemoveEmptyEntries)[1])));

		}
		return subImgPath;
	}
	public static List<ImagePath> LoadSubImagePathFromUnityAsset()
	{
		List<ImagePath> subImgPath=new List<ImagePath>();

		string[] TextInAsset= Resources.Load<TextAsset>("AllImageData").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);

		
		string[] CategoryInAsset=TextInAsset[3].Replace("EDITEDSUBIMAGEPATH ", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset) {
			subImgPath.Add (new ImagePath(s.Split(new string[] { "|" }, System.StringSplitOptions.RemoveEmptyEntries)[0],System.Convert.ToBoolean(s.Split(new string[] { "|" }, System.StringSplitOptions.RemoveEmptyEntries)[1])));
//			Debug.Log(s.Split(new string[] { " " }, System.StringSplitOptions.RemoveEmptyEntries)[0]+System.Convert.ToBoolean(s.Split(new string[] { " " }, System.StringSplitOptions.RemoveEmptyEntries)[1]).ToString());
		}
		return subImgPath;
	}
//	public static List<ImagePath> LoadWaterMarkedImages()
//	{
//		List<ImagePath> subImgPath=new List<ImagePath>();
//		string[] TextInAsset= Resources.Load<TextAsset>("AllImageData").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
//		string[] CategoryInAsset=TextInAsset[3].Replace("WATERMARKEDIMAGES ", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
//		foreach (string s in CategoryInAsset) {
//			subImgPath.Add (new ImagePath(s.Split(new string[] { " " }, System.StringSplitOptions.RemoveEmptyEntries)[0],System.Convert.ToBoolean(s.Split(new string[] { " " }, System.StringSplitOptions.RemoveEmptyEntries)[1])));
//		}
//		return subImgPath;
//	}
	public static List<string> LoadSubImageResourcePathFromAsset()
	{
		List<string> subImgResPath=new List<string>();
		string[] TextInAsset=new string[0];
		#if UNITY_EDITOR
		TextInAsset= Resources.Load<TextAsset>("AllImageData").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
#endif
#if UNITY_ANDROID || UNITY_IOS || UNITY_WEBGL
		TextInAsset = FileReaderLines("AllImageData").Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		#endif

		string[] CategoryInAsset=TextInAsset[5].Replace("IMAGEPATHINRESOURCE ", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset)
			subImgResPath.Add (s);
		return subImgResPath;
	}
	public static List<string> LoadSubImageResourcePathFromUnityAsset()
	{
		List<string> subImgResPath=new List<string>();

		string[] TextInAsset= Resources.Load<TextAsset>("AllImageData").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);

		
		string[] CategoryInAsset=TextInAsset[5].Replace("IMAGEPATHINRESOURCE ", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset)
			subImgResPath.Add (s);
		return subImgResPath;
	}
	public static List<int> LoadSubImageCountFromAsset()
	{
		List<int> subImgCount=new List<int>();
		string[] TextInAsset=new string[0];
		#if UNITY_EDITOR
		TextInAsset= Resources.Load<TextAsset>("AllImageData").text.Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
#endif
#if UNITY_ANDROID || UNITY_IOS || UNITY_WEBGL
		TextInAsset = FileReaderLines("AllImageData").Split(new string[] { "\n" }, System.StringSplitOptions.RemoveEmptyEntries);
		#endif

		string[] CategoryInAsset=TextInAsset[4].Replace("IMAGESINCATEGORYCOUNT ", string.Empty).Trim().Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries);
		foreach (string s in CategoryInAsset)
			subImgCount.Add (int.Parse(s));
		return subImgCount;
	}
	public static void FileCreatorLines(string[] fileData,string fileName)
	{
		string filePath;
#if UNITY_ANDROID || UNITY_WEBGL
		Debug.Log(fileName);
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#endif
		#if UNITY_IPHONE
		//		string fileNameBase = Application.dataPath.Substring(0, Application.dataPath.LastIndexOf('/'));
		//		filePath = fileNameBase.Substring(0, fileNameBase.LastIndexOf('/')) + "/Documents/" + fileName;
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#endif
		#if UNITY_EDITOR
		Debug.Log(fileName);
		Debug.Log("In UNity Editor");
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#endif
		//		BinaryWriter bw;
		//		bw=File.WriteAllBytes (filePath, fileData);
		//		bw.Close ();
//		FileStream fs;
//		fs=File.Create(filePath);
		System.IO.File.WriteAllLines (filePath, fileData);
//			fs.Write (System.Text.Encoding.UTF8.GetBytes (fileData), 0, System.Text.Encoding.UTF8.GetBytes (fileData).Length);
//		fs.Close ();
	}

	public  static void FileCreatorBytes( byte[] fileData,string fileName)
	{
		//Create a file of specificed file-name and save byte array to it.

		string filePath;
#if UNITY_ANDROID || UNITY_WEBGL
		Debug.Log(fileName);
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
//		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#elif UNITY_IPHONE&&!UNITY_EDITOR
		//		string fileNameBase = Application.dataPath.Substring(0, Application.dataPath.LastIndexOf('/'));
		//		filePath = fileNameBase.Substring(0, fileNameBase.LastIndexOf('/')) + "/Documents/" + fileName;
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#endif
		#if UNITY_EDITOR
		Debug.Log(fileName);
		Debug.Log("In UNity Editor");
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#endif
		//		BinaryWriter bw;
		//		bw=File.WriteAllBytes (filePath, fileData);
		//		bw.Close ();
		FileStream fs;
		fs=File.Create(filePath);
		fs.Write (fileData, 0, fileData.Length);
		fs.Close ();
	}
	public  static void FileCopier(string fileName,string copiedFileName)
	{
		string filePath,copiedFilePath;
#if UNITY_ANDROID || UNITY_WEBGL
		filePath = Application.persistentDataPath + "/"+fileName + ".txt";
		copiedFilePath=Application.persistentDataPath + "/"+copiedFileName + ".txt";
		#elif UNITY_IPHONE&&!UNITY_EDITOR
		copiedFilePath=Application.persistentDataPath + "/"+copiedFileName + ".txt";
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#endif
		#if UNITY_EDITOR
		copiedFilePath=Application.persistentDataPath + "/"+copiedFileName + ".txt";
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#endif
		System.IO.File.Copy (filePath, copiedFilePath, true);
	}
	public  static string FileReaderLines(string fileName)
	{
		//read byte array of colors from specified file-path and return.
		string imageColors="";
		string filePath;
		#if UNITY_ANDROID|| UNITY_WEBGL
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		
		#elif UNITY_IPHONE&&!UNITY_EDITOR
		//	string fileNameBase = Application.dataPath.Substring(0, Application.dataPath.LastIndexOf('/'));
		//		filePath = fileNameBase.Substring(0, fileNameBase.LastIndexOf('/')) + "/Documents/" + fileName;
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#elif UNITY_EDITOR
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#endif
		if(System.IO.File.Exists(filePath))
			imageColors = System.IO.File.ReadAllText (filePath);
		return imageColors;
		
	}
}
