using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
public class GalleryHandler : MonoBehaviour {

	public float categoryListStartPos,subCategoryListStartPos;
	public GameObject mainCategoryItem,categoryPanel,subCategoryPanel,subCategoryItem,subCategoryRect,lockCategory,Header,IAPPanel;
	public List<GameObject> Footer,FooterText;
	public List<GameObject> subCategoryItemList,IAPPanelButts;
	public static GalleryHandler myInstance;
	public static GalleryHandler Instance
	{
		get{
			if(myInstance==null)
				myInstance=FindObjectOfType(typeof(GalleryHandler)) as GalleryHandler;
			return myInstance;
		}
	}
	// Use this for initialization
	void Start () {
//		bool some = false;
//		string s = some.ToString ();
//		Debug.Log (s);
//		Debug.Log (System.Convert.ToBoolean(s));
//		PlayerPrefs.DeleteAll ();
		if (!PlayerPrefsX.GetBool ("ImagesStoredMobile")) 
		{

			#if UNITY_ANDROID ||UNITY_IOS || UNITY_WEBGL
			Debug.Log("Creating Files");
			List<string> filePath=new List<string>();
			List<ImagePath> filePathInAsset= ImagePathHolder.LoadSubImagePathFromUnityAsset();
			foreach(ImagePath i in filePathInAsset)
				filePath.Add(i.imagePath);
			ImagePathHolder.ForMobileDeviceOnly (ImagePathHolder.LoadSubImageResourcePathFromUnityAsset(), filePath);
			#endif
		}
//		UnityEditor.AssetDatabase.Refresh ();
////		PlayerPrefsX.SetBool ("AllColors", false);
		GenerateMainCategoryList ();
		SetHomeScreen ();
		subCategoryListStartPos = categoryListStartPos;

		//AdManager.SharedManager.ShowBanner ();
	}
	void SetHomeScreen()
	{
		List<string> HomeButtNames = new List<string> ();
		List<string> HomeButtImages = new List<string> ();
		List<string> HomeButtColors = new List<string> ();
		HomeButtImages = ImagePathHolder.LoadHomeButtImages ();
		HomeButtNames = ImagePathHolder.LoadHomeButtNames ();
		HomeButtColors = ImagePathHolder.LoadHomeButtColors ();
		Header.GetComponent<Text> ().text = HomeButtNames [0];
		foreach (GameObject g in FooterText)
			g.GetComponent<Text> ().text = HomeButtNames [FooterText.IndexOf (g)];
		foreach (GameObject g in Footer)
			g.GetComponent<Image> ().sprite = Resources.Load<Sprite> (HomeButtImages [Footer.IndexOf (g)]);
//		foreach (GameObject g in Footer) 
//		{
//			g.GetComponent<UnityEngine.UI.Button>().transition=UnityEngine.UI.Selectable.Transition.ColorTint;
//			ColorBlock c=g.GetComponent<UnityEngine.UI.Button>().colors;
//			c.normalColor=Color.white;
//			c.disabledColor=Color.white;
//			c.pressedColor= GetColorFromString(HomeButtColors [Footer.IndexOf (g)]);
//			c.highlightedColor=Color.white;
//			g.GetComponent<UnityEngine.UI.Button>().colors=c;
//		}
	}
	Color GetColorFromString(string color)
	{
		Debug.Log (color);
		string[] strings = color.Substring(1,color.Length-2).Split(","[0] );
		Debug.Log (strings.Length);
		Color output=Color.blue;
		for (int i = 0; i < 4; i++) {
			output[i] = System.Single.Parse(strings[i]);
		}
		return output;
	}
	void GenerateMainCategoryList()
	{
		mainCategoryItem.SetActive (true);
		Texture2D image=new Texture2D(512,512,TextureFormat.PVRTC_RGBA4,false);
		List<string> category = ImagePathHolder.LoadCategoryFromAsset ();
		List<string> mainImg = ImagePathHolder.LoadMainImagePathFromAsset ();
		//FIXME
		category.Remove("Mandalas");
		foreach (string s in category) 
		{
			GameObject imageItem=GameObject.Instantiate(mainCategoryItem,new Vector3(0,categoryListStartPos,0), Quaternion.identity) as GameObject;

			imageItem.transform.SetParent(categoryPanel.transform,false);
			imageItem.GetComponent<RectTransform>().localScale=new Vector3(1f,1f,1f);
			imageItem.GetComponent<RectTransform>().anchoredPosition3D=new Vector3(0f,categoryListStartPos,0f);
//			imageItem.transform.FindChild("Image").GetComponent<Image>().sprite=Sprite.Create(image.LoadImage(
//				ImagePathHolder.Instance.mainCategoryImages[ImagePathHolder.Instance.LoadCategoryFromAsset().IndexOf(s)]));
//			Debug.Log(mainImg[category.IndexOf(s)]);
			imageItem.transform.GetChild(1).GetComponent<Image>().sprite=
				Resources.Load<Sprite>(mainImg[category.IndexOf(s)]);
			imageItem.transform.GetChild(0).GetComponent<Text>().text=s;
			imageItem.AddComponent<ImageDetails>();
			imageItem.GetComponent<ImageDetails>().CategoryName=s;
//			imageItem.GetComponent<UnityEngine.UI.Button>().onClick.AddListener(delegate {StartCoroutine(GenerateSubCategoryList(imageItem));});
//			imageItem.transform.GetChild(1).GetComponent<UnityEngine.UI.Button>().onClick.AddListener(delegate {StartCoroutine(GenerateSubCategoryList(imageItem));});
			imageItem.GetComponent<UnityEngine.UI.Button>().onClick.AddListener(delegate{StartCoroutine(GenerateSubImages(imageItem));});
			imageItem.transform.GetChild(1).GetComponent<UnityEngine.UI.Button>().onClick.AddListener(delegate{StartCoroutine(GenerateSubImages(imageItem));});
			categoryListStartPos-=700f;
		}
		mainCategoryItem.SetActive (false);
	}
	public IEnumerator GenerateSubImages(GameObject g)
	{
		CircularLoader.Instance.Loader ();
		GenerateSubCategoryList (g);
		yield return new WaitForSeconds(0.0f);
		CircularLoader.Instance.isLoading = false;
		subCategoryRect.SetActive(true);
		categoryPanel.SetActive(false);
		subCategoryItem.SetActive(false);
	}
	public void  GenerateSubCategoryList(GameObject g)
	{
		subCategoryItem.SetActive (true);
		List<string> category = ImagePathHolder.LoadCategoryFromAsset ();
		List<ImagePath> editedSubImg = ImagePathHolder.LoadSubImagePathFromAsset ();
		List<string> origResImg = ImagePathHolder.LoadSubImageResourcePathFromAsset ();
		List<int> subImgCount = ImagePathHolder.LoadSubImageCountFromAsset ();
		int startingImgIndex = 0;
		Header.GetComponent<Text> ().text = g.GetComponent<ImageDetails> ().CategoryName;
		for (int j=0; j<category.IndexOf(g.GetComponent<ImageDetails>().CategoryName); j++)
			startingImgIndex += subImgCount [j];

		for (int i=0; i<subImgCount[category.IndexOf(g.GetComponent<ImageDetails>().CategoryName)]; i++) 
		{
			Texture2D image=new Texture2D(1,1,TextureFormat.PVRTC_RGBA4,false);
			GameObject imageItem=GameObject.Instantiate(subCategoryItem,new Vector3(0,subCategoryListStartPos,0), Quaternion.identity) as GameObject;
			
			imageItem.transform.SetParent(subCategoryPanel.transform,false);
			imageItem.GetComponent<RectTransform>().localScale=new Vector3(1f,1f,1f);
			imageItem.GetComponent<RectTransform>().anchoredPosition3D=new Vector3(0f,subCategoryListStartPos,0f);
			//			imageItem.transform.FindChild("Image").GetComponent<Image>().sprite=Sprite.Create(image.LoadImage(
			//				ImagePathHolder.Instance.mainCategoryImages[ImagePathHolder.Instance.LoadCategoryFromAsset().IndexOf(s)]));
//			Debug.Log(ImagePathHolder.imagesInCategory[startingImgIndex+i].imagePath);
//			imageItem.transform.GetChild(0).GetComponent<Text>().text=g.GetComponent<ImageDetails>().CategoryName+" "+(i+1).ToString();
//			imageItem.transform.GetChild(1).GetComponent<Image>().sprite=
//				Resources.Load<Sprite>(ImagePathHolder.Instance.imagesInCategory[startingImgIndex+i].imagePath);
//			image.LoadImage(DataManager.Instance.FileReaderBytes(ImagePathHolder.Instance.imagesInCategory[startingImgIndex+i].imagePath));
			image.LoadImage(DataManager.Instance.FileReaderBytes(editedSubImg[startingImgIndex+i].imagePath));
			
			image.Apply();
			imageItem.transform.GetChild(1).GetComponent<Image>().sprite=
				Sprite.Create(image,new Rect(0f,0f,(float)1024,(float)1024),new Vector2(0.5f,0.5f));
			//			if(ImagePathHolder.Instance.imagesInCategory[startingImgIndex+i].isLocked)
			imageItem.transform.GetChild(2).gameObject.SetActive(false);// editedSubImg[startingImgIndex+i].isLocked);
			imageItem.GetComponent<UnityEngine.UI.Button>().onClick.AddListener(delegate {OnImageHit(imageItem);});
			imageItem.transform.GetChild(1).GetComponent<UnityEngine.UI.Button>().onClick.AddListener(delegate {OnImageHit(imageItem);});
			imageItem.AddComponent<ImageDetails>();
			imageItem.GetComponent<ImageDetails>().FileName=editedSubImg[startingImgIndex+i].imagePath;
			imageItem.GetComponent<ImageDetails>().ResName=origResImg[startingImgIndex+i];
			subCategoryItemList.Add(imageItem);
			subCategoryListStartPos-=700f;

		}

	}
	public void OnImageHit(GameObject g)
	{
		//Debug.Log(g.GetComponent<ImageDetails> ().FileName);
		DataManager.Instance.selectedFileName = g.GetComponent<ImageDetails> ().FileName;
		DataManager.Instance.selectedResourceName = g.GetComponent<ImageDetails> ().ResName;
		DataManager.Instance.LoadScene ("NewGamePlay", 0.25f);
//		AutoFade.LoadLevel ("NewGamePlay", 0.5f, 0.5f, Color.white);
	}
	public void OnGalleryHit()
	{
		Debug.Log("Gallery was hit");
		SetHomeScreen ();

		foreach (GameObject g in subCategoryItemList)
			Destroy (g);
		Resources.UnloadUnusedAssets ();
		subCategoryItemList.Clear ();
		subCategoryRect.SetActive (false);
		categoryPanel.SetActive (true);

	}
	public void ReloadLevel()
	{
		Application.LoadLevel("Gallery");
	}
	public void OnMyDrawings()
	{
		DataManager.Instance.LoadScene ("MyDrawings", 0.25f);
		Debug.Log("OnMyDrawings");
//		AutoFade.LoadLevel ("MyDrawings", 0.5f, 0.5f, Color.white);
//		Application.LoadLevel("MyDrawings");
	}
	public void OnInspirationHit()
	{
		Application.LoadLevel("Inspiration");
	}
	public void OnHitLocked()
	{
		return;
		//IAPPanel.SetActive (true);
		//SetIAPPanel ();
	}
	void SetIAPPanel()
	{
		return;
//		List<string> SKUs = new List<string> ();
//		SKUs = ImagePathHolder.GetSKUs ();
		//List<string> Pricing = new List<string> ();
		//Pricing = ImagePathHolder.GetPricing ();
		//foreach (GameObject g in IAPPanelButts) 
		//	g.transform.GetChild (1).GetComponent<UnityEngine.UI.Text> ().text = Pricing [IAPPanelButts.IndexOf (g)];
		//IAPPanelButts [0].GetComponent<UnityEngine.UI.Button> ().onClick.AddListener (delegate {InAppManager.Instance.SetUnlockedCategory ();});
		//IAPPanelButts [1].GetComponent<UnityEngine.UI.Button> ().onClick.AddListener (delegate {InAppManager.Instance.SetUnlockedColors ();});
		//IAPPanelButts [2].GetComponent<UnityEngine.UI.Button> ().onClick.AddListener (delegate {InAppManager.Instance.SetPremium ();});
	}
	public void CloseIAP()
	{
		IAPPanel.SetActive (false);
	}
}
