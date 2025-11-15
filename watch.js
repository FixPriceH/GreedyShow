// watch.js
(() => {
  const urlPack = localStorage.getItem('greedy_selected_pack');
  const adsTarget = urlPack ? Number(urlPack) : 0;
  const reward = adsTarget===100?2:adsTarget===200?4:adsTarget===300?6:0;

  const viewedEl = document.getElementById('viewed-count');
  const targetEl = document.getElementById('target-count');
  const rewardEl = document.getElementById('reward-amount');
  const playBtn = document.getElementById('play-ad');
  const adTimer = document.getElementById('ad-timer');
  const adPlaceholder = document.getElementById('ad-placeholder');
  const back = document.getElementById('back');

  let viewed = Number(localStorage.getItem('greedy_viewed_' + adsTarget) || 0);

  viewedEl.textContent = viewed;
  targetEl.textContent = adsTarget;
  rewardEl.textContent = reward;

  back.addEventListener('click', ()=>{ window.location.href = 'index.html'; });

  function formatTime(s){
    const mm = String(Math.floor(s/60)).padStart(2,'0');
    const ss = String(s%60).padStart(2,'0');
    return mm+':' + ss;
  }

  playBtn.addEventListener('click', ()=>{
    if (!adsTarget) return alert('Нет выбранного пакета');
    // симулируем проигрывание рекламы — таймер 5–8 сек
    playBtn.disabled = true;
    adPlaceholder.textContent = '▶ Реклама проигрывается...';
    let seconds = 6 + Math.floor(Math.random()*3);
    adTimer.textContent = formatTime(seconds);

    const t = setInterval(()=>{
      seconds--;
      adTimer.textContent = formatTime(seconds);
      if (seconds<=0){
        clearInterval(t);
        // окончание рекламы
        adPlaceholder.textContent = '🔔 Реклама завершена';
        playBtn.disabled = false;

        viewed += 1;
        localStorage.setItem('greedy_viewed_' + adsTarget, String(viewed));
        viewedEl.textContent = viewed;

        // если достигнут целевой размер — начисляем
        if (viewed >= adsTarget){
          // начислить и показать анимацию
          const prevBalance = Number(localStorage.getItem('greedy_balance') || 0);
          const newBal = prevBalance + reward;
          localStorage.setItem('greedy_balance', String(newBal));

          // сброс просмотров для этого пакета чтобы не дублировать
          localStorage.removeItem('greedy_viewed_' + adsTarget);

          // уведомление
          showCongrats(reward);
        }
      }
    },1000);
  });

  function showCongrats(amount){
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `🎉 Вы заработали <strong>${amount} TON</strong>! Баланс обновлён.`;
    document.body.appendChild(el);
    setTimeout(()=>{ el.classList.add('visible'); },20);
    setTimeout(()=>{ el.classList.remove('visible'); setTimeout(()=>el.remove(),300); window.location.href='wallet.html'; },3500);
  }

})();