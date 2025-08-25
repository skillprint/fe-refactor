using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Invisible : MonoBehaviour
{
    public Material invisibleMaterial, defaultMaterial;

    private Animation anim;
    private SkinnedMeshRenderer rend;

    void Start()
    {
        rend = GetComponent<SkinnedMeshRenderer>();
        anim = GetComponent<Animation>();
    }

    public void SetInvisible()
    {
        if (!anim.isPlaying)
        {
            PlayerController.Instance.isInvisible = true;
            rend.material = invisibleMaterial;
            anim.Play();
        }
    }

    public void SetVisible()
    {
        rend.material = defaultMaterial;
        PlayerController.Instance.isInvisible = false;
    }
}
