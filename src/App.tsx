import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
	if (greetMsg) return setGreetMsg("");
    setGreetMsg(await invoke("start_ldk", { name: "LDK NODE" }));
  }

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>
      <button onClick={greet}>{greetMsg}</button>
    </div>
  );
}

export default App;
