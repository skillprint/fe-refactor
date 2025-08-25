using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

public class CustomCollider : MonoBehaviour
{
    [SerializeField]
    private float radius = 1f;

    [SerializeField]
    private Vector3 center = Vector3.zero;

    [SerializeField]
    private Color color = Color.white;

    private void OnDrawGizmosSelected()
    {
        Gizmos.color = color;
        Gizmos.DrawWireSphere(transform.position + center, radius);
    }

    public Vector3 GetPosition() { return transform.position + center; }
    public float GetRadius() { return radius; }

    private List<GameObject> values = new List<GameObject>();
    private Collider[] colliders = new Collider[10];
    public List<GameObject> GetAllColliders(string tag)
    {
        values.Clear();
        
        colliders = Physics.OverlapSphere(GetPosition(), GetRadius());

        for (int i = 0; i < colliders.Length; i++)
            if (colliders[i].gameObject.CompareTag(tag))
                values.Add(colliders[i].gameObject);

        return values;
    }
}
