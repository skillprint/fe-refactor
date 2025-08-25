using UnityEngine;
using System.Collections;

public class DataHolder : MonoBehaviour {
	public string fileName, thumbName,resourceName;
	public int Index;

	void Start()
	{


	}
	public void GetFileName()
	{

		gameObject.GetComponent<SpriteRenderer> ().sprite = null;
		Resources.UnloadUnusedAssets ();
		gameObject.GetComponent<SpriteSetter> ().SetSprite ();
	}
	public void loadGamePlay()
	{
//		SceneManager.Instance.CheckAndCreate ();
		DataManager.Instance.selectedFileName = fileName;
		DataManager.Instance.selectedThumb = thumbName;

	}
//	// Use this for initialization
//	void Start () {
//	
//	}
//	
//	// Update is called once per frame
//	void Update () {
//	
//	}
}
