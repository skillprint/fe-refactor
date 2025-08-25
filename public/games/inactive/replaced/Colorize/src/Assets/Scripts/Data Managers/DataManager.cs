using UnityEngine;
using System.Collections;
using System.IO;
using System.Collections.Generic;
public class DataManager : MonoBehaviour {
	bool isObjectFound=false;
	public bool fromDrawings;
	public int watermarkStatus;
	public byte[] waterMarkedImage;
	public string selectedFileName,selectedThumb,selectedResourceName;
	public string[] storedWaterMarks;
	TextWriter tW;
	public static DataManager myInstance;
	public static DataManager Instance
	{
		get{
			if(myInstance==null)
				myInstance=FindObjectOfType(typeof(DataManager)) as DataManager;
			return myInstance;
		}
	}
	void Awake()
	{
		
		if (myInstance==null)
		{
			myInstance=this;
			DontDestroyOnLoad(this.gameObject);
			
		}
		
		else
		{
			DestroyImmediate(this.gameObject);
		}
	}
	void Start()
	{
	

		//Debug.Log (ImagePathHolder.LoadSubImageResourcePathFromAsset ().Count);
//		Debug.Log(PlayerPrefs.HasKey("SavedWaterMark"));
		if (PlayerPrefs.HasKey ("SavedWaterMark"))
			storedWaterMarks = PlayerPrefsX.GetStringArray ("WatermarkedImages");
		else
		{
			PlayerPrefs.SetInt("SavedWaterMark",1);
			string[] waterMarkArr = new string[ImagePathHolder.LoadSubImageResourcePathFromAsset ().Count];
			for(int i=0;i<waterMarkArr.Length;i++)
				waterMarkArr[i]="NULL";
			PlayerPrefsX.SetStringArray("WatermarkedImages",waterMarkArr);
			storedWaterMarks = PlayerPrefsX.GetStringArray ("WatermarkedImages");
		}
//		storedWaterMarks = PlayerPrefsX.GetStringArray ("WatermarkedImages", "NULL", ImagePathHolder.LoadSubImageResourcePathFromAsset().Count);
//		if (PlayerPrefs.HasKey ("SavedWaterMark"))
//			watermarkStatus = PlayerPrefs.GetInt ("SavedWaterMark");
//		else
//		{
//			PlayerPrefs.SetInt("SavedWaterMark",-1);
//			watermarkStatus = PlayerPrefs.GetInt ("SavedWaterMark");
//		}
	}
	void StoreSavedFile(string latestFile)
	{
		Debug.Log (GetIndexFromImagePath ());
		storedWaterMarks [GetIndexFromImagePath()] = latestFile;
		PlayerPrefsX.SetStringArray ("WatermarkedImages", storedWaterMarks);
	}
	int GetIndexFromImagePath()
	{
		List<ImagePath> allEditedImgPaths = new List<ImagePath> ();
		allEditedImgPaths = ImagePathHolder.LoadSubImagePathFromAsset ();
		foreach (ImagePath i in allEditedImgPaths)
			if (i.imagePath == DataManager.Instance.selectedFileName)
				return allEditedImgPaths.IndexOf (i);
		return 0;
	}
	public void StoreWatermark(byte[] fileData,string fileName)
	{
		fileName+="Watermark";
		string filePath;
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		FileStream fs;
		fs=File.Create(filePath);
		fs.Write (fileData, 0, fileData.Length);
		fs.Close ();
		StoreSavedFile (fileName);
	}
	public void FileCreatorBytes( byte[] fileData,string fileName)
	{
		//Create a file of specificed file-name and save byte array to it.
		string filePath;
		#if UNITY_ANDROID
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#elif UNITY_IPHONE&&!UNITY_EDITOR
		//		string fileNameBase = Application.dataPath.Substring(0, Application.dataPath.LastIndexOf('/'));
		//		filePath = fileNameBase.Substring(0, fileNameBase.LastIndexOf('/')) + "/Documents/" + fileName;
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#elif UNITY_EDITOR || UNITY_WEBGL
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
	public void FileCopier(string fileName,string copiedFileName)
	{
		string filePath,copiedFilePath;
		#if UNITY_ANDROID
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		copiedFilePath=Application.persistentDataPath + "/"+copiedFileName + ".txt";
		#elif UNITY_IPHONE&&!UNITY_EDITOR
		copiedFilePath=Application.persistentDataPath + "/"+copiedFileName + ".txt";
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#elif UNITY_EDITOR || UNITY_WEBGL
		copiedFilePath=Application.persistentDataPath + "/"+copiedFileName + ".txt";
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#endif
		System.IO.File.Copy (filePath, copiedFilePath, true);
	}
	public byte[] FileReaderBytes(string fileName)
	{
		//read byte array of colors from specified file-path and return.
		byte[] imageColors=null;
		string filePath;
		#if UNITY_ANDROID
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		
		#elif UNITY_IPHONE&&!UNITY_EDITOR
		//	string fileNameBase = Application.dataPath.Substring(0, Application.dataPath.LastIndexOf('/'));
		//		filePath = fileNameBase.Substring(0, fileNameBase.LastIndexOf('/')) + "/Documents/" + fileName;
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#elif UNITY_EDITOR || UNITY_WEBGL
		filePath=Application.persistentDataPath + "/"+fileName + ".txt";
		#endif
		if(System.IO.File.Exists(filePath))
			imageColors = System.IO.File.ReadAllBytes (filePath);
		return imageColors;
		
	}
	public void LoadScene(string level)
	{

		
		//	 AutoFade.LoadLevel (level,1f,1f, Color.white);
		
		CameraFade.StartAlphaFade (Color.white, false, 0.5f,0f,()=>{Application.LoadLevel(level);});
	}
	public void LoadScene(string level,float duration)
	{
		
		CameraFade.StartAlphaFade (Color.white, false, duration,duration,()=>{Application.LoadLevel(level);});
		//	 AutoFade.LoadLevel (level,duration,duration, Color.white);
	}
	
}
