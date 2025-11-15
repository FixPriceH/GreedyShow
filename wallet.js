// wallet.js
(() => {
  const attachBtn = document.getElementById('attach-wallet');
  const detachBtn = document.getElementById('detach-wallet');
  const withdrawBtn = document.getElementById('withdraw');
  const balEl = document.getElementById('balance-amount');

  function refresh(){
    const bal = Number(localStorage.getItem('greedy_balance') || 0);
    balEl.textContent = bal;
    if (bal>0){ withdrawBtn.disabled = false; } else { withdrawBtn.disabled = true }

    const linked = localStorage.getItem('greedy_wallet_linked');
    if (linked){ detachBtn.disabled = false; attachBtn.disabled = true; }
    else { detachBtn.disabled = true; attachBtn.disabled = false; }
  }

  attachBtn.addEventListener('click', ()=>{
    // заглушка выбора провайдера
    const choice = prompt('Выберите кошелёк: 1 - Tonkeeper, 2 - Другой (введите цифру)');
    if (choice===null) return;
    const provider = choice==='1' ? 'Tonkeeper' : 'Other';
    localStorage.setItem('greedy_wallet_linked', provider);
    alert(provider + ' привязан (заглушка)');
    refresh();
  });

  detachBtn.addEventListener('click', ()=>{
    localStorage.removeItem('greedy_wallet_linked');
    alert('Кошелёк отвязан');
    refresh();
  });

  withdrawBtn.addEventListener('click', ()=>{
    // заглушка: выводит всё
    const bal = Number(localStorage.getItem('greedy_balance') || 0);
    if (!bal) return alert('Баланс пуст');
    // в реальности здесь вызвался бы backend / интеграция с TON
    localStorage.setItem('greedy_balance','0');
    alert(`Выведено ${bal} TON (заглушка)`);
    refresh();
  });

  document.getElementById('back').addEventListener('click', ()=>{ window.location.href='index.html'; });

  refresh();
})();