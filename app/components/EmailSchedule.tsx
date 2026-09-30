'use client';

/**
 * When consumer email arrives (SKI-272), under Settings → Email:
 *
 * * the hour for the daily game and the profile tips;
 * * the day for the weekly summary, which goes at 8am;
 * * the time zone those times are in.
 *
 * The zone is filled in from the browser (`TimezoneSync`) until the player
 * picks one here; a picked zone stays put when they travel, which is what
 * "Chosen by you" tells them.
 */
import React, { useMemo } from 'react';
import { usePortalSettings } from '../../lib/models/portal/usePortalSettings';

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
// 28 September 2026 is a Monday; the API counts weekdays from Monday = 0.
const WEEKDAYS = Array.from({ length: 7 }, (_, day) => day);

function hourLabel(hour: number): string {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).format(new Date(2026, 8, 28, hour));
}

function weekdayLabel(day: number): string {
  return new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(new Date(2026, 8, 28 + day));
}

function allZones(current: string): string[] {
  let zones: string[] = [];
  try {
    zones = Intl.supportedValuesOf('timeZone');
  } catch {
    // An older browser: offer the current zone and the device's.
  }
  const device = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return Array.from(new Set([...zones, current, device].filter(Boolean))).sort();
}

export default function EmailSchedule() {
  const settings = usePortalSettings();
  const data = settings.data;
  const zones = useMemo(() => allZones(data?.timezone || ''), [data?.timezone]);
  if (!data) return null;

  const deviceZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zone = data.timezone || deviceZone;

  return (
    <div className="email-schedule layout-grid gap-md" role="group" aria-labelledby="emailScheduleTitle">
      <p className="margin-none font-sm weight-semibold" id="emailScheduleTitle">When</p>

      <label className="email-schedule__row" htmlFor="email-send-hour">
        <span>
          <span className="font-sm">Daily game and tips</span>
          <span className="layout-block font-xs text-muted">Skipped on days you've already played.</span>
        </span>
        <select
          id="email-send-hour"
          className="email-capture__input email-schedule__select"
          value={data.dailySendHour}
          disabled={settings.saving}
          onChange={(e) => settings.update({ dailySendHour: Number(e.target.value) })}
        >
          {HOURS.map((hour) => (
            <option key={hour} value={hour}>{hourLabel(hour)}</option>
          ))}
        </select>
      </label>

      <label className="email-schedule__row" htmlFor="email-digest-day">
        <span>
          <span className="font-sm">Weekly summary</span>
          <span className="layout-block font-xs text-muted">Arrives at {hourLabel(8)}.</span>
        </span>
        <select
          id="email-digest-day"
          className="email-capture__input email-schedule__select"
          value={data.digestWeekday}
          disabled={settings.saving}
          onChange={(e) => settings.update({ digestWeekday: Number(e.target.value) })}
        >
          {WEEKDAYS.map((day) => (
            <option key={day} value={day}>{weekdayLabel(day)}</option>
          ))}
        </select>
      </label>

      <label className="email-schedule__row" htmlFor="email-timezone">
        <span>
          <span className="font-sm">Time zone</span>
          <span className="layout-block font-xs text-muted">
            {data.timezoneSource === 'user' && data.timezone ? 'Chosen by you.' : 'Detected from this device.'}
          </span>
        </span>
        <select
          id="email-timezone"
          className="email-capture__input email-schedule__select"
          value={zone}
          disabled={settings.saving}
          onChange={(e) => settings.update({ timezone: e.target.value, timezoneSource: 'user' })}
        >
          {zones.map((name) => (
            <option key={name} value={name}>{name.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </label>

      {settings.error && (
        <p className="margin-none font-sm text--danger" role="alert">{settings.error}</p>
      )}
    </div>
  );
}
