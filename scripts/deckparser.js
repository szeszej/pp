var deckList = `1x Animate Dead
1x Bedevil
1x Black Market
1x Blasphemous Act
1x Blood Crypt
1x Bloodstained Mire
1x Bojuka Bog
1x Braid of Fire
1x Burning Sands
1x Burnished Hart
1x Canyon Slough
1x Captivating Crew
1x Captive Audience
1x Chain Reaction
1x Chaos Warp
1x Citadel of Pain
1x Command Tower
1x Commander's Sphere
1x Crawlspace
1x Crown of Doom
1x Crystal Chimes
1x Curse of Disturbance
1x Curse of Opulence
1x Custodi Lich
1x Damnation
1x Demonic Tutor
1x Dragonskull Summit
1x Dread
1x Exsanguinate
1x Fellwar Stone
1x Forbidden Orchard
1x Forge of Heroes
1x Fumiko the Lowblood
1x Gilded Lotus
1x Goblin Spymaster
1x Gray Merchant of Asphodel
1x Heartstone
1x Hero's Downfall
1x Humble Defector
1x Hunted Dragon
1x Hunted Horror
1x Key to the City
1x Languish
1x Last One Standing
1x Lavaclaw Reaches
1x Luxury Suite
1x Mana Geyser
1x Marchesa's Decree
1x Mind Stone
1x Molten Slagheap
3x Mountain
1x Myriad Landscape
1x No Mercy
1x Opal Palace
1x Ophiomancer
1x Pain Magnification
1x Path of Ancestry
1x Pestilence
1x Phyrexian Arena
1x Phyrexian Scriptures
1x Polluted Delta
1x Pyrohemia
1x Rakdos Carnarium
1x Rakdos Charm
1x Rakdos Signet
1x Repercussion
1x Rite of the Raging Storm
1x Rocky Tar Pit
1x Rogue's Passage
1x Shinka, the Bloodsoaked Keep
1x Shizo, Death's Storehouse
1x Smoldering Marsh
1x Sol Ring
1x Solemn Simulacrum
5x Swamp
1x Talisman of Indulgence
1x Tectonic Edge
1x Temple of Malice
1x Terminate
1x Thran Dynamo
1x Throne of the High City
1x Torment of Hailfire
1x Tower of the Magistrate
1x Toxic Deluge
1x Treacherous Link
1x Urborg, Tomb of Yawgmoth
1x Vampiric Tutor
1x Vandalblast
1x Varchild's War-Riders
1x War's Toll
1x Wayfarer's Bauble
1x Westvale Abbey
1x Wooded Foothills
1x Xantcha, Sleeper Agent *CMDR*`;

matchLines = /.+/g;
// cardNumber = /^\d+/;
cardName = /\s.+/;
commanderTest = /CMDR/;

var deckLines = deckList.match(matchLines).map(a => a.trim());
var cardNumbers = deckLines.map(a => parseInt(a));
var cardNames = deckLines
  .map(a => a.match(cardName))
  .flat()
  .map(a => a.trim());

var deck = [];

cardNumbers.map(function(item, index) {
  if (commanderTest.test(cardNames[index]) == true) {
    deck.push({
      quantity: item,
      name: cardNames[index].slice(0, -7),
      commander: true
    });
  } else {
    deck.push({
      quantity: item,
      name: cardNames[index],
      commander: false
    });
  }
});

console.log(deck);
