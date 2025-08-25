using UnityEngine;
using System.Collections;
using System.Collections.Generic;
[System.Serializable]
public class SettingAssets : ScriptableObject {
	#region HOME_FOOTERS
	[SerializeField]
	public string[] HomeButtNames;
	[SerializeField]
	public Color[] HomeButtonTransitionColors;
	[SerializeField]
	public Texture2D[] HomeButtonImages;
	#endregion
	#region INSPIRATION_WINDOW
	[SerializeField]
	public string InspirationWebLink;
	#endregion
	#region POP_UP
	[SerializeField]
	public string[] PopUpButtNames;
	[SerializeField]
	public Color[] PopUpButtonTextColors;
	#endregion
	#region UI_ICONS
	[SerializeField]
	public Texture2D[] UIIconImages;
	#endregion
	#region SOCIAL_ICONS
	[SerializeField]
	public Texture2D[] SocialIconImages;
	#endregion
	#region WATERMARK
	[SerializeField]
	public Texture2D Watermark;
	#endregion
}
