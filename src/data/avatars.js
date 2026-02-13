/**
 * Ready Player Me avatar IDs per scenario.
 * Each character should be dressed for the location – create one avatar per scenario
 * at https://readyplayer.me/avatar with the right outfit, then paste the avatar ID here.
 *
 * Suggested outfits:
 *   cafe        – barista / casual (apron, casual)
 *   interview   – professional (suit, business)
 *   airport     – uniform (agent / security style)
 *   doctor      – white coat / medical
 *   shopping    – shop assistant (smart casual)
 *   dating      – casual / date-appropriate
 *   hotel       – receptionist (smart)
 *   restaurant  – waiter (shirt, optional apron)
 *   taxi        – driver (casual)
 *
 * Format: https://models.readyplayer.me/{avatarId}.glb
 */
const RPM_BASE = 'https://models.readyplayer.me';

const AVATAR_IDS = {
  cafe: '65a8dba831b23abb4f401bae',
  interview: '65a8dba831b23abb4f401bae',
  airport: '65a8dba831b23abb4f401bae',
  doctor: '65a8dba831b23abb4f401bae',
  shopping: '65a8dba831b23abb4f401bae',
  dating: '65a8dba831b23abb4f401bae',
  hotel: '65a8dba831b23abb4f401bae',
  restaurant: '65a8dba831b23abb4f401bae',
  taxi: '65a8dba831b23abb4f401bae',
};

const DEFAULT_AVATAR_ID = '65a8dba831b23abb4f401bae';

const GLB_PARAMS = 'quality=medium&textureAtlas=1024';

export function getAvatarUrl(scenarioId) {
  const id = AVATAR_IDS[scenarioId] ?? DEFAULT_AVATAR_ID;
  return `${RPM_BASE}/${id}.glb?${GLB_PARAMS}`;
}

export function getAvatarUrls() {
  return Object.fromEntries(
    Object.keys(AVATAR_IDS).map((id) => [id, getAvatarUrl(id)])
  );
}

/** Outfit / role description per scenario (for UI or prompts). */
export const AVATAR_OUTFITS = {
  cafe: 'Barista / casual (apron)',
  interview: 'Professional (suit)',
  airport: 'Uniform (agent)',
  doctor: 'Medical (white coat)',
  shopping: 'Shop assistant',
  dating: 'Casual / date',
  hotel: 'Receptionist',
  restaurant: 'Waiter',
  taxi: 'Driver',
};
