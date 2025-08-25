using UnityEngine;
using System.Collections;
using UnityEngine.UI;
public class ColoringTester : MonoBehaviour {

	public Image image;
	Texture2D testImg;
	// Use this for initialization
	void Start () {
		testImg = image.sprite.texture;
	}
	
	// Update is called once per frame
	public void OnColor()
	{
		Debug.Log("Coloring");
		Rect r = new Rect ();
		r = new Rect (0, 100, 900, 900);
		Debug.Log (r.ToString ());
		FloodFiller.RevisedQueueFloodFill (testImg,Mathf.CeilToInt ((Input.mousePosition.x)), Mathf.CeilToInt ( (Input.mousePosition.y ) ), Color.red,false);
		testImg.Apply ();
		Debug.Log (testImg.width.ToString ());
		image.sprite = Sprite.Create (testImg, new Rect(0,0,1024,1024), new Vector2 (0.5f, 0.5f));
//		image.transform.position = Input.mousePosition;

	}
}
