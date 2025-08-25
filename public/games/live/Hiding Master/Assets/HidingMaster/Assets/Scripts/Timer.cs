using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using UnityEngine.UI;

public class Timer : MonoBehaviour
{
    public int endAfterSeconds = 60;
    public Image timerFillImage;

    public int tempTimer = 60;
    private float tempTimerFloat = 0.00001f, countBackFrom = 1f;
    private TextMeshProUGUI timerText;

    [HideInInspector]
    public bool isPlayerTheSeeker;

    private bool canCountDown = false;

    public static Timer Instance;


    private void Awake()
    {
        Instance = this;
    }

    void Start()
    {
        tempTimer = endAfterSeconds;
        tempTimerFloat = (float)endAfterSeconds;
        timerText = transform.GetComponentInChildren<TextMeshProUGUI>();
        timerFillImage.fillAmount = 1f;
    }

    public void StartCountingDown()
    {
        if (tempTimerFloat < endAfterSeconds / 2)
            tempTimerFloat = (endAfterSeconds / 2f);

        canCountDown = true;
    }

    private void Update()
    {
        if (canCountDown)
        {
            if (HiderCounter.Instance.hiders.Count == 0)
            {
                PlayerController.Instance.Lost();
                GameManager.Instance.EndPanelActivation();
                if (EnemySeeker.Instance != null)
                    EnemySeeker.Instance.Won();
            }
            else if (tempTimerFloat > 0f)
            {
                tempTimerFloat -= Time.deltaTime;
                timerFillImage.fillAmount = tempTimerFloat / endAfterSeconds;
                timerText.text = tempTimerFloat.ToString("0");
            }
            else
            {
                canCountDown = false;
                if (isPlayerTheSeeker)
                {
                    GameManager.Instance.EndPanelActivation();
                    PlayerController.Instance.Lost();
                    if (EnemySeeker.Instance != null)
                        EnemySeeker.Instance.Won();
                }
                else
                {
                    GameManager.Instance.ClearedPanelActivation();
                    PlayerController.Instance.Won();
                    if (EnemySeeker.Instance != null)
                        EnemySeeker.Instance.Lost();
                }
            }
        }
    }
}
