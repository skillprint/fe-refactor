using UnityEngine;
using System.Collections;

public class DeactivateAfterDelay : MonoBehaviour {

	// Use this for initialization
	void Start () {
		Invoke ("Deactivate",1.0f);
	}
	void Deactivate(){
		Application.LoadLevel ("Gallery");
	}
}
