'use client';

/**
 * The coach guide: how to run a team on Skillprint Coach, and every figure a
 * coach can see. Open without signing in, so an admin can send the link to a
 * new coach before they have an account (docs/COACH_ADMIN_README.md).
 *
 * Keep it true to the screens: labels here are the labels there. When a
 * screen changes, change its section.
 */
import Link from 'next/link';
import { useCoachAuth } from '@/lib/models/coach';

const SECTIONS = [
  ['start', 'Getting started'],
  ['teams', 'Create a team'],
  ['players', 'Add your players'],
  ['coaches', 'Invite a co-coach'],
  ['playbooks', 'Build a playbook'],
  ['assign', 'Assign a playbook'],
  ['emails', 'Emails: what goes out, and when'],
  ['challenges', 'Challenges and leaderboards'],
  ['engagement', 'Engagement: every figure you can see'],
  ['privacy', 'What you can and can’t see'],
] as const;

function Metric({ rows }: { rows: Array<[string, string, string?]> }) {
  return (
    <div className="coach-tablewrap">
      <table className="coach-table coach-guide__metrics">
        <thead>
          <tr>
            <th scope="col">Figure</th>
            <th scope="col">What it means</th>
            <th scope="col">Needs</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, meaning, needs]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{meaning}</td>
              <td className="coach-meta">{needs ?? 'Nothing extra'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CoachGuidePage() {
  const { session } = useCoachAuth();

  return (
    <article className="coach-guide">
      <div className="coach-pagehead">
        <h1>Coach guide</h1>
        <p>
          How to set up your teams, add players, assign work, run challenges, and read how your players are doing.
          {!session && (
            <>
              {' '}
              <Link href="/coach/login">Sign in</Link> when you&rsquo;re ready.
            </>
          )}
        </p>
      </div>

      <nav className="coach-guide__toc" aria-label="On this page">
        <ol>
          {SECTIONS.map(([id, title]) => (
            <li key={id}>
              <a href={`#${id}`}>{title}</a>
            </li>
          ))}
        </ol>
      </nav>

      <section id="start">
        <h2>Getting started</h2>
        <ol>
          <li>
            Your school&rsquo;s admin invites you by email. Open the link in that email and choose a password. The
            link works for <strong>7 days</strong>; if it has expired, ask your admin to send it again.
          </li>
          <li>
            Sign in at <Link href="/coach/login">Coach sign-in</Link> with your email and password. You stay signed in
            for 8 hours. Forgot it? Use <em>Forgot your password?</em> on the sign-in page.
          </li>
          <li>
            The menu across the top has <strong>Teams</strong>, <strong>Playbooks</strong>,{' '}
            <strong>Assignments</strong> and <strong>Challenges</strong>. Admins also see <strong>Invites</strong>.
          </li>
          <li>
            <strong>Sign out</strong> ends this session. <strong>Sign out everywhere</strong> ends your sessions on
            every device, which is useful after using a shared computer.
          </li>
        </ol>
      </section>

      <section id="teams">
        <h2>Create a team</h2>
        <ol>
          <li>
            Go to <strong>Teams</strong> and choose <strong>New team</strong>.
          </li>
          <li>
            Give it a name and, if you like, a season (&ldquo;Spring 2027&rdquo;). If you coach at more than one
            school, pick which one.
          </li>
          <li>
            Choose <strong>Create team</strong>. The team opens on its empty roster, ready for players. You coach any
            team you create.
          </li>
        </ol>
      </section>

      <section id="players">
        <h2>Add your players</h2>
        <p>
          Players don&rsquo;t sign up or set a password. You add them by email, and they get into Skillprint through
          the link in each assignment email.
        </p>
        <ol>
          <li>
            Open the team from <strong>Teams</strong>. On an empty team, <strong>Add players</strong> is already open;
            otherwise choose <strong>Add players</strong> at the top of the roster.
          </li>
          <li>
            Paste one player per line. Any of these work:
            <ul>
              <li>
                <code>Ada Lovelace, ada@school.edu</code>
              </li>
              <li>
                <code>ada@school.edu, Ada Lovelace</code>
              </li>
              <li>
                <code>Ada Lovelace &lt;ada@school.edu&gt;</code>
              </li>
              <li>
                <code>ada@school.edu</code> on its own
              </li>
              <li>rows copied straight from a spreadsheet</li>
            </ul>
          </li>
          <li>
            Choose <strong>Add players</strong>. Each line gets a result: <em>Added</em>, <em>Already on the team</em>,
            or <em>Not added</em> with the reason. Lines that weren&rsquo;t added stay in the box so you can fix them
            and send again. You can add up to 60 at a time.
          </li>
        </ol>
        <p>
          <strong>If an address can&rsquo;t be added:</strong> a typo or duplicate is flagged on its line. An address
          that already has a Skillprint account outside your school can&rsquo;t be added from here. Skillprint support
          can add it for you. A coach or admin at your school can&rsquo;t also be added as a player.
        </p>
        <p>
          Send your players the <Link href="/guide">player guide</Link>. It tells them what to do when you set a
          playbook, how challenges work, and how to manage their emails.
        </p>
        <p>
          On each roster row, <strong>Rename</strong> changes how the player appears to you and other coaches at your
          school. <strong>Remove</strong> takes them off the team; their history is kept, and you can add them back.
        </p>
      </section>

      <section id="coaches">
        <h2>Invite a co-coach</h2>
        <ol>
          <li>Open the team and scroll to <strong>Coaches</strong>.</li>
          <li>
            Enter their email and choose <strong>Invite coach</strong>. They get an email to set a password, and join
            as a coach of this team as soon as they accept.
          </li>
        </ol>
        <p>
          The list under the form shows everyone invited to this team, marked <em>Invited</em>, <em>Joined</em> or{' '}
          <em>Expired</em>. Coaches can invite other coaches to their own teams. Only an admin can invite another
          admin, from <strong>Invites</strong>.
        </p>
      </section>

      <section id="playbooks">
        <h2>Build a playbook</h2>
        <p>A playbook is a short sequence of Skillprint games for a player to work through.</p>
        <ol>
          <li>
            Go to <strong>Playbooks</strong> and choose <strong>New playbook</strong>.
          </li>
          <li>
            Under <strong>Details</strong>, give it a <strong>Title</strong> and say <strong>What it&rsquo;s for</strong>
            .
          </li>
          <li>
            In the <strong>Catalogue</strong>, search by game, skill or mood, and add games. Put them in order under{' '}
            <strong>Sequence</strong>.
          </li>
          <li>
            <strong>Save draft</strong> to come back later, or <strong>Publish</strong> when it&rsquo;s ready. Only a
            published playbook can be assigned.
          </li>
        </ol>
      </section>

      <section id="assign">
        <h2>Assign a playbook</h2>
        <ol>
          <li>
            Open the playbook and choose <strong>Assign</strong>.
          </li>
          <li>
            Under <strong>Who</strong>, pick the <strong>Team</strong>, then <strong>The whole team</strong> or{' '}
            <strong>Some players</strong> (tick the ones you want).
          </li>
          <li>
            Under <strong>When</strong>, set a <strong>Due</strong> date and whether it repeats:{' '}
            <strong>Once</strong>, or <strong>Every week until the due date</strong>.
          </li>
          <li>
            Add a <strong>Note</strong> if you like. Players see it alongside the playbook.
          </li>
          <li>
            Choose <strong>Assign</strong>. Players are emailed straight away with a link that signs them in and
            opens the playbook. Each link works once and lasts 48 hours; later emails carry fresh ones.
          </li>
        </ol>
        <p>
          <strong>Following up.</strong> <strong>Assignments</strong> lists what you&rsquo;ve set. Open one to see
          every player&rsquo;s status: <em>Not started</em>, <em>In progress</em>, <em>Complete</em>, or{' '}
          <em>Dismissed</em> if they chose not to do it. It also shows how many of the games they&rsquo;ve played and
          when they were last reminded.
        </p>
        <p>
          <strong>Remind</strong> emails the players who haven&rsquo;t finished, or just the ones you pick. Skillprint
          also reminds players automatically; see <a href="#emails">Emails</a> for the rules. Players who join the
          team later pick up its open assignments.
        </p>
      </section>

      <section id="emails">
        <h2>Emails: what goes out, and when</h2>
        <p>Skillprint sends every email itself, from Skillprint. You never need to email a player a link.</p>

        <h3>To your players</h3>
        <div className="coach-tablewrap">
          <table className="coach-table coach-guide__metrics">
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Who gets it, and when</th>
                <th scope="col">Subject</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>New playbook</td>
                <td>
                  Each player you assign, as soon as you choose <strong>Assign</strong>, and a player who joins the
                  team while the assignment is still open, when they join.
                </td>
                <td className="coach-meta">&ldquo;{'{Your name}'} set you {'{playbook}'}&rdquo;</td>
              </tr>
              <tr>
                <td>Automatic reminder</td>
                <td>Players who haven&rsquo;t started, from two days before it&rsquo;s due.</td>
                <td className="coach-meta">
                  &ldquo;{'{Playbook}'} is due {'{Friday}'}&rdquo;, or &ldquo;A reminder about {'{playbook}'}&rdquo;
                </td>
              </tr>
              <tr>
                <td>Your reminder</td>
                <td>
                  When you choose <strong>Remind</strong>: players who haven&rsquo;t finished, or the ones you pick.
                </td>
                <td className="coach-meta">The same as the automatic one.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li>
            The new-playbook email says who set it and from which school, the number of games, your{' '}
            <strong>Note</strong>, and the due date, with a <strong>Start here</strong> link. Write the note for the
            player: they read it in the email as well as on the playbook.
          </li>
          <li>
            Every email carries a fresh sign-in link. It works once and lasts 48 hours. It&rsquo;s also how players
            without a password get into Skillprint, so a player who&rsquo;s been signed out gets back in through your
            next assignment or reminder.
          </li>
          <li>
            A player gets at most <strong>one reminder a day</strong> and <strong>three per assignment</strong>, yours
            and the automatic ones counted together. Nobody is reminded about work they&rsquo;ve finished or set
            aside.
          </li>
          <li>
            Each email says why the player is getting it (&ldquo;a coach at {'{school}'} assigned you a
            playbook&rdquo;) and has an unsubscribe link. Players can also switch either kind off under{' '}
            <strong>Settings</strong>, then <strong>Email</strong>.
          </li>
        </ul>

        <h3>When Remind skips someone</h3>
        <p>After you choose Remind, it says who was reminded and who was skipped, with the reason:</p>
        <div className="coach-tablewrap">
          <table className="coach-table coach-guide__metrics">
            <thead>
              <tr>
                <th scope="col">Reason</th>
                <th scope="col">What to do</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Already finished.</td>
                <td>Nothing. They&rsquo;re done.</td>
              </tr>
              <tr>
                <td>Dismissed it.</td>
                <td>They chose <em>Not now</em>. Have a word with them in person if it matters.</td>
              </tr>
              <tr>
                <td>Already reminded today.</td>
                <td>Try again tomorrow.</td>
              </tr>
              <tr>
                <td>Already reminded 3 times.</td>
                <td>No more emails for this assignment. Follow up in person.</td>
              </tr>
              <tr>
                <td>Turned reminders off.</td>
                <td>The player switched reminders off. That&rsquo;s their choice; follow up in person.</td>
              </tr>
              <tr>
                <td>Emails to this address bounce.</td>
                <td>
                  Earlier emails didn&rsquo;t arrive. Check the address with the player. If it&rsquo;s wrong, add
                  them with the right one and remove the old row; if it&rsquo;s right, their school&rsquo;s mail may be
                  blocking Skillprint.
                </td>
              </tr>
              <tr>
                <td>No email address on file.</td>
                <td>They were added without a real address. Add them with their email and remove the old row.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>To you</h3>
        <ul>
          <li>
            <strong>Your invite</strong>, when an admin or another coach invites you. Its link lasts 7 days.
          </li>
          <li>
            <strong>Password reset</strong>, when you use <em>Forgot your password?</em> on the sign-in page.
          </li>
        </ul>
        <p className="coach-meta">
          Skillprint doesn&rsquo;t email you when players finish or fall behind. Check <strong>Assignments</strong> and
          your team pages for that.
        </p>
      </section>

      <section id="challenges">
        <h2>Challenges and leaderboards</h2>
        <p>A challenge sets your team a goal for a few days or weeks. Players aren&rsquo;t shown challenges yet; they&rsquo;re for you to track.</p>
        <ol>
          <li>
            Go to <strong>Challenges</strong> and choose <strong>New challenge</strong>.
          </li>
          <li>
            Pick the team, give it a title, and choose the kind:
            <ul>
              <li>
                <strong>Play goal</strong>: count <em>sessions played</em> or <em>minutes played</em>, of the games you
                choose or of any game.
              </li>
              <li>
                <strong>Skill improvement</strong>: pick a skill. Each player is measured against their own last 28
                days, so it rewards getting better, not being best already.
              </li>
            </ul>
          </li>
          <li>
            Set a goal per player and the start and end dates (up to 92 days), then{' '}
            <strong>Create challenge</strong>.
          </li>
        </ol>
        <p>
          A challenge&rsquo;s page shows the <strong>Team</strong> total, each player&rsquo;s figure and how close they
          are to the goal, and the <strong>Leaderboard</strong>. Switch the leaderboard between <strong>Team</strong>{' '}
          and <strong>All of PlayVS</strong>: the second ranks your players against everyone at PlayVS schools,
          measured the same way over the same dates. Only your own players are named there; everyone else shows as
          &ldquo;Another player&rdquo;. <strong>Cancel challenge</strong> stops it; it stays in the list.
        </p>
      </section>

      <section id="engagement">
        <h2>Engagement: every figure you can see</h2>
        <p>
          &ldquo;Needs&rdquo; is the visibility level a player has to have granted before you see that figure for
          them. Level 1 is where every player starts. See <a href="#privacy">What you can and can&rsquo;t see</a>.
        </p>

        <h3>Teams (your landing page)</h3>
        <Metric
          rows={[
            ['Players', 'How many are on the team now.'],
            ['Active', 'Players who played in the last 7 days.'],
            ['Lapsed', 'Players who haven’t played for 14 days or more, or ever.'],
            ['Sessions', 'Sessions across the team this week.'],
            ['Median', 'Median minutes played per player this week.'],
          ]}
        />

        <h3>A team&rsquo;s roster</h3>
        <p className="coach-meta">Choose the range at the top: 7, 30 or 90 days.</p>
        <Metric
          rows={[
            ['Last played', 'When they last played, however long ago.'],
            ['Sessions', 'Sessions in the range.'],
            ['Minutes', 'Minutes played in the range.'],
            ['Strongest / Weakest', 'Their best and weakest cognition skill in the range, with the score.', 'Level 2'],
          ]}
        />

        <h3>Team trends and What the team plays</h3>
        <Metric
          rows={[
            ['Team trends', 'The team’s weekly average on each cognition skill over 90 days.', 'Team of 5 or more'],
            ['Plays', 'How many sessions of each game the team played.', 'Team of 5 or more'],
            ['Players', 'How many players played each game.', 'Team of 5 or more'],
            ['Avg score', 'The team’s average in-game score on each game.', 'Team of 5 or more'],
            ['Exercises', 'The skills each game trains.', 'Team of 5 or more'],
          ]}
        />
        <p className="coach-meta">
          On teams under 5 players these are withheld, because a team average would really be one player&rsquo;s
          data. The screen says so.
        </p>

        <h3>A player&rsquo;s page</h3>
        <Metric
          rows={[
            ['Last played', 'When they last played, however long ago.'],
            ['Sessions all time', 'Every session they’ve played.'],
            ['Sessions in range, Minutes in range', 'In the range you choose.'],
            ['Skill profile', 'Their average on each cognition skill, and the sessions behind it.', 'Level 2'],
            ['Trend', 'Their cognition skills over 90 days.', 'Level 2'],
            ['Sessions', 'Each session: the game, when, and how long. Never what happened inside it.', 'Level 3'],
          ]}
        />

        <h3>Assignments</h3>
        <Metric
          rows={[
            ['Status', 'Not started, In progress, Complete, or Dismissed.'],
            ['Games', 'How many of the playbook’s games they’ve played, e.g. “3 of 5”.'],
            ['Started', 'When they first played one of its games after you assigned it.'],
            ['Last reminded', 'The last reminder that actually reached them.'],
          ]}
        />

        <h3>Challenges</h3>
        <Metric
          rows={[
            ['Play figure', 'Their sessions or minutes in the window, and progress toward the goal.'],
            ['Skill improvement', 'Points gained on the skill against their last 28 days.', 'Level 2'],
            ['Team total', 'Play: the team’s combined figure. Skill: the average improvement.', 'Skill: 5 or more measured'],
            ['Leaderboard', 'Rank by name on your team; your players’ places among everyone at PlayVS.', 'Skill: level 2'],
          ]}
        />
      </section>

      <section id="privacy">
        <h2>What you can and can&rsquo;t see</h2>
        <ul>
          <li>
            <strong>Level 1, engagement</strong>, applies to every player by default: whether and how much they play,
            and assignment progress.
          </li>
          <li>
            <strong>Level 2, profile</strong>, adds cognition scores: the skill profile, strongest and weakest, trends,
            and skill challenge figures.
          </li>
          <li>
            <strong>Level 3, sessions</strong>, adds the list of individual sessions.
          </li>
          <li>
            Levels 2 and 3 are recorded by Skillprint staff, on request from your school. Where a figure needs one,
            the screen says &ldquo;Needs a level-2 grant&rdquo; rather than showing a blank.
          </li>
          <li>
            You never see a player&rsquo;s mood, at any level, and never anything about players at other schools
            beyond an anonymous place on a PlayVS-wide leaderboard.
          </li>
          <li>Every time you open an individual player&rsquo;s page, that&rsquo;s logged.</li>
          <li>
            Skillprint measures play on <strong>Skillprint&rsquo;s own games</strong>, short cognitive games like
            reaction time, memory and attention. It doesn&rsquo;t read or score the esports titles your players
            compete in.
          </li>
        </ul>
      </section>
    </article>
  );
}
