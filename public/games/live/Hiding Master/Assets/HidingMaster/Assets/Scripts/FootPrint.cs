using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FootPrint : MonoBehaviour
{
    [HideInInspector]
    public GameObject footPrint;
    [HideInInspector]
    public float duration;

    void Start()
    {
        StartCoroutine(SpawnFootPrint());
    }

    IEnumerator SpawnFootPrint()
    {
        yield return new WaitForSeconds(0.2f);
        Invoke("DestroyFootPrint", duration);

        bool left = true;

        while (true)
        {
            GameObject tempFootPrint = Instantiate(footPrint, transform.position, transform.rotation);
            if (left)
                tempFootPrint.transform.GetChild(1).gameObject.SetActive(false);
            else
                tempFootPrint.transform.GetChild(0).gameObject.SetActive(false);

            left = !left;

            if (EnemySeeker.Instance != null)
                EnemySeeker.Instance.MoveToDestination(tempFootPrint.transform.position);

            Destroy(tempFootPrint, duration);
            yield return new WaitForSeconds(0.5f);
        }
    }

    private void DestroyFootPrint()
    {
        StopAllCoroutines();
        this.enabled = false;
    }
}
