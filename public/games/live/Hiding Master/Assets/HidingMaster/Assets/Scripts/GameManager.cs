using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{

    //----------------------------------------------
    //Thank you for purchasing the asset! If you have any questions/suggestions, don't hesitate to contact me!
    //E-mail: ragendom@gmail.com
    //Please let me know your impressions about the asset by leaving a review, I will appreciate it.
    //----------------------------------------------

    public GameObject startPanel, endPanel, clearedPanel, skinsPanel, pausedPanel, pauseButton, muteImage, reviveButton;
    public TextMeshProUGUI tempLevelText;

    private GameObject confetti, tutorialHandGesture;

    [HideInInspector]
    public bool gameIsOver = false;

    public static GameManager Instance;
    public int PlayerRevived = 0;
    public int HiderRevived = 0;
    public int Hider2Hider = 0;
    public int HiderCount = 0;
    private void Awake()
    {
#if UNITY_EDITOR
        Debug.unityLogger.logEnabled = true;
#else
        Debug.unityLogger.logEnabled = false;
#endif

        Instance = this;
        confetti = GameObject.FindGameObjectWithTag("Confetti");
        confetti.SetActive(false);
        tutorialHandGesture = GameObject.FindGameObjectWithTag("Tutorial");
        tutorialHandGesture.SetActive(false);
    }

    void Start()
    {
        if (PlayerPrefs.GetInt("level", 1) == 0) {
            PlayerPrefs.SetInt("level", 1);
        }
        GameManager.Instance.levelString += PlayerPrefs.GetInt("Level", 1).ToString();
        if ((Time.time == Time.timeSinceLevelLoad))
        {
            SceneManager.LoadScene(0);
            SceneManager.LoadScene(PlayerPrefs.GetInt("Level", 1),LoadSceneMode.Additive);
        }
            //UNCOMMENT THE FOLLOWING LINES IF YOU ENABLED UNITY ADS AT UNITY SERVICES AND REOPENED THE PROJECT!
            //if (AdManager.Instance.unityAds)
            //    CallUnityAds();     //Calls Unity Ads
            //else
            //CallAdmobAds();     //Calls Admob Ads

        StartPanelActivation();
        AudioCheck();
    }

    //UNCOMMENT THE FOLLOWING LINES IF YOU ENABLED UNITY ADS AT UNITY SERVICES AND REOPENED THE PROJECT!
    //public void CallUnityAds()
    //{
    //    if (Time.time != Time.timeSinceLevelLoad)
    //        AdManager.Instance.ShowUnityVideoAd();      //Shows Interstitial Ad when game starts (except for the first time)
    //    AdManager.Instance.HideAdmobBanner();
    //}

    public void CallAdmobAds()
    {
        AdManager.Instance.ShowAdmobBanner();        //Shows Banner Ad when game starts
        if (Time.time != Time.timeSinceLevelLoad)
            AdManager.Instance.ShowAdmobInterstitial();      //Shows Interstitial Ad when game starts (except for the first time)
    }
    public string levelString = "LEVEL X";
    public void Initialize()
    {
        pauseButton.SetActive(false);
        tempLevelText.text = levelString;
    }

    public void StartPanelActivation()
    {
        Initialize();
        clearedPanel.SetActive(false);
        startPanel.SetActive(true);
        endPanel.SetActive(false);
        skinsPanel.SetActive(false);
        pausedPanel.SetActive(false);
    }

    public void EndPanelActivation()
    {
        if (!cleared && !gameIsOver)
        {
            gameIsOver = true;
            AudioManager.Instance.DeathSound();
            startPanel.SetActive(false);
            clearedPanel.SetActive(false);
            endPanel.SetActive(true);
            skinsPanel.SetActive(false);
            pausedPanel.SetActive(false);
            pauseButton.SetActive(false);
            Timer.Instance.gameObject.SetActive(false);

            HiderCounter.Instance.Disable();
            level_end();
        }
    }
    void level_end()
    {
        Dictionary<string, string> t = new Dictionary<string, string>();
        t.Add("event", "LEVEL_END");
        t.Add("survived_count", GameManager.Instance.HiderCount.ToString());
        t.Add("player_revived", GameManager.Instance.PlayerRevived.ToString());
        t.Add("hider_revived", GameManager.Instance.HiderRevived.ToString());
        t.Add("hider_to_hider", GameManager.Instance.Hider2Hider.ToString());
        Skillprint.sendTelemetry(t);
    }

    public void SkinsPanelActivation()
    {
        clearedPanel.SetActive(false);
        startPanel.SetActive(false);
        skinsPanel.SetActive(true);
        pausedPanel.SetActive(false);

        CameraManager.Instance.LookAtPlayerSkin();
        HiderCounter.Instance.Disable();
    }

    public void PausedPanelActivation()
    {
        clearedPanel.SetActive(false);
        startPanel.SetActive(false);
        endPanel.SetActive(false);
        skinsPanel.SetActive(false);
        pausedPanel.SetActive(true);

        HiderCounter.Instance.Disable();
    }

    public void AudioCheck()
    {
        if (PlayerPrefs.GetInt("Audio", 0) == 0)
        {
            muteImage.SetActive(false);
            AudioManager.Instance.soundIsOn = true;
            AudioManager.Instance.PlayBackgroundMusic();
        }
        else
        {
            muteImage.SetActive(true);
            AudioManager.Instance.soundIsOn = false;
            AudioManager.Instance.StopBackgroundMusic();
        }
    }

    private bool isPlayerHiding;

    public void StartGame()
    {
        if (isPlayerHiding)
            StartHiding();
        else
            StartSeeking();
    }

    public void HideButton()
    {
        tutorialHandGesture.SetActive(true);
        isPlayerHiding = true;
        CameraManager.Instance.LookAtClosePlayer();
        pauseButton.SetActive(true);
        startPanel.SetActive(false);
        AudioManager.Instance.ButtonClickSound();
        //Counter.Instance.StartCountingBack(true);
        StartHiding();
        Dictionary<string, string> t = new Dictionary<string, string>();
        t.Add("event", "LEVEL_START");
        t.Add("level", levelString);
        Skillprint.sendTelemetry(t);
    }
    public int seekerCount = 1;
    private void StartHiding()
    {
        PlayerController.Instance.canRun = true;

        List<GameObject> hiders = new List<GameObject>();

        foreach (GameObject hider in GameObject.FindGameObjectsWithTag("Hider"))
            hiders.Add(hider);

        for (int i = 0; i < seekerCount; i++)
        {
            int randomIndex = Random.Range(0, hiders.Count);
            hiders[randomIndex].AddComponent<EnemySeeker>();
            hiders.RemoveAt(randomIndex);
        }

        HiderCounter.Instance.hiders = hiders;

        for (int i = 0; i < hiders.Count; i++) 
        {
            hiders[i].AddComponent<EnemyHider>();
        }
        hiders.Add(PlayerController.Instance.gameObject);
        HiderCount = hiders.Count;
        HiderCounter.Instance.CountHidersAtStart(HiderCount);
    }

    public void SeekButton()
    {
        tutorialHandGesture.SetActive(true);
        isPlayerHiding = false;
        pauseButton.SetActive(true);
        startPanel.SetActive(false);
        CameraManager.Instance.LookAtPlayerSeek();
        AudioManager.Instance.ButtonClickSound();
        StartSeeking();
    }

    private void StartSeeking()
    {
        PlayerController.Instance.StartSeeking();

        List<GameObject> hiders = new List<GameObject>();

        foreach (GameObject hider in GameObject.FindGameObjectsWithTag("Hider"))
            hiders.Add(hider);

        for (int i = 0; i < hiders.Count; i++)
            hiders[i].AddComponent<EnemyHider>().Hide();

        HiderCounter.Instance.CountHidersAtStart(HiderCount);
    }

    public void RestartButton()
    {
        Debug.Log("restart");
        AudioManager.Instance.ButtonClickSound();
        SceneManager.LoadScene(0);
        SceneManager.LoadScene(PlayerPrefs.GetInt("Level",1), LoadSceneMode.Additive);
    }

    public void SkinsBackButton()
    {
        StartPanelActivation();
        AudioManager.Instance.ButtonClickSound();
        CameraManager.Instance.LookAtFar();
    }

    public void AudioButton()
    {
        AudioManager.Instance.ButtonClickSound();
        if (PlayerPrefs.GetInt("Audio", 0) == 0)
            PlayerPrefs.SetInt("Audio", 1);
        else
            PlayerPrefs.SetInt("Audio", 0);
        AudioCheck();
    }

    public void SkinsButton()
    {
        SkinsPanelActivation();
        AudioManager.Instance.ButtonClickSound();
    }

    public void PauseButton()
    {
        pauseButton.SetActive(false);
        PausedPanelActivation();
        AudioManager.Instance.StopBackgroundMusic();
        Time.timeScale = 0f;
    }

    public void ResumeButton()
    {
        Time.timeScale = 1f;
        AudioManager.Instance.PlayBackgroundMusic();
        pauseButton.SetActive(true);
        pausedPanel.SetActive(false);
        HiderCounter.Instance.Enable();
    }

    public void HomeButton()
    {
        ResumeButton();
        RestartButton();
    }

    public GameObject nextLevelButton, replayButton;
    public bool cleared = false;

    public void ClearedPanelActivation()
    {
        if (!cleared && !gameIsOver)
        {
            cleared = true;

            int nextLevelIndex = PlayerPrefs.GetInt("Level",1) + 1;
            if (SceneManager.sceneCountInBuildSettings <= nextLevelIndex)
            {
                nextLevelButton.SetActive(false);
                replayButton.SetActive(true);
            }
            else
            {
                nextLevelButton.SetActive(true);
                replayButton.SetActive(false);
            }

            confetti.SetActive(true);
            clearedPanel.SetActive(true);
            startPanel.SetActive(false);
            endPanel.SetActive(false);
            skinsPanel.SetActive(false);
            pausedPanel.SetActive(false);
            pauseButton.SetActive(false);
            Timer.Instance.gameObject.SetActive(false);

            HiderCounter.Instance.Disable();
            AudioManager.Instance.LevelClearedSound();
            CameraManager.Instance.LookAtPlayerClosest();

        }
    }


    public void ReplayButton()
    {
        Debug.Log("replay");
        AudioManager.Instance.ButtonClickSound();
        PlayerPrefs.SetInt("Level", 1);
        SceneManager.LoadScene(0);

        SceneManager.LoadScene(PlayerPrefs.GetInt("Level",1), LoadSceneMode.Additive);
    }

    public void NextLevelButton()
    {
        Debug.Log("next");
        AudioManager.Instance.ButtonClickSound();

        int nextLevelIndex = PlayerPrefs.GetInt("Level",1) + 1;
        PlayerPrefs.SetInt("Level", nextLevelIndex);
        SceneManager.LoadScene(0); // essential
        SceneManager.LoadScene(nextLevelIndex, LoadSceneMode.Additive);
    }

    public void Revive()
    {
        //UNCOMMENT THE FOLLOWING LINES IF YOU ENABLED UNITY ADS AT UNITY SERVICES AND REOPENED THE PROJECT!
        //if (AdManager.Instance.unityAds)
        //    AdManager.Instance.ShowUnityRewardVideoAd();       //Shows Unity Reward Video ad
        //else
        AdManager.Instance.ShowAdmobRewardVideo(1);       //Shows Admob Reward Video ad
    }

    public void DoRevive()
    {
        endPanel.SetActive(false);
        reviveButton.SetActive(false);
        pauseButton.SetActive(true);
        gameIsOver = false;

        PlayerController.Instance.Revive();
        Timer.Instance.gameObject.SetActive(true);
        Timer.Instance.StartCountingDown();

        if (!isPlayerHiding)
            HiderCounter.Instance.Enable();
    }
}
