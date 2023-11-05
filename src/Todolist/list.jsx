import { useEffect, useState } from "react";
import { Getaxios } from "../config/axios.config";

const debounceDelay = 1000;
const Todolist = () => {
  const authToken = "234455kalsk";
  localStorage.setItem("token", authToken);
  const getTodolist = (search) => {
    return Getaxios.get("/todos", { params: { q: search } }).then((data) =>
      setTodos(data.data)
    );
  };
  const [todos, setTodos] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [search, setSearchTerm] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editedTaskContent, setEditedTaskContent] = useState("");
  //adding taskname
  const handleChange = (e) => {
    setTaskName(e.target.value);
  };
  //search function with delay
  let debounceTimer;
  const handleDebouncedSearch = (searchTerm) => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      getTodos(searchTerm);
    }, debounceDelay);
  };
  const searchsubmit = (e) => {
    const searchterm = e.target.value;
    setSearchTerm(searchterm);
    handleDebouncedSearch(searchterm);
  };

  //gettodos function
  const getTodos = async (search) => {
    try {
      await getTodolist(search);
    } catch (error) {
      console.log("error");
    }
  };
  //deleting the item
  const handleDelete = (id) => {
    Getaxios.delete(`todos/${id}`).then((data) => {
      if (data.status === 200) {
        getTodolist();
      }
    });
  };
  //completed
  const handleDone = (id) => {
    Getaxios.patch(`todos/${id}`, { isCompleted: true });
    getTodolist();
  };
  //editing the function
  const handleEdit = (id, currentContent) => {
    setEditingTask(id);
    setEditedTaskContent(currentContent);
  };
  const handleSaveEdit = (id) => {
    if (editedTaskContent !== "") {
      Getaxios.patch(`todos/${id}`, { taskName: editedTaskContent }).then(
        () => {
          getTodolist();
          setEditingTask(null); // Exit editing mode
        }
      );
    } else {
      setEditingTask(null); // Exit editing mode without saving if content is empty
    }
  };

  const handleSaveEditOnEnter = (id, e) => {
    if (e.key === "Enter") {
      handleSaveEdit(id);
    }
  };
  //adding todo
  const addTask = async (e) => {
    e.preventDefault();
    try {
      await Getaxios.post("/todos", {
        taskName,
        isCompleted: false,
      });
      getTodolist();
    } catch (error) {
      console.log("error");
    }
    setTaskName("");
  };

  useEffect(() => {
    getTodos(search);
  }, [search]);

  return (
    <div className="todolist">
      <div className="search" onChange={searchsubmit}>
        <input type="text" placeholder="Search ex: todo 1" />
      </div>
      <form className="addTask" onSubmit={addTask}>
        <input
          type="text"
          onChange={handleChange}
          placeholder="Add a task........"
        />
        <button className="addtask-btn">Add Task</button>
      </form>
      <div className="lists">
        {todos?.map((todo) => (
          <div
            key={todo.id}
            className={`list ${todo.isCompleted ? "completed" : ""}`}
          >
            {editingTask === todo.id ? ( // Check if the task is being edited
              <input
                style={{
                  padding: "1.3rem",
                  color: "white",
                  fontWeight: "600",
                  backgroundColor: "rgb(225, 199, 143)",
                  border: "0",
                }}
                type="text"
                value={editedTaskContent}
                onChange={(e) => setEditedTaskContent(e.target.value)}
                onKeyDown={(e) => handleSaveEditOnEnter(todo.id, e)}
              />
            ) : (
              <p>{todo.taskName}</p>
            )}

            <div className="span-btns">
              {!todo.isCompleted && (
                <span onClick={() => handleDone(todo.id)} title="completed">
                  ✓
                </span>
              )}
              <span
                className="delete-btn"
                onClick={() => handleDelete(todo.id)}
                title="delete"
              >
                x
              </span>
              <span
                className="edit-btn"
                onClick={() => handleEdit(todo.id)}
                title="edit"
              >
                ↻
              </span>
            </div>
          </div>
        ))}
        {!todos?.length && <h1>No Tasks</h1>}
        {todos.length > 0 && <p>you have {todos.length} task </p>}
      </div>
    </div>
  );
};

export default Todolist;
