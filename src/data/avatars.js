/**
 * Ready Player Me avatar IDs per scenario.
 * Get your own avatar IDs at https://readyplayer.me/avatar
 * Format: https://models.readyplayer.me/{avatarId}.glb
 */
const RPM_BASE = 'https://models.readyplayer.me';

// Demo avatar IDs – replace with your own from Ready Player Me Avatar Creator
// Using one friendly professional avatar for all; you can assign different IDs per scenario
const AVATAR_IDS = {
  cafe: '65a8dba831b23abb4f401bae',       // Casual / barista style
  interview: '65a8dba831b23abb4f401bae',   // Professional
  airport: '65a8dba831b23abb4f401bae',   // Uniformed agent
  doctor: '65a8dba831b23abb4f401bae',
  shopping: '65a8dba831b23abb4f401bae',
  dating: '65a8dba831b23abb4f401bae',
  hotel: '65a8dba831b23abb4f401bae',
  restaurant: '65a8dba831b23abb4f401bae',
  taxi: '65a8dba831b23abb4f401bae',
};

const DEFAULT_AVATAR_ID = '65a8dba831b23abb4f401bae';

/** Query params for smaller file size and faster load */
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
