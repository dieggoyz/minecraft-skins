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
};

const skinView = (skin) => {
  const skinViewer = new skinview3d.SkinViewer({
    canvas: document.getElementById('skin_viewer'),
    width: 300,
    height: 400,
    skin: skin,
  });

  skinViewer.animation = new skinview3d.WalkingAnimation();

  const toggleWalkButton = document.getElementById('toggle_animation');
  const toggleRotationButton = document.getElementById('toggle_rotation');
  const speedInput = document.getElementById('animation_speed');
  const speedLabel = document.querySelector("label[for='animation_speed']");

  const icons = {
    play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6"><path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" /></svg>',
    pause:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6"><path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clip-rule="evenodd" /></svg>',
  };

  toggleWalkButton.innerHTML = icons.pause;

  toggleWalkButton.addEventListener('click', () => {
    skinViewer.animation.paused = !skinViewer.animation.paused;
    toggleWalkButton.innerHTML = skinViewer.animation.paused
      ? icons.play
      : icons.pause;
  });

  toggleRotationButton.addEventListener('click', () => {
    skinViewer.autoRotate = !skinViewer.autoRotate;
  });

  speedInput.addEventListener('input', (e) => {
    skinViewer.animation.speed = e.target.value;
    speedLabel.innerText = `Animation speed: ${e.target.value}x`;
  });
};

const getID = async (username) => {
  try {
    const response = await fetch(`${APIS.PLAYER_ID}${username}`);
    const data = await response.json();
    return data.success ? data.data.player.raw_id : null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const throwError = () => {
  const toastLiveExample = document.getElementById('errorToast');
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
  toastBootstrap.show();
};

const downloadSkin = async (e) => {
  const url = e.target.dataset.url;
  const hash = url.split('/').pop();
  const imageSource = `${APIS.SKIN_RENDER}/skin/${hash}`;

  try {
    const image = await fetch(imageSource);
    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);

    const link = document.createElement('a');
    link.href = imageURL;
    link.download = `${DOM.playerName.innerText}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error(error);
  }
};

const updateDOM = (data) => {
  if (!data) return;

  const { profileId, profileName, textures } = data;
  const skinUrl = textures.SKIN.url;
  const hash = skinUrl.split('/').pop();

  DOM.playerName.innerText = profileName;
  DOM.playerUUID.innerText = `${profileId.slice(0, 8)}-${profileId.slice(
    8,
    12
  )}-${profileId.slice(12, 16)}-${profileId.slice(16, 20)}-${profileId.slice(
    20
  )}`;

  DOM.skinRender.src = `${APIS.SKIN_RENDER}/fullbody/${hash}`;
  DOM.avatarRender.src = `${APIS.SKIN_RENDER}/face/${hash}`;
  DOM.headRender.src = `${APIS.SKIN_RENDER}/headiso/${hash}`;
  DOM.favicon.href = `${APIS.SKIN_RENDER}/face/${hash}`;

  DOM.downloadSkinButton.dataset.url = skinUrl;
  DOM.applySkinButton.href = `https://www.minecraft.net/profile/skin/remote?url=${skinUrl}`;

  skinView(skinUrl);
};

const fetchData = async (username) => {
  if (username.length < 2 || username.length > 16) return;

  try {
    DOM.loading.style.display = 'block';
    const id = await getID(username);

    if (!id) {
      throwError();
      return;
    }

    const response = await fetch(`${APIS.PLAYER_PROFILE}${id}`);
    const data = await response.json();

    updateDOM(data.decoded);
  } catch (error) {
    console.error(error);
    throwError();
  } finally {
    DOM.loading.style.display = 'none';
  }
};

DOM.searchButton.addEventListener('click', async (e) => {
  e.preventDefault();
  fetchData(DOM.username.value);
});

DOM.downloadSkinButton.addEventListener('click', downloadSkin);

fetchData('dieggoyz');
