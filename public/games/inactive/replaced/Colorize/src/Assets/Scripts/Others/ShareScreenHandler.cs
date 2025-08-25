using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using System.Collections.Generic;
public class ShareScreenHandler : MonoBehaviour {

	public List<GameObject> Footer;
	public GameObject Image;
	public Texture2D inComingImg;
	#if UNITY_ANDROID
	AndroidJavaObject androidClass;
	#endif
	// Use this for initialization
	void Start () {
		SetShareScreen ();
	}
	public void SetShareScreen()
	{
		Debug.Log (Image.GetComponent<Image> ().sprite.texture.width);
		inComingImg=new Texture2D(1,1,TextureFormat.PVRTC_RGBA4,false);
		inComingImg.LoadImage (DataManager.Instance.waterMarkedImage);
		inComingImg.Apply ();
		DataManager.Instance.waterMarkedImage = null;
		Debug.Log (inComingImg.width);
//		Resources.UnloadUnusedAssets ();
		Debug.Log(Image.GetComponent<Image> ().sprite.textureRect);
		Image.GetComponent<Image> ().sprite = Sprite.Create (inComingImg, new Rect (0, 0, (float)1200,(float)1200), new Vector2 (0.5f, 0.5f));
		List<string> ShareIcons = new List<string> (); 
		ShareIcons=ImagePathHolder.LoadSocialIcons ();
		foreach (GameObject g in Footer) 
		{
			Debug.Log(Footer.IndexOf(g));
			g.GetComponent<Image> ().sprite = Resources.Load<Sprite> (ShareIcons [Footer.IndexOf(g)]);
		}
			
	}
	public void OnFacebook()
	{

	}
	public void OnTwitter()
	{

	}
	public void ImagePosted()
	{
		Debug.Log("Instagram Callback");
	}
	public void OnInstagram()
	{
		#if UNITY_ANDROID
		AndroidJavaClass unityClass = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
		androidClass = new AndroidJavaObject("com.example.instagram.MainActivity");
		androidClass.Call("callbackToUnityMethod",inComingImg.EncodeToPNG(), transform.name, "ImagePosted",unityClass.GetStatic<AndroidJavaObject>("currentActivity"));
		#endif
		#if UNITY_IOS
		InstagramShare.PostToInstagram("#tinge", inComingImg.EncodeToPNG());
		#endif
	}
	public void OnEmail()
	{
		Debug.Log("In Email");
		System.IO.File.WriteAllBytes (Application.persistentDataPath+"/colorize.png",inComingImg.EncodeToPNG ());
		string uploadedImgPath = Application.persistentDataPath + "/colorize.png";
		#if UNITY_ANDROID
		ShareImage (uploadedImgPath, "Check This Out!", "Image From Colorize", "#colorize #adultcoloring #colorfy");
		#endif
		#if UNITY_IOS
		AllShare.MultiShare(DataManager.Instance.selectedFileName,inComingImg.EncodeToPNG());
		#endif
	}
	public  void ShareImage(string imageFileName, string subject, string title, string message)
	{
		#if UNITY_ANDROID
		
		AndroidJavaClass intentClass = new AndroidJavaClass("android.content.Intent");
		AndroidJavaObject intentObject = new AndroidJavaObject("android.content.Intent");
		
		intentObject.Call<AndroidJavaObject>("setAction", intentClass.GetStatic<string>("ACTION_SEND"));
		intentObject.Call<AndroidJavaObject>("setType", "image/*");
		intentObject.Call<AndroidJavaObject>("putExtra", intentClass.GetStatic<string>("EXTRA_SUBJECT"), subject);
		intentObject.Call<AndroidJavaObject>("putExtra", intentClass.GetStatic<string>("EXTRA_TITLE"), title);
		intentObject.Call<AndroidJavaObject>("putExtra", intentClass.GetStatic<string>("EXTRA_TEXT"), message);
		
		AndroidJavaClass uriClass = new AndroidJavaClass("android.net.Uri");
		AndroidJavaObject fileObject = new AndroidJavaObject("java.io.File", imageFileName);
		AndroidJavaObject uriObject = uriClass.CallStatic<AndroidJavaObject>("fromFile", fileObject);
		
		bool fileExist = fileObject.Call<bool>("exists");
		Debug.Log("File exist : " + fileExist);
		// Attach image to intent
		if (fileExist)
			intentObject.Call<AndroidJavaObject>("putExtra", intentClass.GetStatic<string>("EXTRA_STREAM"), uriObject);
		AndroidJavaClass unity = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
		AndroidJavaObject currentActivity = unity.GetStatic<AndroidJavaObject>("currentActivity");
		currentActivity.Call ("startActivity", intentObject);
		#endif
	}
	public void OnSaveToGallery()
	{
		Debug.Log (DataManager.Instance.selectedFileName);
//		DataManager.Instance.StoreWatermark (inComingImg.EncodeToPNG(), DataManager.Instance.selectedFileName);
		#if UNITY_IPHONE&&!UNITY_EDITOR
		SaveImage.SaveToGallery(DataManager.Instance.selectedFileName,inComingImg.EncodeToPNG());
		#endif
		#if UNITY_ANDROID
		AndroidJavaClass unityClass = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
		androidClass = new AndroidJavaObject("com.example.imagesave.SaveImageUnityBridge");
		androidClass.CallStatic("CallSaveImage",inComingImg.EncodeToPNG());
		#endif
	}
	public void OnBack()
	{
		DataManager.Instance.fromDrawings = true;
		Application.LoadLevel ("NewGamePlay");
	}
}
