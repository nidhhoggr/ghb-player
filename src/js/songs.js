const tempo = 80;
const transposition = 0;
const tuning = "E/A";

export default [
  {
    name: "Konvulsionslaaten",
    tempo: 70,
    transposition: 1,
    tuning,
    abc: "X:0\n" +
      "T:Konvulsionslaaten\n" + 
      "C:Anders (Stake) Norudde\n" +
      "Z:Bart Brashers, bart@hpcc.epa.gov\n" +
      "K:Ddor\n" +
      "   DEFD E2E(D | D)EFD E4    | DEFG A2GF | EFE2 D4 :|\n" +
      "|: cAcA c2A(B | B)GBG B2G(c | c)Ac d2 cB2 | ABc d2 ddd |\n" +
      "   dcB A2 F2c | cBA G2 E2E | DEFG A2GF | EFE2 D4 :|\n"
  },
  {
    name: "Tyskan (needs work)",
    tempo: 120,
    transposition,
    tuning,
    abc: "X:0\n" +
      "T: Tyska polskan\n" +
      "T: (schottis)\n" +
      "R: Schottis\n" +
      "O: R ttvik, Dalarna\n" +
      "S: utl rd av Cajsa Ekstav p¡ Ekebyholmskursen 2010 som hade den efter Johan Nylander och Bj¢rn St¡bi [[ ]]\n" +
      "Z: Nils L\n" +
      "N: Ingen garanti f¢r att bindningarna  r helt r tt.\n" +
      "N: YouTube-klipp med Bj¢rn St¡bi and Per Gudmundson.\n" +
      "M: 2/4\n" +
      "K:Am transpose=-5\n" +
      "A |: \"D\"vd>(c d>)(e | f>)(g f>)(e | \"G\"d>)(c (3d)(cB) | \"D\"uA3 (d | \"G\"B>)(G B>)(d | \"A\"c>)(A c>)(e | \"D\"d>)(c d>)(e | d>)e f2 |\n" +
      " ud>uc vd>(e | f>)(g f>)(e | \"G\"d>)(c (3d)(cB) | \"D\"uA3 (d | \"G\"B>)(G B>)(d | \"A\"c>)(A c>)e | \"D\"d2 f2 | d4 ::\n" +
      " \"A\"ve>c A>c | e3 (c | \"D\"d>)(c d>)e | f4 | \"G\"ug>(a g>)e | \"A\"{/e}c2 c2 | \"D\"va>b a>f | {/f}d2 d2 |\n" +
      " \"A\"ve>c A>c | e3 (c | \"D\"d>)(c d>)e | f4 | \"G\"ug>(a g>)e | \"A\"c>(A B>)c | \"D\"ud2 f2 | !fine!d2 A2 :|\n"
  },
  {
    name: "Lördagsvisa",
    tempo,
    transposition,
    tuning,
    abc: "X:0\n" +
      "T:Lördagsvisa\n" +
      "T:(Sv. L. Sm. 177, 50 Sm. låtar nr 40)\n" +
      "M:C|\n" +
      "K:Am transpose=-5\n" +
      "(AB)|:\"Am\"c2 (dc) \"Dm\"B2 (B^G)|\"Am\"A4 (A3 c)|\"Em\"e2 (ec) \"Dm\"d2 (df)|\"G7\"a2 (ag) \"Am\"e2 (AB)|\n" +
      "c2 (dc) \"Dm\"B2 (B^G)|\"Am\"A4 (A3 c)|\"Em\"e2 (gf) \"Dm\"d2 (ag)|[1 \"Am\"e4 z2 (AB):|[2 \"Am\"e4  z2 (cd)|]\n" +
      "|:\"Am\"e2 aa a2 a2|\"Em\"g4 e4|\"Dm\"(gf) (df) \"G7\"a2 g2|\"Am\"e4 c4|\n" +
      "\"Dm\".d2 .d2 d4|\"Am\".e2 .e2 e4|c2 (dc) \"E7\"B2 ^G2|[1 \"Am\"A4 z2 (cd):|[2\"Am\"A6 z2 |]"
  },
  {
    name: "Langdans fran Solleron",
    tempo,
    transposition,
    tuning,
    abc: "X:0\n" +
    "C:Långdans från Sollerön\n" +
    "M:3/4\n" +
    "K:Am\n" +
    "\"E:7\"E2 ^G2 A2 | B3d c2 | A2 cB A^G | A3^G E2 | E2 ^G2 A2 | B3d c2 | A2 cB A^G |\n" +
    "A6 | E2 ^G2 A2 | B3d c2 | A2 cB A^G | A3^G E2 | E2 ^G2 A2 | B3d c2 |\n" +
    "A2 cB A^G | A6 | e2 d2 B2 | d3B c2 | c2 e2 d2 | B2 dB c2 | A2 cB A^G |\n" +
    "A6 | e2 d2 B2 | d3B c2 | c2 e2 d2 | B2 dB c2 | A2 cB A^G | A6 |\n" +
    "z6 |\n"
  },
  {
    name: "Steklåt från Särna",
    tempo,
    transposition,
    tuning,
    abc: "X:0\n" +
    "C:Steklåt från Särna\n" +
    "M:4/4\n" +
    "K:Am\n" +
    "\"E:7\"E2 A2 c2 e2 | B2 cd e3d | c2 BA B2 ^G2 | E8 | E2 A2 c2 e2 | B2 cd e3d | c2 BA B2 ^G2 |\n" +
    "A8 | \"E:7\"E2 A2 c2 e2 | B2 cd e3d | c2 BA B2 ^G2 | E8 |\n" +
    "E2 A2 c2 e2 | B2 cd e3d | c2 BA B2 ^G2 | A6 B2 | c3B c2 e2 | B6 ^G2 |\n" +
    "A3^G A2 c2 | B6 Bd | c2 B2 A2 ce | d2 B2 ^G2 Bd | c2 BA B2 ^G2 | A6 B2 |\n" +
    "c3B c2 e2 | B6 ^G2 | A3^G A2 c2 | B6 Bd | c2 B2 A2 ce | d2 B2 ^G2 Bd |\n" +
    "c2 BA B2 ^G2 | A8 | z8 |\n"
  },
  {
    name: "Jag blåste i min pipa",
    tempo,
    transposition,
    tuning,
    abc: "X:0\n" +
    "C:Jag blåste i min pipa\n" +
    "M:4/4\n" +
    "K:Am\n" +
    "\"E:7\"E2 A3B A2 | ^G2 E4 E2 | z2 c4 B2 | c2 d6 | c2 B3c B2 | A2 ^G2 A2 B2 |\n" +
    "A2 A3^G E2 | E2 c4 c2 | B2 B3A ^G2 | B2 d2 d2 c2 |: B2 A3^G E2 | E2 c4 B2 |\n" +
    "zA ^G3B e2 | ^G2 A6 | A2 A3^G E2 | E2 c4 c2 | B2 B3A ^G2 | B2 d2 d2 c2 :|\n" +
    "B2 A3^G E2 | E2 c4 B2 | zA ^G3B e2 | ^G2 A6 | B2 c2 cB c2 | cB c2 e2 e2 |\n" +
    "zd B2 BA B2 | BA B2 d2 d2 | zc A3^G E2 | E2 c4 B2 | zA ^G3B e2 | ^G2 A6 |\n" +
    "B2 c2 cB c2 | cB c2 e2 e2 | zd B2 BA B2 | BA B2 d2 d2 | zc A3^G E2 | E2 c4 B2 |\n" +
    "zA ^G3B e2 | ^G2 A6 | z8 |"
  },
  {
    name: "Ljugaren",
    tempo,
    transposition,
    tuning,
    abc: "X:0\n" +
    "C:Ljugaren\n" +
    "M:4/4\n" +
    "K:Am\n" +
    "|:E2 A3B A2 | ^G2 E4 E2 | z2 c4 B2 | c2 d6 | c2 B3c B2 | A2 ^G2 A2 B2 | ^G2 A6 | z8 :|\n" +
    "|: B2 c4 B2 | c2 d4 c2 | d2 e6 | z2 A6 |\n" +
    "B2 c4 B2 | c2 d4 c2 | z2 B3c B2 | A2 B4 ^G2 |\n" +
    "E2 A3B A2 | ^G2 E4 E2 | z2 c4 B2 | c2 d6 | c2 B3c B2 | A2 ^G2 A2 B2 | ^G2 A6 | z8 :|\n"
  },
  {
    name: "Star Spangled Banner pt 1",
    tempo,
    transposition,
    tuning,
    abc: "T: Anachreon in Heaven  v.1\n" +
      "T: Star Spangled Banner\n" +
      "C: John Stafford Smith (1780)\n" +
      "P: piffero primo a0263\n" +
      "O: old guard\n" +
      "F: http://ancients.sudburymuster.org/mus/acn/pdf/fyf02F.pdf\n" +
      "Z: 2019 John Chambers <jc:trillian.mit.edu>\n" +
      "M: 3/4\n" +
      "K: D transpose=-2\n" +
      "A>F |\\\n" +
      "D2 F2 A2 | d3 zfe | d2 F2 ^G2 | A3 zA>A |\\\n" +
      "f3 e d2 | c3 zBc | d2 d2 A2 | F2 D2 :|\n" +
      "ff |\\\n" +
      "f2 g2 a2 | a4 gf | e2 f2 g2 | g3 zg2 |\\\n" +
      "f3 e d2 | c3 zBc | d2 F2 ^G2 | A3 zA2 ||\n" +
      "d2 d2 dc | B2 B2 B2 | e2 gfed | d2 Hc2 AA |\\\n" +
      "d3 efg | Ha4 de | f3 g e2 | Hd6 |]"
  },
  {
    name: "Star Spangled Banner pt 2",
    tempo,
    transposition,
    tuning,
    abc: "T: Anachreon in Heaven  v.1\n" +
      "T: Star Spangled Banner\n" +
      "M: 3/4\n" +
      "K: D transpose=-5\n" +
      "f2 g2 a2 | a4 gf | e2 f2 g2 | g3 zg2 |\\\n" +
      "f3 e d2 | c3 zBc | d2 F2 ^G2 | A3 zA2 ||\n" +
      "d2 d2 dc | B2 B2 B2 | e2 gfed | d2 Hc2 AA |\\\n" +
      "d3 efg | Ha4 de | f3 g e2 | Hd6 |]"
  },
  {
    name: "Valtrall",
    tempo: 40,
    transposition: 1,
    tuning,
    abc: "X:0\n" +
      "M:4/4\n" +
      "K:C\n" +
      "A8 | A3/2c/ _BB AF D3/2D/ | CE GE D4 | G_B dB A2 B/4A/4G/4Az/4 | d3/2c/ _B/A/B/d/ cA FA | \n" +
      "c3/2d/ _BA G4 | cA/c/ _B/A/G/B/ AF D3/2D/ | CE GE/4G/4E/ D4 |"
  },
  {
    name: "Trilltrall",
    tempo: 70,
    transposition: 1,
    tuning,
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
    tuning,
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
    tuning,
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
