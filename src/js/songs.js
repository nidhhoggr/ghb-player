const tempo = 80;
const transposition = 0;
const tuning = "E/A";

function getAbc(name) {
  const abc = require(`./../abc/${name}.abc`);
  console.log(abc);
  return abc;
}

const songs = [
  {
    name: "Konvulsionslaaten",
    tempo: 70,
    abc: getAbc("konvulsion"),
  },
  {
    name: "Tyskan (needs work)",
    tempo: 120,
    abc: getAbc("tyskan"),
  },
  {
    name: "Lördagsvisa",
    abc: getAbc("lordagsvisa")
  },
  {
    name: "Långdans från Sollerön",
    abc: getAbc("langdansFranSolleron")
  },
  {
    name: "Steklåt från Särna",
    abc: getAbc("steklat")
  },
  {
    name: "Jag blåste i min pipa",
    tempo: 100,
    abc: getAbc("jagblaste")
  },
  {
    name: "Ljugaren",
    tempo: 100,
    abc: getAbc("ljugaren")
  },
  {
    name: "Star Spangled Banner pt 1",
    tempo: 100,
    abc: getAbc("anachreon1")
  },
  {
    name: "Star Spangled Banner pt 2",
    abc: getAbc("anachreon2")
  },
  {
    name: "Star Spangled Banner v2 pt 1",
    abc: getAbc("anachreon3")
  },
  {
    name: "Star Spangled Banner v2 pt 2",
    abc: getAbc("anachreon4")
  },
  {
    name: "Valtrall",
    transposition: 1,
    abc: getAbc("valtrall")
  },
  {
    name: "Trilltrall",
    tempo: 70,
    transposition: 1,
    abc: "X:0\n" +
      "T:Trill Trall\n" +
      "F:http://richardrobinson.tunebook.org.uk/tune/5482\n" +
      "M:3/4\n" +
      "K:Bm\n" +
      "|: FF BB AF | GF GA B2 | FF BB AF | GA B4 :||\n" +
      "GF G4 | BA F4 | dc Bc dc | BA F4 | EF G4 | BA F2 E D | E6 ||\n" +
      "K:Am\n" +
      "|: EE AA GE | FE FG A2 | EE AA GE | FG A4 :||\n" +
      "FE F4 | AG E4 | cB AB cB | AG E4 | DE F4 | AG E2 D C | D6 ||\n" +
      "K:Gm\n" +
      "|: DD GG FD | ED EF G2 | DD GG FD | EF G4 :||\n" +
      "ED E4 | GF D4 | BA GA BA | GF D4 | CD E4 | GF D2 C B, | C6 ||"
  },
  {
    name: "Säckpipslåt från Norra Råda",
    tempo: 70,
    transposition: 1,
    abc: "X:0\n" +
      "T:Säckpipslåt från Norra Råda\n" +
      "O:Värmland\n" +
      "Z: Jimmy U, 2011-07-21\n" +
      "N: Spelbar på säckpipa i E med viss modifikation\n" +
      "M:4/4\n" +
      "K:Ddorisk\n" +
      "DE|F2EFD2EF|G2FGE2FG|A2BA GFEF|D2EDC2DE|\n" +
      "F2EFD2EF|G2FGE2FG|A2BA GFEF|D6:|]|:DF|\n" +
      "A2FA cBGB|BAced2dc|A2FA cBGB|BAAG FEFG|\n" +
      "A2FA cBGB|BAced2dc|A2BA GFEF|D6:|]\n"
  },
  {
    name: "Springlek (Malungslek, Norska)",
    tempo: 70,
    transposition: -4,
    abc: "X: 0\n" +
    "T:Springlek (Malungslek, JÃ¶sshÃ¤rspolska, Norska)\n" +
    "B:EÃ–, nr 296\n" +
    "S:efter ErkgÃ¤rds Mats Ersson\n" +
    "R:Springlek\n" +
    "O:GrimsÃ¥ker, Malungs sn, Dalarna\n" +
    "Z:Nils L\n" +
    "N:Till en annan renskrift har EÃ– skrivit kommentaren \"Egent. 1/2 + 2/4 takt\". Den renskriften har Ã¤ven ciss istÃ¤llet fÃ¶r c i fÃ¶rstareprisens tvÃ¥ sista takter.\n" +
    "L:1/8\n" +
    "M:3/4\n" +
    "K:Dm\n" +
    "A2- A>^c d>e | Pf>e f>g e>g | Pf>e d>^c d>f | e>d (3^cAc A2 |\n" +
    "A2- A>^c d>e | f>e f>g e>g | f>e d>c d>f | (3e(ce) d4 ::\n" +
    "%%tuplets 0 0 1\n" +
    "a2 ((3aba) g>a | Pf>e f>g e>g | f>e d>^c d>f | e>d (3^c(Ac) A2 |\n" +
    "a2 ((3aba) g>a | Pf>e fg  e>g | Pf>e d>^c d>f | (3ece [dD]4 :|"
  },
  {
    name: "30 Year Jig",
    tempo: 180,
    abc: "X: 0\n" +
      "T:30 Year Jig, The\n" +
      "M:6/8\n" +
      "L:1/8\n" +
      "C:Roger Tallroth\n" +
      "R:jig\n" +
      "D:John McCusker: Yella Hoose\n" +
      "Z:Devin McCabe\n" +
      "K:G\n" +
      "D|:EDE FEF|GBG D2D|EcB AGE|{F}G2A- AFD|\n" +
      "!EDE FEF|GBG D2D|EcB AGE|1F2G- GzD:|2F2G- Gz2|\n" +
      "!:~g3 agf|~g3 d(3B^cd|egf edc|BAG ABd|\n" +
      "!~g3 agf|~g3 d(3B^cd|egf edB-|Bgf edB|\n" +
      "!cBA ~B3|ced BAB|cBc eag|1f2g- gz2:|2f2g- gzD||"
  },
  {
    name: "Sarna gamla brudmarsch",
    tempo: 100,
    abc: getAbc("sarnaGamlaBrudmarsch")
  },
  {
    name: "LÂngt ner i SmÂland",
    abc: "X: 0\n" +
      "T:LÂngt ner i SmÂland\n" +
      "R:schottis\n" +
      "C:Roger Tallroth\n" +
      "Z:id:hn-schottis-21\n" +
      "M:C|\n" +
      "K:Ddor\n" +
      "D>AA>A A<BA2|G>BB>B B<cB2|d>ed>c A>Bc2|B>AG2 F4|\n" +
      "D>AA>A A<BA2|G>BB>B B<cB2|G2G2 F>GF>D|C2D2 D4:|\n" +
      "|:A>^FA2 B2d2|e>dc2 d4|A>^FA2 G>AB2|c>BG2 A4|\n" +
      "A>^FA2 B2d2|c>BG2 =F4|F2F2 E>FE>D|C2D2 D4:|"
  },
  {
    name: "E/A Chanter scale",
    tempo: 40,
    transposition,
    tuning: "E/A",
    abc: "X:0\n" +
      "T:E/A Chanter scale\n" +
      "M:C|\n" +
      "K:Am\n" +
      "| A, D E ^F G ^G A B C' ^C' D' E' |"
  },
  {
    name: "D/G Chanter scale",
    tempo: 40,
    transposition,
    tuning: "D/G",
    abc: "X:0\n" +
      "T:D/G Chanter scale\n" +
      "M:C|\n" +
      "K:Dm\n" +
      "| C D E F ^F G A _B =B C' ^C' D' |"
  },
  {
    name: "C/F Chanter scale",
    tempo: 40,
    transposition,
    tuning: "C/F",
    abc: "X:0\n" +
      "T:C/F Chanter scale\n" +
      "M:C|\n" +
      "K:Cm\n" +
      "| _B, C D _E =E F G _A =A _B =B C' |"
  }
];

//apply defaults
export default songs.map( song => ({
  tempo,
  transposition,
  tuning,
  ...song,
}));
