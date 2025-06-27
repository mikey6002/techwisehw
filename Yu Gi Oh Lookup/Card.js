async function getCardInfo(cardName) {
  const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(cardName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.data; 
}

getCardInfo("Dark Magician")
  .then(cards => {
    console.log(cards[0].name, cards[0].type, cards[0].atk, cards[0].def);
  })
  .catch(err => console.error(err));

async function getRandomCard() {
  const res = await fetch("https://db.ygoprodeck.com/api/v7/randomcard.php");
  return res.json();
}

getRandomCard()
  .then(cardObj => console.log(cardObj.data.name))
  .catch(console.error);

