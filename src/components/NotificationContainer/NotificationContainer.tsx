/**
 * NotificationContainer renders active notifications on screen with their styles, positions, progress bars, and close buttons, while handling display and dismissal animations.
 *
 * @example
 * ```tsx
 * import NotificationContainer from '@src/components/NotificationContainer'
 *
 * export default function NotificationContainer() {
 * const [notifications, setNotifications] = useState<Notification[]>([
 *     {
 *       id: 1,
 *       type: 'success',
 *       title: 'Success!',
 *       message: 'Your action was completed successfully.',
 *       duration: 3000,
 *       showProgress: true,
 *       position: 'top-right',
 *     },
 *   ]);
 *
 *   const removeNotification = (id: number) => {
 *     setNotifications((prev) => prev.filter((n) => n.id !== id));
 *   };
 *   return (
 *     <NotificationContainer
 *       notifications={notifications}
 *       removeNotification={removeNotification}
 *     />
 * }
 * ```
 */
'use client';

import { useEffect, useState } from 'react';
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react';
import clsx from 'clsx';
import styles from './NotificationContainer.module.scss';
import { Heading4, Text4 } from '@/src/components/Typography';
import { NOTIFICATION_TYPES } from '@/src/constants/strings';

/**
 * Define the props available for the NotificationContainer component.
 */
interface NotificationContainerProps {
  /**
   * The list of notifications to be displayed.
   *
   * Each notification contains metadata such as `id`, `type`,
   * `title`, `message`, optional `duration`, progress bar visibility, and position.
   */
  notifications: Notification[];

  /**
   * A callback function to remove a notification.
   *
   * Called when the user closes a notification manually
   * or when the notification auto-dismisses after its `duration`.
   *
   * @param id The unique identifier of the notification to remove.
   */
  removeNotification: (id: number) => void;
}

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  showProgress?: boolean;
  position?: string;
}

const iconMap = {
  success: <CircleCheck height={24} width={24} color="var(--notification-success-icon)" />,
  error: <CircleX height={24} width={24} color="var(--notification-error-icon)" />,
  warning: <TriangleAlert height={24} width={24} color="var(--notification-warning-icon)" />,
  info: <Info height={24} width={24} color="var(--notification-info-icon)" />,
};

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface ClassNames {
  title: string;
  message: string;
}

export default function NotificationContainer({ notifications, removeNotification }: NotificationContainerProps) {
  const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setActiveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    const timers = notifications.map((n) => {
      if (n.duration) {
        return setTimeout(() => removeNotification(n.id), n.duration);
      }
      return null;
    });

    return () => {
      timers.forEach((t) => t && clearTimeout(t));
    };
  }, [notifications, removeNotification]);

  // Group by position
  const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center'];

  const getNotificationClassNames = (type: NotificationType): ClassNames => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return {
          title: clsx(styles.notificationTitle, styles.successTitle),
          message: clsx(styles.notificationMessage, styles.successNotificationMessage),
        };
      case NOTIFICATION_TYPES.ERROR:
        return {
          title: clsx(styles.notificationTitle, styles.errorTitle),
          message: clsx(styles.notificationMessage, styles.errorNotificationMessage),
        };
      case NOTIFICATION_TYPES.WARNING:
        return {
          title: clsx(styles.notificationTitle, styles.warningTitle),
          message: clsx(styles.notificationMessage, styles.warningNotificationMessage),
        };
      case NOTIFICATION_TYPES.INFO:
        return {
          title: clsx(styles.notificationTitle, styles.infoTitle),
          message: clsx(styles.notificationMessage, styles.infoNotificationMessage),
        };
      default:
        return {
          title: styles.notificationTitle,
          message: styles.notificationMessage,
        };
    }
  };

  return (
    <div data-testid="NotificationContainerTest">
      {positions.map((pos) => (
        <div key={pos} className={clsx(styles.notificationWrapper, styles[pos])}>
          {activeNotifications
            .filter((n) => (n.position || 'top-right') === pos)
            .map((n) => {
              const classNames = getNotificationClassNames(n.type);
              return (
                <div key={n.id} className={clsx(styles.notification, styles[n.type], styles.show)}>
                  <div className={styles.notificationIcon}>{iconMap[n.type]}</div>
                  <div className={styles.notificationText}>
                    <Heading4 className={classNames.title}>{n.title}</Heading4>
                    <Text4 as="p" className={classNames.message}>
                      {n.message}
                    </Text4>
                  </div>

                  <button
                    className={styles.notificationClose}
                    data-testid="notification-close-btn"
                    onClick={() => removeNotification(n.id)}
                  >
                    <X height={24} width={24} color="var(--notification-close-icon)" />
                  </button>
                  {n.showProgress && n.duration && (
                    <div className={styles.notificationProgress}>
                      <div
                        className={styles.notificationProgressBar}
                        data-testid="progress-bar"
                        style={{ animationDuration: `${n.duration}ms` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}
