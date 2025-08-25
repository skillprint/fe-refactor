using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
public class MyDrawingController : MonoBehaviour {

	public GameObject waterMarkPrefab,Header,WaterMarkPanel;
	public List<GameObject> ButtText,Buttons;
	// Use this for initialization
	void Start () {
		SetMyDrawingsScreen ();

	}
	void SetMyDrawingsScreen()
	{
		List<string> HomeButtNames = new List<string> ();
		List<string> HomeButtImages = new List<string> ();
		List<string> HomeButtColors = new List<string> ();
		HomeButtImages = ImagePathHolder.LoadHomeButtImages ();
		HomeButtNames = ImagePathHolder.LoadHomeButtNames ();
		HomeButtColors = ImagePathHolder.LoadHomeButtColors ();
		Header.GetComponent<Text> ().text = HomeButtNames [2];
		foreach (GameObject g in ButtText)
			g.GetComponent<Text> ().text = HomeButtNames [ButtText.IndexOf (g)];
		foreach (GameObject g in Buttons)
			g.GetComponent<Image> ().sprite = Resources.Load<Sprite> (HomeButtImages [Buttons.IndexOf (g)]);
		GenerateWaterMarks ();
	}
	void GenerateWaterMarks()
	{
		string[] watermarkedImages = PlayerPrefsX.GetStringArray ("WatermarkedImages");
		List<ImagePath> editedsubImages = new List<ImagePath> ();
		editedsubImages = ImagePathHolder.LoadSubImagePathFromAsset ();
		
		for (int i=0; i<watermarkedImages.Length; i++) 
		{
			
			if(!watermarkedImages[i].Contains("NULL"))
			{
				GameObject g=Instantiate(waterMarkPrefab) as GameObject;
				g.SetActive(true);
				g.transform.SetAsFirstSibling();
				g.transform.SetParent(WaterMarkPanel.transform);

				g.GetComponent<DataHolder>().fileName=editedsubImages[i].imagePath;

				g.GetComponent<UnityEngine.UI.Button>().onClick.AddListener(()=>OnSubCategory(g));
				g.GetComponent<SetWaterMark>().SetWater(watermarkedImages[i]);
				g.GetComponent<RectTransform>().localScale=new Vector3(1f,1f,1f);
			}
		}
		if (WaterMarkPanel.transform.childCount <= 2) 
		{
			for(int i=0;i<2;i++)
			{
				GameObject g=Instantiate(waterMarkPrefab) as GameObject;
				g.SetActive(true);
				g.transform.SetParent(WaterMarkPanel.transform);
				g.GetComponent<RectTransform>().localScale=new Vector3(1f,1f,1f);
				g.GetComponent<UnityEngine.UI.Image>().enabled=false;
			}
		}
	}
	public void OnGalleryHit()
	{
		DataManager.Instance.LoadScene ("Gallery", 0.25f);
//		AutoFade.LoadLevel ("Gallery", 0.5f, 0.5f, Color.white);
	} 
	public void OnSubCategory(GameObject g)
	{
		Debug.Log (g.name);
		DataManager.Instance.fromDrawings = true;
		Debug.Log("In MyDrawings");

		DataManager.Instance.selectedFileName = g.GetComponent<DataHolder> ().fileName;
//		Application.LoadLevel("NewGamePlay");
//		AutoFade.LoadLevel ("NewGamePlay", 0.5f, 0.5f, Color.white);
		DataManager.Instance.LoadScene ("NewGamePlay", 0.25f);
	}
	public void OnInspirationHit()
	{
//		Application.LoadLevel("Inspiration");
//		AutoFade.LoadLevel ("Inspiration", 0.5f, 0.5f, Color.white);
		DataManager.Instance.LoadScene ("Inspiration", 0.25f);
	}
}
