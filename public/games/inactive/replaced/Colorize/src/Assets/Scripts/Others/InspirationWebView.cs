/*
 * Copyright (C) 2012 GREE, Inc.
 * 
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * 
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 
 * 1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 *    misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

using System.Collections;
using UnityEngine;
using System.Collections.Generic;
using UnityEngine.UI;
public class InspirationWebView : MonoBehaviour
{
	public string Url;
	WebViewObject webViewObject;
	public GameObject Header;
	public List<GameObject> Footer,FooterText;
	void Start()
	{
		SetInspirationScreen();

	}
	void SetInspirationScreen()
	{
		List<string> HomeButtNames = new List<string> ();
		List<string> HomeButtImages = new List<string> ();
		List<string> HomeButtColors = new List<string> ();
		HomeButtImages = ImagePathHolder.LoadHomeButtImages ();
		HomeButtNames = ImagePathHolder.LoadHomeButtNames ();
		HomeButtColors = ImagePathHolder.LoadHomeButtColors ();
		Header.GetComponent<Text> ().text = HomeButtNames [1];
		foreach (GameObject g in FooterText)
			g.GetComponent<Text> ().text = HomeButtNames [FooterText.IndexOf (g)];
		foreach (GameObject g in Footer)
			g.GetComponent<Image> ().sprite = Resources.Load<Sprite> (HomeButtImages [Footer.IndexOf (g)]);
//		foreach (GameObject g in Footer) 
//		{
//			g.GetComponent<UnityEngine.UI.Button>().transition=UnityEngine.UI.Selectable.Transition.ColorTint;
//			ColorBlock c=g.GetComponent<UnityEngine.UI.Button>().colors;
//			c.normalColor=Color.white;
//			c.disabledColor=Color.white;
//			c.pressedColor= GetColorFromString(HomeButtColors [Footer.IndexOf (g)]);
//			c.highlightedColor=Color.white;
//			g.GetComponent<UnityEngine.UI.Button>().colors=c;
//		}
		Url = ImagePathHolder.LoadInspirationWebLink ();
		#if !UNITY_WEBPLAYER
		StartCoroutine( SetWebViewSettings());
			#else
			SetWebViewSettings();
				#endif
	}
	Color GetColorFromString(string color)
	{
		Debug.Log (color);
		string[] strings = color.Substring(1,color.Length-2).Split(","[0] );
		Debug.Log (strings.Length);
		Color output=Color.blue;
		for (int i = 0; i < 4; i++) {
			output[i] = System.Single.Parse(strings[i]);
		}
		return output;
	}
    #if !UNITY_WEBPLAYER
	IEnumerator SetWebViewSettings()
#else
		void SetWebViewSettings()
#endif
	{
		webViewObject = (new GameObject("WebViewObject")).AddComponent<WebViewObject>();
		webViewObject.Init(
			cb: (msg) =>
			{
			Debug.Log(string.Format("CallFromJS[{0}]", msg));
			
		},
		err: (msg) =>
		{
			Debug.Log(string.Format("CallOnError[{0}]", msg));
			
		});
		
		webViewObject.SetMargins(0, Screen.height / 8,0, Screen.height / 8);
		webViewObject.SetVisibility(true);
		
		switch (Application.platform) {
			#if !UNITY_WEBPLAYER
		case RuntimePlatform.OSXEditor:
		case RuntimePlatform.OSXPlayer:
		case RuntimePlatform.IPhonePlayer:
		case RuntimePlatform.Android:
			if (Url.StartsWith("http")) {
				webViewObject.LoadURL(Url.Replace(" ", "%20"));
			} else {
				var src = System.IO.Path.Combine(Application.streamingAssetsPath, Url);
				var dst = System.IO.Path.Combine(Application.persistentDataPath, Url);
				var result = "";
				if (src.Contains("://")) {
					var www = new WWW(src);
					yield return www;
					result = www.text;
				} else {
					result = System.IO.File.ReadAllText(src);
				}
				System.IO.File.WriteAllText(dst, result);
				webViewObject.LoadURL("file://" + dst.Replace(" ", "%20"));
			}
			if (Application.platform != RuntimePlatform.Android) {
				webViewObject.EvaluateJS(
					"window.addEventListener('load', function() {" +
					"	window.Unity = {" +
					"		call:function(msg) {" +
					"			var iframe = document.createElement('IFRAME');" +
					"			iframe.setAttribute('src', 'unity:' + msg);" + 
					"			document.documentElement.appendChild(iframe);" +
					"			iframe.parentNode.removeChild(iframe);" +
					"			iframe = null;" +
					"		}" +
					"	}" +
					"}, false);");
			}
			break;
			#else
		case RuntimePlatform.OSXWebPlayer:
		case RuntimePlatform.WindowsWebPlayer:
			webViewObject.LoadURL(Url.Replace(" ", "%20"));
			webViewObject.EvaluateJS(
				"parent.$(function() {" +
				"	window.Unity = {" +
				"		call:function(msg) {" +
				"			parent.unityWebView.sendMessage('WebViewObject', msg)" +
				"		}" +
				"	};" +
				"});");
			break;
			#endif
		}
	}
	public void OnMyDrawings()
	{
		DataManager.Instance.LoadScene ("MyDrawings", 0.25f);
//		AutoFade.LoadLevel ("MyDrawings", 0.5f, 0.5f, Color.white);
	}
	public void OnGalleryHit()
	{
//		Application.LoadLevel("Gallery");
//		AutoFade.LoadLevel ("Gallery", 0.5f, 0.5f, Color.white);
		DataManager.Instance.LoadScene ("Gallery", 0.25f);
	}
}
