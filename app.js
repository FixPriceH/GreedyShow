// app.js — общая логика главной страницы
(() => {
  const tg = window.Telegram && window.Telegram.WebApp;
  if (tg) { try { tg.expand(); } catch(e){} }

  const packBtns = document.querySelectorAll('.pack-btn');
  const selectedPackEl = document.getElementById('selected-pack');
  const selectedRewardEl = document.getElementById('selected-reward');
  const previewText = document.getElementById('preview-text');
  const watchBtn = document.getElementById('watch-btn');
  const changeBtn = document.getElementById('change-pack');
  const openWallet = document.getElementById('open-wallet');

  let selected = null;

  function calcReward(ads){
    if (ads===100) return 2;
    if (ads===200) return 4;
    if (ads===300) return 6;
    return 0;
  }

  packBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const ads = Number(btn.dataset.ads);
      selected = ads;
      selectedPackEl.textContent = ads + ' реклам';
      selectedRewardEl.textContent = calcReward(ads) + ' TON';
      previewText.textContent = `Ты будешь смотреть ${ads} реклам. По завершении пакета получишь ${calcReward(ads)} TON.`;
      watchBtn.disabled = false;
      changeBtn.disabled = false;
      // анимация
      btn.animate([{transform:'translateY(0)'},{transform:'translateY(-6px)'}],{duration:220,fill:'forwards'});
    });
  });

  watchBtn.addEventListener('click', ()=>{
    if (!selected) return alert('Выберите пакет слева');
    // сохраняем выбор и уходим на страницу просмотра
    localStorage.setItem('greedy_selected_pack', String(selected));
    window.location.href = 'watch.html';
  });

  changeBtn.addEventListener('click', ()=>{
    // просто сброс выбора
    selected = null;
    selectedPackEl.textContent = '—';
    selectedRewardEl.textContent = '—';
    previewText.textContent = 'Выберите пакет слева, чтобы начать.';
    watchBtn.disabled = true;
    changeBtn.disabled = true;
  });

  openWallet.addEventListener('click', ()=>{
    window.location.href = 'wallet.html';
  });

  // restore previous selection when back
  const prev = localStorage.getItem('greedy_selected_pack');
  if (prev){
    const p = Number(prev);
    selected = p;
    selectedPackEl.textContent = p + ' реклам';
    selectedRewardEl.textContent = calcReward(p) + ' TON';
    previewText.textContent = `Возврат к выбранному пакету: ${p} реклам`;
    watchBtn.disabled = false;
    changeBtn.disabled = false;
  }
})();