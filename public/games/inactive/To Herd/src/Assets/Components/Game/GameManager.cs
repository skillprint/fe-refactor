using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEngine.SceneManagement;
using System;

public class GameManager : MonoBehaviour
{
    public Action OnRestart;
    public Action OnQuit;

    [SerializeField]
    private float timeBeforeStart = 1.5f;
    public int sheepUp = 2;
    private float currentTimeBeforeStart = 0f;

    [Header("Game")]
    [SerializeField]
    private GameObject gameConfigPrefab = null;
    [SerializeField]
    private SmartCamera smartCamera = null;
    [SerializeField]
    private WolfSelector wolfA = null;
    [SerializeField]
    private WolfSelector wolfB = null;

    [SerializeField]
    private Enclosure enclosure = null;
    [SerializeField]
    private Herd herd = null;

    [Header("UI")]
    [SerializeField]
    private TextMeshProUGUI currentNbSheeps = null;
    [SerializeField]
    private TextMeshProUGUI maxNbSheeps = null;

    [SerializeField]
    private GameObject timerObject = null;
    [SerializeField]
    private TextMeshProUGUI txtTimer = null;

    [SerializeField]
    private GameObject finishUI = null;
    [SerializeField]
    private Button restartButton = null;
    [SerializeField]
    private Button resetButton = null;
    [SerializeField]
    private Button quitButton = null;
    [SerializeField]
    private string menuSceneName = "";

    [SerializeField]
    private GameObject TopUI = null;
    [SerializeField]
    private GameObject pauseUI = null;
    [SerializeField]
    private Toggle settingsToggle = null;
    [SerializeField]
    private Button restartButtonSettings = null;
    [SerializeField]
    private Button quitButtonSettings = null;

    public float levelTime = 300f;
    private GameConfig gameConfig = null;
    private bool hasStarted = false;
    private bool isInit = false;
    private Skillprint.telemetry t;
    public void Init()
    {
        hasStarted = false;
        currentTimeBeforeStart = 0f;
        
        //ui
        finishUI.SetActive(false);
        pauseUI.SetActive(false);

        settingsToggle.interactable = true;
        settingsToggle.onValueChanged.AddListener(Settings_OnValueChanged);
        txtTimer.text = (levelTime).ToString("0.0");

        //game
        gameConfig = FindObjectOfType<GameConfig>();

        if (gameConfig == null)
        {
            Debug.LogWarning("[GameManager] no game config found, creating");
            GameObject temp = Instantiate(gameConfigPrefab);
            gameConfig = temp.GetComponentInChildren<GameConfig>();
        }

        timerObject.SetActive(gameConfig.showTimer);

        herd.Init();
        herd.AddSheeps(gameConfig.nbSheeps);
        sheepStart = herd.GetNbSheeps();

        maxNbSheeps.text = herd.GetNbSheeps().ToString();
        t.@event = "LEVEL_START";
        t.max_sheep = herd.GetNbSheeps();
        Skillprint.sendTelemetry(t);

        currentNbSheeps.text = enclosure.GetNumberOfSheepsInside().ToString();

        smartCamera.Init();

        isInit = true;
    }
    public GameObject startUI;
    public float TopUISpeed = 1f;
    private void Update()
    {
        if(isInit)
        {
            if (!hasStarted)
            {
                currentTimeBeforeStart += Time.deltaTime;
                if (currentTimeBeforeStart >= timeBeforeStart)
                {
                    // start
                    if (!wolfA.isSelected && !wolfB.isSelected) wolfA.Select();
                    
                    hasStarted = true;
                    startUI.SetActive(false);
                }
            }
            else
            {
                levelTime -= Time.deltaTime;
                levelTime = Mathf.Clamp(levelTime, 0, 1000);
                txtTimer.text = (levelTime).ToString("0.0");

                if (levelTime <= 0f)
                {
                    settingsToggle.interactable = false;
                    Settings_OnValueChanged(true);
                }

                float animProgress = Mathf.Lerp(1, 0, levelTime * TopUISpeed);
                //TopUI.transform.localPosition = Vector3.up *Screen.height/2  animProgress;
                TopUI.transform.localScale = Vector3.one*1.5f + Vector3.one *0.2f* animProgress;

                currentNbSheeps.text = enclosure.GetNumberOfSheepsInside().ToString();
                if (sheepInside != enclosure.GetNumberOfSheepsInside()) {
                    sheepInside = enclosure.GetNumberOfSheepsInside();

                    if (sheepInside == sheepStart)
                    {
                        t.@event = "LEVEL_COMPLETE";
                        Skillprint.sendTelemetry(t);
                        restartButton.onClick.AddListener(OnRestartClick);
                        resetButton.onClick.AddListener(OnResetClick);
                        quitButton.onClick.AddListener(OnQuitClick);

                        settingsToggle.interactable = false;
                        finishUI.SetActive(true);

                        Time.timeScale = 0;
                        return;
                    }
                    t.@event = "SHEEP";
                    t.current_sheep = sheepInside;
                    Skillprint.sendTelemetry(t);
                    
                }
            }
        }
    }
    private int sheepInside;
    private int sheepStart;
    private void OnDestroy()
    {
        settingsToggle.onValueChanged.RemoveListener(Settings_OnValueChanged);
        Time.timeScale = 1;
    }

    void OnRestartClick()
    {
        restartButton.onClick.RemoveListener(OnRestartClick);
        gameConfig.nbSheeps = sheepStart + sheepUp;
        OnRestart?.Invoke();
    }
    void OnResetClick()
    {
        restartButton.onClick.RemoveListener(OnRestartClick);

        OnRestart?.Invoke();
    }
    void OnQuitClick()
    {
        quitButton.onClick.RemoveListener(OnQuitClick);

        OnQuit?.Invoke();
    }

    void Settings_OnValueChanged(bool v)
    {
        if(v)
        {
            Time.timeScale = 0;
            pauseUI.SetActive(true);
            startUI.SetActive(false);
            restartButtonSettings.onClick.AddListener(OnResetClick);
            quitButtonSettings.onClick.AddListener(OnQuitClick);
        } else
        {
            Time.timeScale = 1;
            pauseUI.SetActive(false);

            restartButtonSettings.onClick.RemoveListener(OnResetClick);
            quitButtonSettings.onClick.RemoveListener(OnQuitClick);
        }
    }
}
