using System.Collections;
using System.Collections.Generic;
using System;
using UnityEngine;

public class WolfSelector : MonoBehaviour
{
    public bool isSelected = false;

    public Action<WolfSelector> OnSelection;
    public Action<WolfSelector> OnDeselection;

    public Action<Vector3> OnMoveOrder;
    public SpriteRenderer highlight;

    [SerializeField]
    private WolfController _controller = null;
    private Skillprint.telemetry t = new Skillprint.telemetry();
    public void Select()
    {
        //Debug.Log("SELECTED");
        isSelected = true;
        highlight.enabled = isSelected;
        OnSelection?.Invoke(this);
    }

    public void Deselect()
    {
        //Debug.Log("DESELECTED");
        isSelected = false;
        highlight.enabled = isSelected;
        OnDeselection?.Invoke(this);
        t.@event = "SWITCH";
        Skillprint.sendTelemetry(t);
    }

    public void Move(Vector3 pos)
    {
        //Debug.Log("MOVE:" + pos);
        OnMoveOrder?.Invoke(pos);
    }

    public WolfController GetController() { return _controller; }
}
