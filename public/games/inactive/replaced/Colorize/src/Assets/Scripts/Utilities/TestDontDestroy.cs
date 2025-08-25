using UnityEngine;
using System.Collections;

public class TestDontDestroy : MonoBehaviour {

	private static TestDontDestroy instanceRef;
	// Use this for initialization
	void Start () {

	}
	
	void Awake()
	{

			 if (instanceRef==null)
		{
			instanceRef=this;
			DontDestroyOnLoad(this.gameObject);

		}
		
		else
		{
			DestroyImmediate(this.gameObject);
		}
	}
	void Update()
	{
		if(Input.GetKey(KeyCode.A))
		   {
			Debug.Log(Application.loadedLevelName);
			if(Application.loadedLevel>0)
				Application.LoadLevel("Test1");
			else
				Application.LoadLevel("Test2");
		}
		  
	}
}
