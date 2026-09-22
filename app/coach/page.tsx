import { redirect } from 'next/navigation';

/** `/coach` has no landing screen of its own; teams is the home. */
export default function CoachIndexPage() {
  redirect('/coach/teams');
}
