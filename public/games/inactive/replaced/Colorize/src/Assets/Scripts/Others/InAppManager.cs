using UnityEngine;
using System.Collections;
using System.Collections.Generic;
public class InAppManager : MonoBehaviour {
	public static InAppManager myInstance;
	bool IAPTestMode,isObjectFound=false;
	List<string> SKUs,Pricing;
	public static InAppManager Instance
	{
		get{
			if(myInstance==null)
				myInstance=FindObjectOfType(typeof(InAppManager)) as InAppManager;
			return myInstance;
		}
	}
	void Awake()
	{
		
		if (isObjectFound)
		{
			Destroy(gameObject);
			return;
		}
		
		isObjectFound = true;
		myInstance = this;
		DontDestroyOnLoad(gameObject);
	}
	// Use this for initialization
	void Start () {

		SKUs = new List<string> ();
		SKUs = ImagePathHolder.GetSKUs ();
		Pricing = new List<string> ();
		Pricing = ImagePathHolder.GetPricing ();
		IAPTestMode = ImagePathHolder.GetTestMode ();
	}
	public void SetUnlockedCategory()
	{
		IAPTestMode = ImagePathHolder.GetTestMode ();
		if(IAPTestMode)
		ImagePathHolder.UnlockCategories();
		else
		SmartIAP.Instance ().Purchase (SKUs[0]);
	}
	public void SetUnlockedColors()
	{
		IAPTestMode = ImagePathHolder.GetTestMode ();
		if (IAPTestMode) 
		{
//			if(!ImagePathHolder.GetLockedColors())
				ImagePathHolder.SetLockedColors ();
		}
		else
			SmartIAP.Instance ().Purchase (SKUs[1]);
//			SmartIAP.Instance().Purchase("com.colorize.allcolors");
		//		ImagePathHolder.SetLockedColors ();
	}
	public void SetPremium()
	{
		IAPTestMode = ImagePathHolder.GetTestMode ();
		if (IAPTestMode) 
		{
			ImagePathHolder.UnlockCategories();
			ImagePathHolder.SetLockedColors ();
		}
		else
			SmartIAP.Instance ().Purchase (SKUs[2]);
	}
}
