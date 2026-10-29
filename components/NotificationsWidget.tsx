'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  iconForNotificationItem,
  NotificationKind,
  PLATFORM_NOTIFICATION_PRESETS,
  PortalNotification,
  useNotifications,
} from '@/lib/notifications';
import { relativeDay } from '@/lib/relativeDay';

export interface NotificationsWidgetProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsWidget({ open, onClose }: NotificationsWidgetProps) {
  const {
    notifications,
    unreadCount,
    badgeLabel,
    addWelcomeNotification,
    addPresetNotification,
    addAllPresetNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedPreset, setSelectedPreset] = useState<NotificationKind>('welcome');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      setMenuOpen(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (menuOpen) {
          setMenuOpen(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [menuOpen]);

  const visibleNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((item) => !item.read);
    }
    return notifications;
  }, [notifications, filter]);

  if (!open || typeof document === 'undefined') return null;

  const handleStartTour = (id: string) => {
    markAsRead(id);
    onClose();
    window.dispatchEvent(new CustomEvent('skillprint:show-ftue'));
  };

  const handleItemClick = (item: PortalNotification) => {
    if (item.actionHref) {
      markAsRead(item.id);
      onClose();
      router.push(item.actionHref);
      return;
    }
    if (item.kind === 'welcome') {
      handleStartTour(item.id);
      return;
    }
    if (!item.read) {
      markAsRead(item.id);
    }
  };

  return createPortal(
    <div
      className="popup-backdrop inset-none place-center is-open"
      onClick={onClose}
      data-notifications-widget
    >
      <article
        aria-labelledby="notificationsWidgetTitle"
        aria-modal="true"
        className="popup popup--dark notifications-widget"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {unreadCount > 0 && (
          <span
            className="notification notifications-widget__head-badge"
            aria-label={`${unreadCount} unread`}
          >
            {badgeLabel}
          </span>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close notifications"
          className="button button--tertiary button--icon-only layout-grid place-center padding-none no-grow notifications-widget__close-badge"
          data-notifications-close
        >
          <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-close"></use>
          </svg>
        </button>

        <div className="popup__content scrollbar-violet">
          <div className="layout-flex items-center justify-between gap-lg notifications-widget__header">
            <div className="min-width-0">
              <div className="layout-flex items-center gap-sm wrap">
                <h2 className="notifications-widget__title" id="notificationsWidgetTitle">
                  Notifications
                </h2>
              </div>
            </div>

            <div className="layout-flex items-center gap-xs no-grow">
              <div
                ref={menuRef}
                className="sp-dropdown sp-dropdown--menu notifications-widget__menu-dropdown"
              >
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  aria-label="Notification options"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="button button--tertiary button--icon-only button--md layout-grid place-center radius-control surface-transparent padding-none no-grow sp-dropdown__trigger"
                  data-notifications-menu-trigger
                >
                  <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                    <use href="#ti-dots"></use>
                  </svg>
                </button>

                <div
                  className="sp-dropdown__menu notifications-widget__menu"
                  role="menu"
                  aria-label="Notification options"
                  hidden={!menuOpen}
                  data-notifications-menu
                >
                  <div className="sp-dropdown__group-label">Filter</div>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={filter === 'all'}
                    aria-selected={filter === 'all'}
                    className="button button--tertiary button--sm sp-dropdown__item"
                    onClick={() => {
                      setFilter('all');
                      setMenuOpen(false);
                    }}
                  >
                    <span className="sp-dropdown__item-main">
                      <span>All ({notifications.length})</span>
                    </span>
                    <span className="sp-dropdown__selected-mark" aria-hidden="true">
                      &#10003;
                    </span>
                  </button>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={filter === 'unread'}
                    aria-selected={filter === 'unread'}
                    className="button button--tertiary button--sm sp-dropdown__item"
                    onClick={() => {
                      setFilter('unread');
                      setMenuOpen(false);
                    }}
                  >
                    <span className="sp-dropdown__item-main">
                      <span>Unread ({unreadCount})</span>
                    </span>
                    <span className="sp-dropdown__selected-mark" aria-hidden="true">
                      &#10003;
                    </span>
                  </button>

                  <div className="notifications-widget__menu-divider" role="separator" />
                  <div className="sp-dropdown__group-label">Actions</div>
                  <button
                    type="button"
                    role="menuitem"
                    className="button button--tertiary button--sm sp-dropdown__item"
                    disabled={unreadCount === 0}
                    onClick={() => {
                      markAllAsRead();
                      setMenuOpen(false);
                    }}
                    data-mark-all-read
                  >
                    <span className="sp-dropdown__item-main">
                      <span>Mark all read</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="button button--tertiary button--sm sp-dropdown__item"
                    disabled={notifications.length === 0}
                    onClick={() => {
                      clearAll();
                      setMenuOpen(false);
                    }}
                    data-clear-notifications
                  >
                    <span className="sp-dropdown__item-main">
                      <span>Clear all</span>
                    </span>
                  </button>

                  <div className="notifications-widget__menu-divider" role="separator" />
                  <div className="sp-dropdown__group-label">Add test notification</div>
                  <div
                    className="notifications-widget__generator"
                    aria-label="Generate test notifications"
                  >
                    <select
                      className="notifications-widget__select"
                      aria-label="Notification type to add"
                      value={selectedPreset}
                      onChange={(e) => setSelectedPreset(e.target.value as NotificationKind)}
                      data-notification-preset-select
                    >
                      {PLATFORM_NOTIFICATION_PRESETS.map((preset) => (
                        <option key={preset.key} value={preset.key}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                    <div className="notifications-widget__generator-actions">
                      <button
                        type="button"
                        className="button button--secondary button--sm"
                        onClick={() => {
                          if (selectedPreset === 'welcome') {
                            addWelcomeNotification();
                          } else {
                            addPresetNotification(selectedPreset);
                          }
                        }}
                        data-add-welcome-notification
                      >
                        <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
                          <use href="#ti-plus"></use>
                        </svg>
                        Add
                      </button>
                      <button
                        type="button"
                        className="button button--tertiary button--sm"
                        onClick={() => addAllPresetNotifications()}
                        data-add-all-notifications
                      >
                        Add all ({PLATFORM_NOTIFICATION_PRESETS.length})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="notifications-widget__stage">
            {visibleNotifications.length === 0 ? (
              <div className="notifications-widget__empty" role="status">
                <span className="notifications-widget__empty-icon" aria-hidden="true">
                  <svg className="sp-icon sp-icon--md" viewBox="0 0 24 24">
                    <use href="#ti-bell"></use>
                  </svg>
                </span>
                <strong className="notifications-widget__empty-title">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications waiting'}
                </strong>
                <p className="notifications-widget__empty-text margin-none">
                  {filter === 'unread'
                    ? 'Every notification in your inbox has been read.'
                    : "You're all caught up. Use the options menu above to preview platform alerts."}
                </p>
              </div>
            ) : (
              <div className="notifications-widget__list" role="list">
                {visibleNotifications.map((item) => (
                  <article
                    key={item.id}
                    role="listitem"
                    tabIndex={0}
                    onClick={() => handleItemClick(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleItemClick(item);
                      }
                    }}
                    className={`sp-alert notifications-widget__item ${
                      item.read ? 'is-read' : 'is-unread'
                    }`}
                    data-alert-tone={item.tone}
                    data-notification-id={item.id}
                    data-notification-kind={item.kind || 'custom'}
                    data-notification-unread={!item.read ? 'true' : 'false'}
                  >
                    <svg
                      className="sp-icon sp-icon--sm sp-alert__icon"
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                    >
                      <use href={iconForNotificationItem(item)}></use>
                    </svg>
                    <div className="sp-alert__body">
                      <div className="notifications-widget__item-head">
                        <strong className="sp-alert__title">{item.title}</strong>
                        {item.categoryLabel && (
                          <span className="ui-badge ui-badge--sm notifications-widget__category-pill">
                            {item.categoryLabel}
                          </span>
                        )}
                        {!item.read && (
                          <span
                            className="notifications-widget__new-dot"
                            role="status"
                            aria-label="New"
                            title="New"
                            data-notification-new-dot
                          />
                        )}
                      </div>
                      <p className="sp-alert__text">{item.message}</p>
                      <div className="notifications-widget__item-foot">
                        <span className="notifications-widget__time">
                          {relativeDay(item.createdAt) || 'today'}
                        </span>
                        {((item.actionHref && item.actionLabel) || item.kind === 'welcome') && (
                          <div className="sp-alert__actions notifications-widget__actions">
                            {item.actionHref && item.actionLabel && (
                              <Link
                                href={item.actionHref}
                                className="button button--link button--sm notifications-widget__cta-link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(item.id);
                                  onClose();
                                }}
                              >
                                {item.actionLabel}
                              </Link>
                            )}
                            {item.kind === 'welcome' && (
                              <button
                                type="button"
                                className="button button--link button--sm notifications-widget__cta-link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartTour(item.id);
                                }}
                              >
                                Take tour
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="button button--tertiary button--icon-only button--sm sp-alert__dismiss"
                      aria-label={`Mark as read and dismiss ${item.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(item.id);
                      }}
                      data-dismiss-notification={item.id}
                      data-mark-read={item.id}
                    >
                      <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
                        <use href="#ti-close"></use>
                      </svg>
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>,
    document.body,
  );
}

/**
 * The sidebar's "Notifications" entry: displays the bell icon, label, and
 * unread count bubble, and opens the NotificationsWidget on click.
 */
export function NotificationsNavItem({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { hydrated, unreadCount, badgeLabel, ariaLabel } = useNotifications();

  const label = hydrated ? ariaLabel : 'Notifications';
  const showBadge = hydrated && unreadCount > 0;

  return (
    <>
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${className} ${open ? 'is-active' : ''}`.trim()}
        onClick={() => setOpen(true)}
        data-notifications-nav
      >
        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
          <use href="#ti-bell"></use>
        </svg>
        <span className="sp-side-nav__label">Notifications</span>
        {showBadge && (
          <span className="notification" aria-hidden="true" data-notifications-badge>
            {badgeLabel}
          </span>
        )}
      </button>
      {open && <NotificationsWidget open={open} onClose={() => setOpen(false)} />}
    </>
  );
}

export default NotificationsWidget;
