using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Token : MonoBehaviour
{
    public GameObject tokenParticle;

    private void Update()
    {
        transform.Rotate(Vector3.up, 80f * Time.deltaTime);
    }

    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            ScoreManager.Instance.IncrementToken();
            GetComponent<BoxCollider>().enabled = GetComponent<MeshRenderer>().enabled = false;
            Destroy(Instantiate(tokenParticle, transform.position, Quaternion.identity), 2f);
            transform.GetChild(0).gameObject.SetActive(false);
        }
    }
}
