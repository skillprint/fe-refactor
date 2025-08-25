using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class HiderCounter : MonoBehaviour
{
    private TextMeshProUGUI counterText;
    private Image characterImage;
    private int countOfHiders;

    public static HiderCounter Instance;
    public List<GameObject> hiders;

    private void Awake()
    {
        Instance = this;
        counterText = GetComponent<TextMeshProUGUI>();
        characterImage = GetComponentInChildren<Image>();
        characterImage.enabled = counterText.enabled = false;
    }

    public void CountHidersAtStart(int hidersCount)
    {
        characterImage.enabled = counterText.enabled = true;
        countOfHiders = GameManager.Instance.HiderCount;
        counterText.text = "x" + hidersCount.ToString();
    }

    public void UpdateHidersCounterAfterCatched(int change)
    {
        countOfHiders = GameManager.Instance.HiderCount;
        counterText.text = "x" + (countOfHiders).ToString();
    }

    public void Disable()
    {
        characterImage.enabled = counterText.enabled = false;
    }

    public void Enable()
    {
        characterImage.enabled = counterText.enabled = true;
    }
}
