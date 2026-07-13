export const ACTIVITY_FILTERS = {
  ALL: "ALL",
  STATE_CHANGE: "STATE_CHANGE",
  ALERT: "ALERT",
};

const AIR_QUALITY_ALERT_TYPES = new Set([
  "AIR_QUALITY_CAUTION",
  "AIR_QUALITY_DANGER",
]);

function timestampOf(value) {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function isRelatedAlert(event, alert) {
  if (alert.related_event_id) return alert.related_event_id === event.event_id;
  if (event.device_id && alert.device_id && event.device_id !== alert.device_id) {
    return false;
  }
  if (!AIR_QUALITY_ALERT_TYPES.has(alert.type)) return false;

  const timeDifference = Math.abs(
    timestampOf(event.started_at) - timestampOf(alert.created_at),
  );
  const sameSeverity = alert.severity === event.to_state;
  const sameReason = Boolean(
    event.reason_message && alert.message && event.reason_message === alert.message,
  );
  return timeDifference <= 5000 && (sameSeverity || sameReason);
}

function stateActivity(event, relatedAlert) {
  return {
    activity_id: relatedAlert
      ? `state:${event.event_id}+alert:${relatedAlert.alert_id}`
      : `state:${event.event_id}`,
    categories: relatedAlert
      ? [ACTIVITY_FILTERS.STATE_CHANGE, ACTIVITY_FILTERS.ALERT]
      : [ACTIVITY_FILTERS.STATE_CHANGE],
    occurred_at: event.started_at,
    severity: event.to_state,
    title: `${event.from_state} → ${event.to_state}`,
    message: event.reason_message,
    from_state: event.from_state,
    co2: event.co2,
    pm2_5: event.pm2_5,
    alert_type: relatedAlert?.type ?? null,
    acknowledged: relatedAlert?.acknowledged ?? null,
  };
}

function alertActivity(alert) {
  return {
    activity_id: `alert:${alert.alert_id}`,
    categories: [ACTIVITY_FILTERS.ALERT],
    occurred_at: alert.created_at,
    severity: alert.severity,
    title: alert.type,
    message: alert.message,
    from_state: null,
    co2: null,
    pm2_5: null,
    alert_type: alert.type,
    acknowledged: alert.acknowledged,
  };
}

export function createDashboardActivities(events = [], alerts = [], limit = 20) {
  const matchedAlertIds = new Set();
  const activities = events.map((event) => {
    const relatedAlert = alerts.find(
      (alert) =>
        !matchedAlertIds.has(alert.alert_id) && isRelatedAlert(event, alert),
    );
    if (relatedAlert) matchedAlertIds.add(relatedAlert.alert_id);
    return stateActivity(event, relatedAlert);
  });

  alerts.forEach((alert) => {
    if (!matchedAlertIds.has(alert.alert_id)) activities.push(alertActivity(alert));
  });

  return activities
    .sort((left, right) => timestampOf(right.occurred_at) - timestampOf(left.occurred_at))
    .slice(0, Math.max(0, limit));
}

export function filterDashboardActivities(activities, filter) {
  if (filter === ACTIVITY_FILTERS.ALL) return activities;
  return activities.filter((activity) => activity.categories.includes(filter));
}
