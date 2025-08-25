using UnityEngine;
using System.Collections;

public class Button : MonoBehaviour {
	//Defining basic button properties
//	TextMesh text;
	SpriteRenderer background;
	public SpriteRenderer Background{get{return background;}set{background=value;}}
	public Sprite normalBackground,activeBackground,inactiveBackground;
	bool isActive=true;

	public enum ButtonAnimationType{NONE,BACKGROUNDCHANGE,PIMPOM}
	public ButtonAnimationType animationType;

	public string normalBGPath,activeBGPath;

	Vector3 originalScale,originalPosition,originalColliderExtents;
	Quaternion originalRotation;

	BoxCollider boxCollider;
	//Defining event delegates on this button
	public delegate void OnTouchDownInsideDelegate();
	public delegate void OnTouchUpInsideDelegate();
	public delegate void OnTouchUpOutsideDelegate();

	public OnTouchDownInsideDelegate OnTouchDownInside;
	public OnTouchUpInsideDelegate OnTouchUpInside;
	public OnTouchUpOutsideDelegate OnTouchUpOutside;

	/// <summary>
	/// Add listener for OnTouchDownInside event on this button.
	/// </summary>
	/// <param name="callback">Function that will be called when OnTouchDownInside event occurs on the button.</param>
	public void CallOnTouchDownInside(OnTouchDownInsideDelegate callback){
		OnTouchDownInside -= callback;
		OnTouchDownInside += callback;
	}
	/// <summary>
	/// Add listener for OnTouchUpInside event on this button.
	/// </summary>
	/// <param name="callback">Function that will be called when OnTouchUpInside event occurs on the button.</param>
	public void CallOnTouchUpInside(OnTouchUpInsideDelegate callback){

		OnTouchUpInside -= callback;
		OnTouchUpInside += callback;
	}
	/// <summary>
	/// Add listener for OnTouchUpOutside event on this button.
	/// </summary>
	/// <param name="callback">Function that will be called when OnTouchUpOutside event occurs on the button.</param>
	public void CallOnTouchUpOutside(OnTouchUpOutsideDelegate callback){
		OnTouchUpOutside -= callback;
		OnTouchUpOutside += callback;
	}

	/// <summary>
	/// Add listener for OnTouchDownInside event on this button.
	/// </summary>
	/// <param name="callback">Function that will be called when OnTouchDownInside event occurs on the button.</param>
	public void RemoveFromOnTouchDownInside(OnTouchDownInsideDelegate callback){
		OnTouchDownInside -= callback;
	}
	/// <summary>
	/// Add listener for OnTouchUpInside event on this button.
	/// </summary>
	/// <param name="callback">Function that will be called when OnTouchUpInside event occurs on the button.</param>
	public void RemoveFromOnTouchUpInside(OnTouchUpInsideDelegate callback){
		OnTouchUpInside -= callback;
	}
	/// <summary>
	/// Add listener for OnTouchUpOutside event on this button.
	/// </summary>
	/// <param name="callback">Function that will be called when OnTouchUpOutside event occurs on the button.</param>
	public void RemoveFromOnTouchUpOutside(OnTouchUpOutsideDelegate callback){
		OnTouchUpOutside -= callback;
	}

	//Default operations performed when this button is clicked like Button animations and so on
	void SetOnTouchDownInside(){
		if(animationType==ButtonAnimationType.BACKGROUNDCHANGE)
			background.sprite = activeBackground;
		else if(animationType==ButtonAnimationType.PIMPOM){
			transform.localScale=originalScale/1.2f;
			if(boxCollider!=null)boxCollider.extents=originalColliderExtents*1.2f;
		}
	}
	void SetOnTouchUpInside(){
		if(animationType==ButtonAnimationType.BACKGROUNDCHANGE)
			background.sprite = normalBackground;
		else if(animationType==ButtonAnimationType.PIMPOM){
			transform.localScale=originalScale;
			if(boxCollider!=null)boxCollider.extents=originalColliderExtents;

		}
	}
	void SetOnTouchUpOutside(){
		if(animationType==ButtonAnimationType.BACKGROUNDCHANGE)
			background.sprite = normalBackground;
		else if(animationType==ButtonAnimationType.PIMPOM){
			transform.localScale=originalScale;
			if(boxCollider!=null)boxCollider.extents=originalColliderExtents;
		}
	}

	//Initialize button effects and set easy references to properties
	void Awake(){
//		text = transform.GetComponentInChildren<TextMesh> ();
		Init ();
	}
	void Init(){
		originalScale=transform.localScale;
		boxCollider = GetComponent<BoxCollider> () as BoxCollider;
		originalColliderExtents = boxCollider.extents;
		originalRotation = transform.rotation;
		originalPosition = transform.position;
		background = transform.GetComponentInChildren<SpriteRenderer> ();
		if(background!=null){
			if (background.sprite != null && normalBackground==null)
				normalBackground = background.sprite;
			else if(background.sprite==null && normalBackground!=null)
				background.sprite = normalBackground;
		}
		CallOnTouchDownInside (SetOnTouchDownInside);
		CallOnTouchUpInside (SetOnTouchUpInside);
		CallOnTouchUpOutside (SetOnTouchUpOutside);
//		isActive = true;
	}
	public void SetEnabled(bool flag){
		if (background == null)Init ();
		isActive = flag;
		if(background==null)return;
		if(!isActive && background.sprite!=null && inactiveBackground!=null)background.sprite = inactiveBackground;
		else background.sprite=normalBackground;
	}
	public void FireOnTouchUpInside(){

		if (!isActive || OnTouchUpInside==null)return;
		OnTouchUpInside ();
	}
	public void FireOnTouchDownInside(){
		if (!isActive || OnTouchDownInside==null)return;
		OnTouchDownInside ();
	}
	public void FireOnTouchUpOutside(){
		if (!isActive || OnTouchUpOutside==null)return;
		OnTouchUpOutside ();
	}
}