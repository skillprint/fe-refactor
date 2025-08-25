using UnityEngine;
using System.Collections;
using System.Collections.Generic;
[System.Serializable]
public class AdsAsset : ScriptableObject {
	#region GAMEID_ANDROID
	[SerializeField]
	public string gameIdAndroid;
	#endregion
	#region GAMEID_IOS
	[SerializeField]
	public string gameIdiOS;
	#endregion
	#region SHOW_ADS
	[SerializeField]
	public bool ShowAds;
	#endregion
	[SerializeField]
	public string bannerIdAndroid;
	[SerializeField]
	public string bannerIdiOS;
	[SerializeField]
	public string interstitialIdAndroid;
	[SerializeField]
	public string interstitialIdiOS;
}