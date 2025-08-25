using UnityEngine;
using System.Collections;

public class SpriteSetter : MonoBehaviour {
	int texWidth,texHeight;
	Texture2D image;
	// Use this for initialization
	void OnEnable () {
		SetSprite ();
	}
	public void SetSprite()
	{
		texWidth = texHeight = 256;
		if (PlayerPrefs.HasKey (gameObject.GetComponent<DataHolder> ().thumbName)&&DataManager.Instance!=null) {
			image=new Texture2D(texWidth,texHeight,TextureFormat.PVRTC_RGBA4,false);
			//load thumb image for selected category images
			if(DataManager.Instance.FileReaderBytes(PlayerPrefs.GetString(gameObject.GetComponent<DataHolder>().fileName))!=null)
			{
				image.LoadImage(DataManager.Instance.FileReaderBytes(PlayerPrefs.GetString(gameObject.GetComponent<DataHolder>().thumbName)));
				image.Apply();
//				gameObject.GetComponent<SpriteRenderer> ().sprite=Sprite.Create(image,new Rect(0f,0f,(float)texWidth,(float)texHeight),new Vector2(0.5f,0.5f));
				gameObject.GetComponent<UnityEngine.UI.Image> ().sprite=Sprite.Create(image,new Rect(0f,0f,(float)texWidth,(float)texHeight),new Vector2(0.5f,0.5f));
			}
			
			//			DestroyImmediate(image);
		}
	}

}
