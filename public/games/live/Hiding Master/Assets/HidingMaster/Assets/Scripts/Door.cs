using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Door : MonoBehaviour
{
    public bool isLeft;

    private Animation[] anims = new Animation[2];

    void Start()
    {
        anims = GetComponentsInChildren<Animation>();
    }

    private void OnTriggerEnter(Collider other)
    {
        //If door collides with player or seeker or hider, then the animation will be played
        if ((other.CompareTag("Player") || other.CompareTag("Seeker") || other.CompareTag("Hider")) && !anims[0].isPlaying)
        {
            if (isLeft)
            {
                anims[0].Play("DoorAnim1");
                anims[1].Play("DoorAnim2");
            }
            else
            {
                anims[0].Play("DoorAnim2");
                anims[1].Play("DoorAnim1");
            }

            if (other.CompareTag("Player"))
                AudioManager.Instance.DoorSound();
        }
    }
}
