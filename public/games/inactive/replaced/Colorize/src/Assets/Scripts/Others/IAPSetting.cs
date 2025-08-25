using UnityEngine;
using System.Collections;
using System.Collections.Generic;
[System.Serializable]
public class IAPSetting : ScriptableObject {
	#region SKUS
	[SerializeField]
	public string[] SKUs;
	#endregion
	#region PRICING
	[SerializeField]
	public string[] Pricing;
	#endregion
	#region TESTING_MODE
	[SerializeField]
	public bool TestMode;
	#endregion
}
