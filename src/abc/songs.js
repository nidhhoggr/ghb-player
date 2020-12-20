export const tempo = 80;
export const transposition = 0;
export const tuning = "E/A";


//everything here loads AFTER the abc files
const songs = [
  {
    name: "Tyskan (needs work)",
    tempo: 120,
    abc: "tyskan"
  },
  {
    name: "Jag blåste i min pipa",
    tempo: 100,
    abc: "jagblaste"
  },
  {
    name: "Valtrall",
    transposition: 1,
    abc: "valtrall"
  },
  {
    name: "E/A Chanter scale",
    tempo: 40,
    transposition,
    tuning: "E/A",
    abc: "eaChanterScale"
  },
  {
    name: "D/G Chanter scale",
    tempo: 40,
    transposition,
    tuning: "D/G",
    abc: "dgChanterScale"
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
]

export default songs;
