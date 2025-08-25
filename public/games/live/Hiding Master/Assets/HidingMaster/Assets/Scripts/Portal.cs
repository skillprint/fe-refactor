using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Portal : MonoBehaviour
{
    public int portalIndex = 1;

    [HideInInspector]
    public bool canTeleport = true;

    private Portal teleportToPortal;
    private List<Transform> tempCharacters = new List<Transform>();

    void Start()
    {
        Portal[] allPortals = FindObjectsOfType<Portal>();

        for (int i = 0; i < allPortals.Length; i++)
        {
            if ((allPortals[i].portalIndex == portalIndex) && allPortals[i] != this)
            {
                teleportToPortal = allPortals[i];
                break;
            }
        }
    }

    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player") || other.CompareTag("Seeker") || other.CompareTag("Hider"))
        {
            if (!tempCharacters.Contains(other.transform))
            {
                if (other.CompareTag("Seeker"))
                    other.gameObject.GetComponent<EnemySeeker>().MoveToRandomDestination();
                else if (other.CompareTag("Hider"))
                    other.gameObject.GetComponent<EnemyHider>().MoveToRandomDestination();

                if (other.CompareTag("Player"))
                    AudioManager.Instance.TeleportSound();

                teleportToPortal.Teleport(other.transform);
            }

        }
    }

    private void Teleport(Transform character)
    {
        tempCharacters.Add(character);
        character.position = new Vector3(transform.position.x, character.position.y, transform.position.z);
    }

    private void OnTriggerExit(Collider other)
    {
        tempCharacters.Remove(other.transform);
    }
}
