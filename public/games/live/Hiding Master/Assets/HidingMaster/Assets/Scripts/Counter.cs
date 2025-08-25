using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class Counter : MonoBehaviour
{
    public int timeToHide = 5;
    public GameObject timer;
    public TextMeshProUGUI hideCounterText;

    private int tempTime;

    public static Counter Instance;

    private void Awake()
    {
        Instance = this;
    }

    private void Start()
    {
        timer.SetActive(false);
        hideCounterText.gameObject.SetActive(false);
        tempTime = timeToHide;
    }

    public void StartCountingBack(bool isEnemyTheSeeker, TextMeshPro characterCounter)
    {
        if (isEnemyTheSeeker)
            StartCoroutine(CountBackEnemy(characterCounter));
        else
            StartCoroutine(CountBackPlayer(characterCounter));
    }

    IEnumerator CountBackEnemy(TextMeshPro characterCounter)
    {
        characterCounter.enabled = true;
        hideCounterText.gameObject.SetActive(true);

        while (tempTime > 0)
        {
            //Updating the counter texts
            hideCounterText.text = "TIME TO HIDE: " + tempTime.ToString();
            characterCounter.text = tempTime.ToString();
            tempTime--;

            yield return new WaitForSeconds(1f);
        }

        //Hiding starts
        hideCounterText.gameObject.SetActive(false);
        characterCounter.enabled = false;
        EnemySeeker.Instance.StartSearching();
        timer.SetActive(true);
        Timer.Instance.isPlayerTheSeeker = false;
        Timer.Instance.StartCountingDown();
    }

    IEnumerator CountBackPlayer(TextMeshPro characterCounter)
    {
        characterCounter.enabled = true;
        hideCounterText.gameObject.SetActive(true);

        while (tempTime > 0)
        {
            //Updating the counter texts
            hideCounterText.text = "TIME TO HIDE: " + tempTime.ToString();
            characterCounter.text = tempTime.ToString();
            tempTime--;

            yield return new WaitForSeconds(1f);
        }

        //Hiding starts
        hideCounterText.gameObject.SetActive(false);
        characterCounter.enabled = false;
        PlayerController.Instance.StartSearching();
        timer.SetActive(true);
        Timer.Instance.isPlayerTheSeeker = true;
        Timer.Instance.StartCountingDown();
    }
}
