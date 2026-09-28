# Skillprint Coach: admin guide

For a school's **admin**: how to get your coaches onto Skillprint Coach, get them started, and point them to the coach guide.

- **The app:** https://playvs.skillprint.co/coach
- **The coach guide:** https://playvs.skillprint.co/coach/guide. It opens without signing in, so you can send it before a coach has an account.
- **The player guide:** https://playvs.skillprint.co/guide, for coaches to send their players.
- **This guide, as a page:** https://playvs.skillprint.co/coach/admin-guide

## Who's who

| Role | Can |
|---|---|
| **Admin** | Everything a coach can do, on **every** team at the school. Invite coaches and other admins. |
| **Coach** | Create teams, add players, build and assign playbooks, run challenges, on the teams they coach. Invite other coaches to those teams. |
| **Player** | Plays Skillprint games. Players are added by their coach, not invited, and they don't set a password. |
| **Skillprint staff** | Set up your school and its first admin, and record visibility grants (see [What coaches can see](#what-coaches-can-see)). |

## 1. Getting your admin account

Skillprint staff set up the school, then send its first admin an invite. For staff, the command is:

```bash
python manage.py invite_org_admin --email you@school.edu --org-name Your-School --coaching
```

The organisation name can't contain spaces when this is run through `run-remote.sh`; use `--org-id` for an existing school. `--coaching` switches on the coach features for the school.

Open the invite email, choose a password, and sign in at https://playvs.skillprint.co/coach/login. Invites last **7 days**; if yours expired, ask Skillprint staff to send it again. Staff running the same command reissues it.

## 2. Inviting coaches

**From Invites** (admins only, in the top menu):

1. Enter the coach's **Email**.
2. Choose the **Role**: **Coach**, or **Admin** for another admin.
3. Optionally pick a **Team**. They'll coach it as soon as they accept.
4. Choose **Send invite**. The list below shows each invite as *Waiting* (with the date its link works until), *Joined* or *Expired*. An expired invite has **Send again**.

**From a team's page:** open the team, scroll to **Coaches**, enter an email, and choose **Invite coach**. This always invites a Coach onto that team. The team's coaches can do this too, but only admins can invite admins.

**If an invite is refused:**

| Message | What to do |
|---|---|
| Already has an invite waiting | It can be sent again once it expires, after 7 days; then use **Send again**. |
| Has already joined | They're already at your school. Add them to a team from their team page, or ask them to sign in. |
| Coaches can invite other coaches… | Only an admin can invite an admin. Use **Invites**, signed in as an admin. |

## 3. Onboarding a coach

Once they've accepted:

- [ ] **Send them the guide:** https://playvs.skillprint.co/coach/guide. It walks through everything below, step by step.
- [ ] **Make sure they have a team.** Either invite them onto one (step 2), or let them create their own: **Teams → New team**. A coach who creates a team coaches it.
- [ ] **Have them add their players:** on the team, **Add players**, then paste `Name, email` one per line. Players don't set a password; they get in through the links in their assignment emails. Then send the players the player guide: https://playvs.skillprint.co/guide
- [ ] **Have them build a playbook and publish it** (**Playbooks → New playbook**), then **Assign** it to the team with a due date.
- [ ] **Optionally, a challenge:** **Challenges → New challenge**, for a play goal or a skill improvement, with team and PlayVS-wide leaderboards.

A short note you can adapt:

> You've been invited to Skillprint Coach for {school}. Accept the invite in the email from Skillprint and choose a password, then read the coach guide: https://playvs.skillprint.co/coach/guide. It shows how to set up your team, add players, and assign your first playbook.

## What coaches can see

- **By default, engagement only:** whether and how much each player plays, and their assignment progress.
- **Cognition scores and session lists need a grant.** Scores are level 2 (profile), and session lists are level 3. **Skillprint staff** record grants, when your school asks. Coaches see "Needs a level-2 grant" where a grant is missing. Withdrawing a grant returns the player to engagement only.
- **Mood is never shown to coaches.**
- **Other schools stay anonymous.** Coaches never see another school's players, except as an anonymous place on a PlayVS-wide leaderboard.
- **Opening a player's page is logged.** To find out who looked at a student's data, ask Skillprint staff.

The full list of figures, and the level each needs, is in the guide's *Engagement* section.

## Housekeeping

- **A coach leaving:** there's no in-app way to remove a coach yet. Ask Skillprint staff.
- **A player leaving a team:** their coach uses **Remove** on the roster. Their history is kept.
- **Sessions:** coaches stay signed in for 8 hours. **Sign out everywhere** ends every session for that account.
