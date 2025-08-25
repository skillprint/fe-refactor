using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EnemyColorManager : MonoBehaviour
{
    [SerializeField] public List<Color> colors;

    void Start()
    {
        //Selects a random color for all of the enemies
        foreach (GameObject enemy in GameObject.FindGameObjectsWithTag("Hider"))
        {
            Color randomColor = colors[Random.Range(0, colors.Count)];
            colors.Remove(randomColor);
            enemy.GetComponentInChildren<SkinnedMeshRenderer>().material.color = randomColor;
        }
    }
}
