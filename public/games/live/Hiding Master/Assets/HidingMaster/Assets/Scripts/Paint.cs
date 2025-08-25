using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Paint : MonoBehaviour
{
    public GameObject footPrint;
    public float duration = 5f;

    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player") || other.CompareTag("Hider"))
        {
            FootPrint tempFootPrint = other.gameObject.AddComponent<FootPrint>();
            tempFootPrint.footPrint = footPrint;
            tempFootPrint.duration = duration;

            if (other.CompareTag("Player"))
                AudioManager.Instance.PaintSound();
        }
    }
}
