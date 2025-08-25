using UnityEngine;
using System.Collections;

public class CircularLoader : MonoBehaviour {

	public float speed;
	public bool isLoading=false;
	// Use this for initialization
	public static CircularLoader myInstance;
	public static CircularLoader Instance
	{
		get{
			if(myInstance==null)
				myInstance=FindObjectOfType(typeof(CircularLoader)) as CircularLoader;
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
	public void Loader()
	{
		isLoading = true;
		transform.GetComponent<SpriteRenderer> ().enabled = true;

	}
	 void Update()
	{
		if (isLoading) {

			transform.Rotate (0, 0, speed * Time.deltaTime, Space.World);
		} else if(transform.GetComponent<SpriteRenderer> ().enabled)
			transform.GetComponent<SpriteRenderer> ().enabled = false;
	}
}
