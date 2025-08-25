using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Sight : MonoBehaviour
{
    public LayerMask mask;
    public float viewDistance, angle;
    public int countOfRays;

    void Start()
    {
        StartCoroutine(CheckSight());
        viewDistance = GetComponent<Light>().range;

        for (int i = -countOfRays + 1; i < countOfRays; i++)
            Instantiate(new GameObject(), transform).transform.Rotate(Vector3.up, angle / countOfRays * i);
    }

    IEnumerator CheckSight()
    {
        while (true)
        {
            foreach (Transform child in transform)
            {
                Ray ray = new Ray(transform.position, child.forward * viewDistance);

                RaycastHit hitInfo;

                if (Physics.Raycast(ray, out hitInfo, viewDistance, mask))
                {
                    Debug.DrawLine(ray.origin, hitInfo.point, Color.black);
                    GameObject hitObject = hitInfo.collider.gameObject;

                    if (hitObject.CompareTag("Hider"))
                        hitObject.GetComponent<EnemyHider>().Caught();
                    else if (hitObject.CompareTag("Player"))
                        PlayerController.Instance.Caught();
                }
                else
                    Debug.DrawLine(ray.origin, ray.origin + ray.direction * viewDistance, Color.green);
            }

            yield return new WaitForSeconds(0.05f);
        }
    }
}
