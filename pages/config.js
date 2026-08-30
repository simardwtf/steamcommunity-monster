(() => {
  const localHost = ['localhost', '127.0.0.1'].includes(location.hostname);
  window.MONSTER_CONFIG = {
    apiBase: localHost ? `http://${location.hostname}:8787` : 'https://api.steamcommunity.monster'
  };
})();
