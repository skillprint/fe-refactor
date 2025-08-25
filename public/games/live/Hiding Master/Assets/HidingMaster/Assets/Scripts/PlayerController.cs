using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class PlayerController : MonoBehaviour
{
    public Joystick joystick;
    public float movementSpeed = 5f;

    private Rigidbody rb;
    private Animator animator;
    private bool gameIsOver = false;

    [HideInInspector]
    public bool canRun = false;

    public static PlayerController Instance;

    private void Awake()
    {
        Instance = this;
    }

    void Start()
    {
        rb = GetComponent<Rigidbody>();
        animator = GetComponent<Animator>();
    }

    void Update()
    {
        if (canRun)
        {
            if (joystick.Direction.magnitude <= 0.1f)
            {
                animator.Play("Idle");
                rb.Sleep();
            }
            else
            {
                if (!destroyedHandGesture)
                {
                    destroyedHandGesture = true;
                    Destroy(GameObject.FindGameObjectWithTag("Tutorial"));
                }

                animator.Play("Run");
                Vector3 direction = transform.position + new Vector3(joystick.Direction.x, 0f, joystick.Direction.y).normalized * 1000f;
                transform.LookAt(new Vector3(direction.x, transform.position.y, direction.z));

                rb.velocity = new Vector3(joystick.Direction.x, 0f, joystick.Direction.y).normalized * movementSpeed;
            }
        }
    }

    [HideInInspector]
    public bool isInvisible = false;

    public void Caught()
    {
        if (canRun)
        {
            GameManager.Instance.HiderCount -= 1;
            animator.Play("Lost" + UnityEngine.Random.Range(0, 2).ToString());
            HiderCounter.Instance.hiders.Remove(gameObject);
            canRun = false;
            CountHiders();
            HiderCounter.Instance.UpdateHidersCounterAfterCatched(-1);
            transform.Find("CaughtParticle").gameObject.SetActive(false);
            transform.Find("CaughtParticle").gameObject.SetActive(true);
            AudioManager.Instance.CaughtSound();
        }
        CameraManager.Instance.LookAtPlayerClosest();
        if (remainingHiders == 0)
        {
            if (!gameIsOver && !isInvisible)
            {
                gameIsOver = true;
                
                GameManager.Instance.EndPanelActivation();
                rb.constraints = RigidbodyConstraints.FreezeAll;
            }
        }
    }

    public void StartSeeking()
    {
        animator.Play("Seek");
        isPlayerTheSeeker = true;

        Counter.Instance.StartCountingBack(false, transform.GetComponentInChildren<TextMeshPro>());

        foreach (Transform child in GetComponentsInChildren<Transform>())
            child.gameObject.layer = 10;       

        CountHiders();
    }

  
    public void StartSearching()
    {
        canRun = true;
        animator.Play("Idle");
        transform.GetChild(1).gameObject.SetActive(true);
        CameraManager.Instance.LookAtClosePlayer();
    }

    private int hiders = 0, remainingHiders;
    public bool isPlayerTheSeeker = false;
    private bool destroyedHandGesture = false;

    private void CountHiders()
    {
        remainingHiders = hiders = GameObject.FindGameObjectsWithTag("Hider").Length;
    }

    public void CaughtHider(int change = -1)
    {
        if (isPlayerTheSeeker)
        {
            remainingHiders += change;

            Debug.Log(remainingHiders);

            if (remainingHiders == 0)
                Won();
        }
    }

    public void Won()
    {
        canRun = false;
        animator.Play("Won" + UnityEngine.Random.Range(0, 4).ToString());
        GameManager.Instance.ClearedPanelActivation();
        rb.constraints = RigidbodyConstraints.FreezeAll;
    }

    public void Lost()
    {
        canRun = false;
        animator.Play("Lost" + UnityEngine.Random.Range(0, 2).ToString());
        GameManager.Instance.EndPanelActivation();
        rb.constraints = RigidbodyConstraints.FreezeAll;
    }

    public void Revive()
    {
        GameManager.Instance.HiderCount += 1;
        gameIsOver = false;
        canRun = true;
        animator.Play("Idle");
        //rb.constraints = RigidbodyConstraints.FreezeRotationX;
        HiderCounter.Instance.hiders.Add(gameObject);
        CameraManager.Instance.LookAtClosePlayer();
        if (!isPlayerTheSeeker)
            GetComponentInChildren<Invisible>().SetInvisible();

        HiderCounter.Instance.UpdateHidersCounterAfterCatched(+1);
        transform.Find("CaughtParticle").gameObject.SetActive(false);
        transform.Find("CaughtParticle").gameObject.SetActive(true);
        AudioManager.Instance.CaughtSound();
    }
}
