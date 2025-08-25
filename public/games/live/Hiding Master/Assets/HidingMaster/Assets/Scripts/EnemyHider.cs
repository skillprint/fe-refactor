using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;

public class EnemyHider : MonoBehaviour
{
    private NavMeshAgent agent;
    private Animator animator;
    private float maxDestinationPositionX, maxDestinationPositionZ;
    private bool canMove = true, gameIsOver = false;
    private ParticleSystem dustPoofParticle;

    void Start()
    {
        dustPoofParticle = transform.Find("DustDirtyPoof").GetComponent<ParticleSystem>();

        foreach (Transform child in GetComponentsInChildren<Transform>())
        {
            child.tag = "Hider";
            child.gameObject.layer = 9;
        }

        agent = GetComponent<NavMeshAgent>();
        animator = GetComponent<Animator>();

        maxDestinationPositionX = GameObject.FindGameObjectWithTag("Ground").transform.localScale.x / 2f;
        maxDestinationPositionZ = GameObject.FindGameObjectWithTag("Ground").transform.localScale.z / 2f;

        MoveToRandomDestination();
        StartCoroutine(CheckIfReachesDestination());
        StartCoroutine(SpawnDustPoofParticle());
    }

    public void MoveToRandomDestination()
    {
        animator.Play("Run");
        agent.SetDestination(new Vector3(UnityEngine.Random.Range(-maxDestinationPositionX, maxDestinationPositionX), transform.position.y, UnityEngine.Random.Range(-maxDestinationPositionZ, maxDestinationPositionZ)));

        int target = UnityEngine.Random.Range(0, 2);
        if (target == 0 && !PlayerController.Instance.canRun) agent.SetDestination(PlayerController.Instance.transform.position);
    }

    public void OnTriggerEnter(Collider collider)
    {
        if ((collider.transform.CompareTag("Player") && !PlayerController.Instance.isPlayerTheSeeker))
        {
            if (!PlayerController.Instance.canRun && canMove)
            {
                PlayerController.Instance.Revive();

                GameManager.Instance.PlayerRevived += 1;
                Dictionary<string, string> t = new Dictionary<string, string>();
                t.Add("event", "HIDER_TO_PLAYER");
                t.Add("count", GameManager.Instance.PlayerRevived.ToString());
                Skillprint.sendTelemetry(t);
            }
            if (!canMove && PlayerController.Instance.canRun)
            {
                Revive();

                GameManager.Instance.HiderRevived += 1;
                Dictionary<string, string> t = new Dictionary<string, string>();
                t.Add("event", "PLAYER_TO_HIDER");
                t.Add("count", GameManager.Instance.HiderRevived.ToString());
                Skillprint.sendTelemetry(t);

            }
        }
        else if (collider.transform.CompareTag("Hider") && !canMove){
            Revive();

            GameManager.Instance.Hider2Hider += 1;
            Dictionary<string, string> t = new Dictionary<string, string>();
            t.Add("event", "HIDER_TO_HIDER");
            t.Add("count", GameManager.Instance.HiderRevived.ToString());
            Skillprint.sendTelemetry(t);

        }

    }

    private void Revive()
    {
        GameManager.Instance.HiderCount += 1;
        gameIsOver = false;
        if (agent.isOnNavMesh)
            agent.isStopped = false;
        canMove = true;

        transform.Find("CaughtParticle").gameObject.SetActive(false);
        transform.Find("CaughtParticle").gameObject.SetActive(true);
        GetComponentInChildren<SkinnedMeshRenderer>().enabled = true;
        animator.Play("Run");
        HiderCounter.Instance.hiders.Add(gameObject);
        PlayerController.Instance.CaughtHider(1);
        HiderCounter.Instance.UpdateHidersCounterAfterCatched(1);
        AudioManager.Instance.CaughtSound();
    }

    IEnumerator CheckIfReachesDestination()
    {
        while (true)
        {
            if (canMove && (Vector3.Distance(transform.position, agent.destination) < 0.1f))
            {
                MoveToRandomDestination();
            }
            yield return new WaitForSeconds(0.1f);
        }
    }

    public void Caught()
    {
        if (!gameIsOver && !GameManager.Instance.gameIsOver)
        {
            GameManager.Instance.HiderCount -= 1;
            HiderCounter.Instance.UpdateHidersCounterAfterCatched(-1);
            HiderCounter.Instance.hiders.Remove(gameObject);
            gameIsOver = true;
            if (agent.isOnNavMesh)
                agent.isStopped = true;
            canMove = false;
            animator.Play("Lost" + UnityEngine.Random.Range(0, 2).ToString());
            GetComponentInChildren<SkinnedMeshRenderer>().enabled = true;
            PlayerController.Instance.CaughtHider();
            transform.Find("CaughtParticle").gameObject.SetActive(false);
            transform.Find("CaughtParticle").gameObject.SetActive(true);

            AudioManager.Instance.CaughtSound();

            Dictionary<string, string> t = new Dictionary<string, string>();
            t.Add("event", "HIDER_CAUGHT");
            t.Add("hider_count", GameManager.Instance.HiderCount.ToString());
            Skillprint.sendTelemetry(t);
        }

    }

    public void Won()
    {
        if (!gameIsOver)
        {
            gameIsOver = true;
            agent.isStopped = true;
            canMove = false;
            animator.Play("Won" + UnityEngine.Random.Range(0, 4).ToString());
            GetComponentInChildren<SkinnedMeshRenderer>().enabled = true;
        }
    }

    public void Hide()
    {
        GetComponentInChildren<SkinnedMeshRenderer>().enabled = false;
    }

    IEnumerator SpawnDustPoofParticle()
    {
        while (canMove)
        {
            yield return new WaitForSeconds(UnityEngine.Random.Range(2, 6));
            if (canMove)
                dustPoofParticle.Play();
        }
    }
}
