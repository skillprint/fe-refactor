using UnityEngine;
using System.Collections;

public class UIAnchor : MonoBehaviour {
	public enum HorizontalAnchor{NONE,LEFT,CENTER,RIGHT}
	public enum VerticalAnchor{NONE,TOP,CENTER,BOTTOM}
	public HorizontalAnchor horizontalAnchor;
	public VerticalAnchor verticalAnchor;
	public Vector3 offset;
	void OnEnable(){
		Vector3 anchorPoint;
		switch(horizontalAnchor){
			case HorizontalAnchor.LEFT:
				anchorPoint=Camera.main.ScreenToWorldPoint (Vector3.zero);
				transform.position=new Vector3(anchorPoint.x,transform.position.y,transform.position.z);
			break;
			case HorizontalAnchor.CENTER:
				anchorPoint=Camera.main.ScreenToWorldPoint (new Vector3(Screen.width/2f,0,0));
				transform.position=new Vector3(anchorPoint.x,transform.position.y,transform.position.z);
			break;
			case HorizontalAnchor.RIGHT:
				anchorPoint=Camera.main.ScreenToWorldPoint (new Vector3(Screen.width,0,0));
				transform.position=new Vector3(anchorPoint.x,transform.position.y,transform.position.z);
			break;
		}
		switch(verticalAnchor){
			case VerticalAnchor.TOP:
				anchorPoint=Camera.main.ScreenToWorldPoint (Vector3.zero);
				transform.position=new Vector3(transform.position.x,anchorPoint.y,transform.position.z);
				break;
			case VerticalAnchor.CENTER:
				anchorPoint=Camera.main.ScreenToWorldPoint (new Vector3(0,Screen.height/2f,0));
				transform.position=new Vector3(transform.position.x,anchorPoint.y,transform.position.z);
				break;
			case VerticalAnchor.BOTTOM:
				anchorPoint=Camera.main.ScreenToWorldPoint (new Vector3(0,Screen.height,0));
				transform.position=new Vector3(transform.position.x,anchorPoint.y,transform.position.z);
				break;
		}
		transform.position += offset;
	}
}
