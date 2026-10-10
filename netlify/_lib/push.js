/* ============================================================
   Browser push delivery (used when the admin sends a message).
   Best effort: invalid/expired subscriptions (404/410) are
   reported back so the caller can prune them.
   ============================================================ */

const webpush = require('web-push');

async function broadcast(settings, pushes, payloadJSON) {
  webpush.setVapidDetails(
    'mailto:admin@greenhill.ac.ke',
    settings.vapid.publicKey,
    settings.vapid.privateKey
  );
  const stats = { delivered: 0, failed: 0, total: pushes.length };
  const dead = [];
  await Promise.all(pushes.map(async (p) => {
    try {
      await webpush.sendNotification(p.subscription, payloadJSON);
      stats.delivered += 1;
    } catch (err) {
      stats.failed += 1;
      if (err && (err.statusCode === 404 || err.statusCode === 410)) dead.push(p.id);
    }
  }));
  return { stats, dead };
}

module.exports = { broadcast };
