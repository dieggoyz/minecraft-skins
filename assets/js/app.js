const APIS = {
  PLAYER_ID: 'https://playerdb.co/api/player/minecraft/',
  PLAYER_PROFILE: 'https://api.minetools.eu/profile/',
  SKIN_RENDER: 'https://nmsr.nickac.dev',
};

const DOM = {
  username: document.getElementById('username'),
  searchButton: document.getElementById('search'),
  playerName: document.getElementById('player_name'),
  playerUUID: document.getElementById('player_uuid'),
  skinRender: document.getElementById('skin_render'),
  avatarRender: document.getElementById('avatar_render'),
  headRender: document.getElementById('head_render'),
  downloadSkinButton: document.getElementById('download_skin'),
  applySkinButton: document.getElementById('apply_skin'),
  loading: document.getElementById('loading'),
  favicon: document.getElementById('favicon'),
  placeholders: document.querySelectorAll('[data-placeholder]'),
  skinViewerCanvas: document.getElementById('skin_viewer'),
  toggleWalkButton: document.getElementById('toggle_animation'),
  toggleRotationButton: document.getElementById('toggle_rotation'),
  speedInput: document.getElementById('animation_speed'),
  speedLabel: document.querySelector("label[for='animation_speed']"),
  errorToast: document.getElementById('errorToast'),
};

const icons = {
  pause: '<i class="fa-solid fa-pause"></i>',
  play: '<i class="fa-solid fa-play"></i>',
};

const createSkinViewer = (skin, cape) => {
  const skinViewer = new skinview3d.SkinViewer({
    canvas: DOM.skinViewerCanvas,
    width: 250,
    height: 400,
    skin,
  });

  skinViewer.animation = new skinview3d.WalkingAnimation();
  if (cape) skinViewer.loadCape(cape);

  DOM.toggleWalkButton.innerHTML = icons.pause;

  DOM.toggleWalkButton.addEventListener('click', () => {
    skinViewer.animation.paused = !skinViewer.animation.paused;
    DOM.toggleWalkButton.innerHTML = skinViewer.animation.paused
      ? icons.play
      : icons.pause;
  });

  DOM.toggleRotationButton.addEventListener('click', () => {
    skinViewer.autoRotate = !skinViewer.autoRotate;
  });

  DOM.speedInput.addEventListener('input', (e) => {
    const speed = e.target.value;
    skinViewer.animation.speed = speed;
    DOM.speedLabel.innerText = `Animation speed: ${speed}x`;
  });

  return skinViewer;
};

const fetchJSON = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
};

const throwError = () => {
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(DOM.errorToast);
  toastBootstrap.show();
};

const downloadSkin = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobURL = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobURL;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download error:', error);
  }
};

const updateDOM = ({ profileId, profileName, textures }) => {
  const skinHash = textures.SKIN.url.split('/').pop();
  const capeUrl = textures.CAPE?.url;

  DOM.playerName.innerText = profileName;
  DOM.playerUUID.innerText = profileId.match(/.{1,8}/g).join('-');

  const skinPaths = {
    skin: `${APIS.SKIN_RENDER}/fullbody/${skinHash}`,
    face: `${APIS.SKIN_RENDER}/face/${skinHash}`,
    head: `${APIS.SKIN_RENDER}/headiso/${skinHash}`,
  };

  DOM.skinRender.src = skinPaths.skin;
  DOM.avatarRender.src = skinPaths.face;
  DOM.headRender.src = skinPaths.head;
  DOM.favicon.href = skinPaths.face;

  DOM.downloadSkinButton.dataset.url = textures.SKIN.url;
  DOM.applySkinButton.href = `https://www.minecraft.net/profile/skin/remote?url=${textures.SKIN.url}`;

  createSkinViewer(textures.SKIN.url, capeUrl);
};

const togglePlaceholders = (state) => {
  DOM.placeholders.forEach((placeholder) => {
    placeholder.dataset.placeholder = state;
  });
};

const fetchPlayerData = async (username) => {
  if (username.length < 2 || username.length > 16) return;

  togglePlaceholders(true);
  DOM.loading.style.display = 'block';

  try {
    const playerId = await fetchJSON(`${APIS.PLAYER_ID}${username}`);
    if (!playerId?.success) {
      throwError();
      return;
    }

    const profileData = await fetchJSON(
      `${APIS.PLAYER_PROFILE}${playerId.data.player.raw_id}`
    );
    if (profileData) updateDOM(profileData.decoded);
  } catch (error) {
    console.error('Player data fetch error:', error);
    throwError();
  } finally {
    DOM.loading.style.display = 'none';
    togglePlaceholders(false);
  }
};

DOM.searchButton.addEventListener('click', (e) => {
  e.preventDefault();
  fetchPlayerData(DOM.username.value);
});

DOM.downloadSkinButton.addEventListener('click', (e) => {
  const url = e.target.dataset.url;
  const filename = DOM.playerName.innerText;
  downloadSkin(url, filename);
});

fetchPlayerData('dieggoyz');
