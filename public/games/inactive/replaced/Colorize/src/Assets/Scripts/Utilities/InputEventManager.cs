using UnityEngine;
using System.Collections;

public class InputEventManager : MonoBehaviour {

	GameObject lastTouchedObject,currentTouchedObject;
	LayerMask layerMask;
	Camera UICam;
	public bool inputEnabled;
	// Use this for initialization
	void Start () {
		UICam = Camera.main;
		inputEnabled = true;
	}
	
	// Update is called once per frame
	void Update () {
		if (!inputEnabled)
			return;
		GetInput ();
	}
	public Ray GetRayFromMouse(){
		return UICam.ScreenPointToRay (Input.mousePosition);
	}

	bool dragging=false;
	Vector3 initialTouchPos,lastTouchPos,currentTouchPos,deltaTouch;
	public delegate void OnTap(Vector3 tapPosition);
	public delegate void OnDrag(Vector3 delTouch);
	public delegate void OnSwipe (Vector3 direction);

	public event OnTap OnTapEvent;
	public event OnDrag OnDragEvent;
	public event OnSwipe OnSwipeEvent;

	public void AddOnTapListener(OnTap onTapListener){
		OnTapEvent -= onTapListener;
		OnTapEvent += onTapListener;
	}
	public void AddOnDragListener(OnDrag onDragListener){
		OnDragEvent -= onDragListener;
		OnDragEvent += onDragListener;
	}
	public void AddSwipeEventListener(OnSwipe onSwipeEventListener){
		OnSwipeEvent -= onSwipeEventListener;
		OnSwipeEvent += onSwipeEventListener;
	}
	public void RemoveOnDragListener(OnDrag onDragListener){
		OnDragEvent -= onDragListener;
	}
	public void RemoveOnTapListener(OnTap onTapListener){
		OnTapEvent -= onTapListener;
	}
	void FireTapEvent(Vector3 eventArgs){
		if(OnTapEvent!=null)OnTapEvent(eventArgs);
	}
	void FireDragEvent(Vector3 eventArgs){
		if(OnDragEvent!=null)OnDragEvent(eventArgs);
	}

	void GetInput () {
		if (Input.GetMouseButtonDown (0)) {
			OnTouchBegan();
		}
		else if(Input.GetMouseButton (0)){
			OnTouchMoving();
		}
		else if(Input.GetMouseButtonUp (0)){
			OnTouchEnded();
		}
	}
	
	void OnTouchBegan(){
		CheckButtonInput ();
		InitTouches ();
	}
	void OnTouchMoving(){
		CheckForDrag ();
	}
	void OnTouchEnded(){
		if (!dragging){
			FireTapEvent (Input.mousePosition);
		}
		FireButtonOnClicks ();
		EndDrag ();
	}

	void InitTouches(){
		dragging = false;
		initialTouchPos=lastTouchPos=currentTouchPos = Input.mousePosition;
		deltaTouch = Vector3.zero;
	}

	void CheckForDrag(){
		currentTouchPos = Input.mousePosition;
		deltaTouch = currentTouchPos - lastTouchPos;
		if (Mathf.Abs (Vector3.Distance (currentTouchPos,initialTouchPos)) > 20f) {
			dragging=true;
		}
		if (dragging) {
			FireDragEvent(deltaTouch);
		}
		lastTouchPos = currentTouchPos;
	}

	void EndDrag(){
		dragging = false;
	}

	void CheckButtonInput(){
		RaycastHit hit;
		if(Physics.Raycast(GetRayFromMouse (),out hit)){
			currentTouchedObject=hit.transform.gameObject;
			Button button=currentTouchedObject.GetComponent <Button>();
			if(button!=null)
				button.FireOnTouchDownInside();
			//				currentTouchedObject.SendMessage ("OnTouchDownInside");
			lastTouchedObject=currentTouchedObject;
		}
	}
	void FireButtonOnClicks(){
		RaycastHit hit;
		if(Physics.Raycast(GetRayFromMouse (),out hit) && lastTouchedObject!=null){
			currentTouchedObject=hit.transform.gameObject;
			if(!dragging && currentTouchedObject.GetInstanceID ()==lastTouchedObject.GetInstanceID()){
				//					currentTouchedObject.SendMessage ("OnTouchUpInside",SendMessageOptions.DontRequireReceiver);
				Button button=currentTouchedObject.GetComponent <Button>();

				if(button!=null&&Input.GetMouseButtonUp(0))
				{

					button.FireOnTouchUpInside();
				}	
			}
			else{
				//					lastTouchedObject.SendMessage ("OnTouchUpOutside",SendMessageOptions.DontRequireReceiver);
				Button button=lastTouchedObject.GetComponent <Button>();
				if(button!=null)
					button.FireOnTouchUpOutside();
			}
			lastTouchedObject=null;
		}
		else if(lastTouchedObject!=null){
			Button button=lastTouchedObject.GetComponent <Button>();
			if(button!=null)
				button.FireOnTouchUpOutside();
		}
	}
}
