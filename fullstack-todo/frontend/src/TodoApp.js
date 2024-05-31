// /frontend/src/TodoApp.js
import React, { useState, useEffect } from "react";
import icon from "./icon.png";
import add from "./add.png";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3000");

const TodoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const response = await axios.get("/fetchAllTasks");
    setTasks(response.data);
  };

  const addTask = () => {
    socket.emit("add", task);
    setTasks([...tasks, task]);
    setTask("");
  };

  return (
    <div className="todo-app">
      <div class="container-1">
        <img src={icon} alt="Note App Icon" />
        <span class="bold">Note App</span>
      </div>
      <div className="container-2">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="New Note..."
        />
        <button onClick={addTask}>
          <img src={add} alt="" />
          Add
        </button>
      </div>
        <p>Notes</p>

      <ul>
        {tasks.map((task, index) => (
          <li key={index}>{task}</li>
        ))}
      </ul>
    </div>
  );
};

export default TodoApp;
