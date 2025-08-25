using UnityEngine;
using System.Collections;

public class SetWaterMark : MonoBehaviour {
	int texWidth,texHeight;
	Texture2D image;
	public static SetWaterMark myInstance;
	// Use this for initialization
	void Start () {
	
	}
	public static SetWaterMark Instance
	{
		get{
			if(myInstance==null)
				myInstance=FindObjectOfType(typeof(SetWaterMark)) as SetWaterMark;
			return myInstance;
		}
	}
    public  void SetWater(string fileName)
	{
		texWidth = texHeight = 512;
		image=new Texture2D(texWidth,texHeight,TextureFormat.PVRTC_RGBA4,false);
		Debug.Log (fileName);
		image.LoadImage(DataManager.Instance.FileReaderBytes(fileName));
		image.Apply();
//		TextureScale.Bilinear(image,texWidth,texHeight);
		gameObject.GetComponent<UnityEngine.UI.Image> ().sprite=Sprite.Create(image,new Rect(0f,0f,(float)texWidth,(float)texHeight),new Vector2(0.5f,0.5f));
	}
}
