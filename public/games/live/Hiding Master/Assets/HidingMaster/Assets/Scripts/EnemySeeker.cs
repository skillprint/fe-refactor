using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;
using TMPro;

public class EnemySeeker : MonoBehaviour
{
    private NavMeshAgent agent;
    private Animator animator;
    private float maxDestinationPositionX, maxDestinationPositionZ;
    private bool canMove = false;

    public static EnemySeeker Instance;

    private void Awake()
    {
        Instance = this;
    }

    void Start()
    {
        StartCoroutine(CheckIfReachesDestination());

        foreach (Transform child in GetComponentsInChildren<Transform>())
        {
            child.tag = "Seeker";
            child.gameObject.layer = 10;
        }

        agent = GetComponent<NavMeshAgent>();
        animator = GetComponent<Animator>();

        maxDestinationPositionX = GameObject.FindGameObjectWithTag("Ground").transform.localScale.x / 2f;
        maxDestinationPositionZ = GameObject.FindGameObjectWithTag("Ground").transform.localScale.z / 2f;

        animator.Play("Seek");

        Counter.Instance.StartCountingBack(true, transform.GetComponentInChildren<TextMeshPro>());
    }

    public void StartSearching()
    {
        canMove = true;
        transform.GetChild(1).gameObject.SetActive(true);
        MoveToRandomDestination();
    }

    public void MoveToRandomDestination()
    {
        animator.Play("Run");
        int target = Random.Range(0, HiderCounter.Instance.hiders.Count+2);
        if (target < HiderCounter.Instance.hiders.Count) agent.SetDestination(HiderCounter.Instance.hiders[target].transform.position);
        else
            agent.SetDestination(new Vector3(Random.Range(-maxDestinationPositionX, maxDestinationPositionX), transform.position.y, Random.Range(-maxDestinationPositionZ, maxDestinationPositionZ)));
    }

    private bool canFollowFootPrint = true;

    public void MoveToDestination(Vector3 position)
    {
        if (canFollowFootPrint && canMove)
        {
            canFollowFootPrint = false;
            animator.Play("Run");
            agent.SetDestination(position);
            Invoke("CanFollowFootPrintAgain", 5f);
        }
    }

    private void CanFollowFootPrintAgain()
    {
        canFollowFootPrint = true;
    }

    public void Lost()
    {
        canMove = false;
        if (agent != null)
            agent.isStopped = true;
        if (animator != null)
            animator.Play("Lost" + UnityEngine.Random.Range(0, 2).ToString());
    }

    public void Won()
    {
        canMove = false;
        if (agent != null)
            agent.isStopped = true;
        if (animator != null)
            animator.Play("Won" + UnityEngine.Random.Range(0, 4).ToString());
    }

    IEnumerator CheckIfReachesDestination()
    {
        while (true)
        {
            if (canMove && (Vector3.Distance(transform.position, agent.destination) < 0.1f))
                MoveToRandomDestination();
            yield return new WaitForSeconds(0.1f);
        }
    }
}
