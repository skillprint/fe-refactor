'use client';

/**
 * The player guide: what to do with a playbook your coach sets, how
 * challenges work, the emails you'll get, and what your coach can see. Open
 * without signing in and not in the menu, so a coach can send the link.
 *
 * Keep it true to the screens and the emails: labels and subject lines here
 * are the ones players actually see. The coach side of the same emails is in
 * the coach guide's Emails section (app/coach/guide).
 */
import PortalLayout from '@/components/PortalLayout';
import './guide.css';

const SECTIONS = [
  ['start', 'How you get in'],
  ['playbooks', 'Doing a playbook'],
  ['challenges', 'Challenges'],
  ['emails', 'Emails you’ll get'],
  ['coach', 'What your coach can see'],
] as const;

export default function GuideClient() {
  const header = (
    <div className="portal-head">
      <div className="portal-head__row">
        <h1>Player guide</h1>
      </div>
      <p>
        Your coach uses Skillprint to set you short sets of games, called playbooks, and to run challenges for the
        team. Here&rsquo;s what to do, and what to expect.
      </p>
    </div>
  );

  return (
    <PortalLayout pageClass="page--portal-guide" header={header}>
      <article className="player-guide">
        <nav className="player-guide__toc" aria-label="On this page">
          <ol>
            {SECTIONS.map(([id, title]) => (
              <li key={id}>
                <a href={`#${id}`}>{title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <section id="start">
          <h2>How you get in</h2>
          <p>
            You don&rsquo;t need to sign up or remember a password. Your coach adds you to their team using your email
            address.
          </p>
          <ol>
            <li>
              When your coach sets you a playbook, you get an email from Skillprint. Open it and choose the{' '}
              <strong>Start here</strong> link.
            </li>
            <li>That link signs you in and opens the playbook. You stay signed in on that device.</li>
            <li>
              Each link works <strong>once</strong> and lasts <strong>48 hours</strong>. If you&rsquo;ve already used
              it, or it&rsquo;s expired, open Skillprint on the device you used before. Signed out? The next email from
              your coach, a new playbook or a reminder, has a fresh link.
            </li>
          </ol>
        </section>

        <section id="playbooks">
          <h2>Doing a playbook</h2>
          <p>
            Everything your coach has set you is under <strong>Assigned to you</strong> on your home page. Each card
            shows:
          </p>
          <ul>
            <li>the playbook&rsquo;s name and who set it (&ldquo;From Coach Rivera&rdquo;),</li>
            <li>your coach&rsquo;s note, if they left one,</li>
            <li>
              when it&rsquo;s due: <em>Due in 3 days</em>, <em>Due tomorrow</em>, <em>Due today</em>. Once the date
              has passed it says <em>Was due 2 days ago</em>, and you can still do it,
            </li>
            <li>
              how far you&rsquo;ve got: <em>2 of 4 done</em>.
            </li>
          </ul>
          <ol>
            <li>
              Choose <strong>Start</strong>, or <strong>Continue</strong> if you&rsquo;ve begun.
            </li>
            <li>
              Play each game in the playbook. Any order works, and a game counts as done once you&rsquo;ve played it
              one time. Only play since your coach set the playbook counts.
            </li>
            <li>When every game is done, the playbook is complete, and your coach sees that.</li>
          </ol>
          <p>
            <strong>Not now</strong> takes a playbook off your home page if you&rsquo;ve decided not to do it. Your
            coach sees that you set it aside, and you won&rsquo;t get reminders about it.
          </p>
        </section>

        <section id="challenges">
          <h2>Challenges</h2>
          <p>
            Your coach can set the team a challenge for a few days or weeks: play a certain number of sessions or
            minutes, or improve at a skill such as memory or reaction time.
          </p>
          <ul>
            <li>
              <strong>You won&rsquo;t see challenges on Skillprint yet.</strong> Your coach tracks them and will tell
              you about any they set.
            </li>
            <li>
              There&rsquo;s nothing to join. Your normal play during the challenge&rsquo;s dates counts on its own.
            </li>
            <li>
              A skill challenge compares you with <em>your own</em> last four weeks, so it&rsquo;s about getting better,
              not about already being the best.
            </li>
            <li>
              Your coach sees a leaderboard for your team, and can compare the team with players at every PlayVS school.
              Coaches at other schools never see your name. You show up there only as &ldquo;Another player&rdquo;.
            </li>
          </ul>
        </section>

        <section id="emails">
          <h2>Emails you&rsquo;ll get</h2>
          <div className="player-guide__tablewrap">
            <table className="player-guide__table">
              <thead>
                <tr>
                  <th scope="col">Email</th>
                  <th scope="col">When</th>
                  <th scope="col">Subject looks like</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>New playbook</td>
                  <td>
                    As soon as your coach sets you one. It has their note, the due date, and your{' '}
                    <strong>Start here</strong> link.
                  </td>
                  <td>&ldquo;Coach Rivera set you Match-day warm-up&rdquo;</td>
                </tr>
                <tr>
                  <td>Reminder</td>
                  <td>
                    Automatically, from two days before it&rsquo;s due, if you haven&rsquo;t started. Your coach can
                    also send one if you haven&rsquo;t finished.
                  </td>
                  <td>&ldquo;Match-day warm-up is due Friday&rdquo; or &ldquo;A reminder about Match-day warm-up&rdquo;</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul>
            <li>
              You&rsquo;ll get at most <strong>one reminder a day</strong>, and <strong>three</strong> for any one
              playbook. None once you&rsquo;ve finished it or chosen <strong>Not now</strong>.
            </li>
            <li>Every email says why you&rsquo;re getting it: a coach at your school set you a playbook.</li>
          </ul>

          <h3>Turning emails off</h3>
          <ul>
            <li>
              Go to <strong>Settings</strong>, then <strong>Email</strong>, and switch off{' '}
              <em>New assignments from a coach</em> or <em>Reminders about unfinished assignments</em>.
            </li>
            <li>
              Or use the <strong>unsubscribe</strong> link at the bottom of any email. It stops just that kind of
              email, and you can subscribe again from the same page.
            </li>
            <li>
              Before you do, remember that the links in these emails are how you sign in. With new-playbook emails off,
              you&rsquo;ll only get in on a device where you&rsquo;re already signed in.
            </li>
            <li>
              If you turn reminders off, your coach is told so when they try to send you one, rather than it just not
              arriving.
            </li>
          </ul>
        </section>

        <section id="coach">
          <h2>What your coach can see</h2>
          <ul>
            <li>
              <strong>Always:</strong> whether and how much you play (sessions, minutes, and when you last played),
              your progress on playbooks they set, and your sessions or minutes in a challenge.
            </li>
            <li>
              <strong>Only if your school has arranged it with Skillprint:</strong> your skill scores and how
              they&rsquo;re changing, and a list of your sessions (which game, when, and how long).
            </li>
            <li>
              <strong>Never:</strong> your mood, or what happens inside a game.
            </li>
            <li>Each time a coach opens your page, that&rsquo;s recorded.</li>
            <li>
              Coaches only see players on their own school&rsquo;s teams. Everyone else is anonymous to them.
            </li>
          </ul>
        </section>
      </article>
    </PortalLayout>
  );
}
