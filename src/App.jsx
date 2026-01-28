import { useEffect, useState, useRef } from "react";

import "./App.css";

const API_URL =
  "https://raw.githubusercontent.com/tabatkins/wordle-list/main/words";

const color = {
  correctLetter: "#b59f3b",
  correctOrder: "#538d4e",
  notMatching: "#3a3a3c",
  added: "#121213",
};

function App() {
  const [state, setState] = useState(
    Array(6)
      .fill(0)
      .map(() => Array(5).fill("")),
  );
  const [showResult, setShowResult] = useState(false);
  const wordsRef = useRef();
  const wordRef = useRef();
  const [currIndex, setCurrIndex] = useState({
    i: 0,
    j: 0,
  });
  const [matchStaus, setMatchStatus] = useState("IN_PROGRESS");

  const stateRef = useRef(state);

  const fetchData = async () => {
    const data = await fetch(API_URL);
    const text = await data.text();

    let wordss = text.split("/n");
    wordss = wordss[0].split("\n");
    wordRef.current = wordss[Math.floor(wordss.length * Math.random())].toUpperCase();
    wordsRef.current = wordss;
  };

  const setLetter = (letter, i, j) => {
    setState((pre) => {
      const newArr = pre.map((arr, index) => {
        if (index !== i) return [...arr];
        else {
          arr[j] = letter;
          return [...arr];
        }
      });
      newArr[i][j] = letter;
      return newArr;
    });
  };

  const onKeyPress = (e) => {
    if (e.key === "Backspace") {
      setCurrIndex((pre) => {
        if (pre.j === 0) return pre;
        setLetter("", pre.i, pre.j - 1);
        return {
          i: pre.i,
          j: pre.j - 1,
        };
      });
    } else if (e.key === "Enter") {
      setCurrIndex((pre) => {
        if (pre.j !== 5) return pre;
        const word = stateRef.current[pre.i].join("").toLowerCase();
        
        
        if (word === wordRef.current.toLowerCase()) {
          setMatchStatus("WON");
        } else if (pre.i === 5) {
          setMatchStatus("LOST");
        }

        if (wordsRef.current.includes(word.toLowerCase())) {
          return {
            i: pre.i + 1,
            j: 0,
          };
        }

        return pre;
      });
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      setCurrIndex((pre) => {
        if (pre.j === 5) return pre;
        setLetter(e.key.toUpperCase(), pre.i, pre.j);
        return {
          ...pre,
          j: pre.j + 1,
        };
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (matchStaus === "IN_PROGRESS") {
      document.addEventListener("keydown", onKeyPress);
    } else if (matchStaus === "WON" || matchStaus === "LOST") {
      document.removeEventListener("keydown", onKeyPress);
    }
    return () => document.removeEventListener("keydown", onKeyPress);
  }, [matchStaus]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return (
    <>
      <h2>Wrodle</h2>
      <div>
        {state.map((item, index) => {
          return (
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "10px",
              }}
              key={index}
            >
              {item.map((letter, innerIndex) => {
                return (
                  <div
                    style={{
                      display: "flex",
                      height: "50px",
                      width: "50px",
                      border: "1px solid white",
                      gap: "10px",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        index < currIndex.i
                          ? wordRef.current.includes(letter)
                            ? wordRef.current.indexOf(letter) === innerIndex
                              ? color?.correctOrder
                              : color?.correctLetter
                            : color?.notMatching
                          : color?.added,
                      fontSize: "32px",
                      fontWeight: "700",
                    }}
                    key={innerIndex}
                  >
                    {state[index][innerIndex]}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <button style={{
        border: "1px solid white",
        borderRadius: "20px",
        padding: "8px",
        marginTop: "20px",
        width: "240px",
        fontSize: "14px"
      }} onClick={() => setShowResult(!showResult)}>{showResult ? "Hide Result" : "See Result"}</button>
      {showResult ? <p>{wordRef.current}</p> : null}
    </>
  );
}

export default App;
