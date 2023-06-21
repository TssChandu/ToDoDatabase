const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const addDays = require("date-fns/addDays");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
//const result = addDays(new Date(2021, 0, 11), 10);

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

/*let date = "2021 - 1 - 21";
let dateArray = date.split("-");
let y = dateArray[0];
let m = dateArray[1];
let d = dateArray[2];
console.log(y);*/

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const isOnlyStatus = (status, priority, category, todo) => {
  if (
    status !== undefined &&
    priority === undefined &&
    category === undefined &&
    todo === undefined
  ) {
    return true;
  } else {
    return false;
  }
};
const isOnlyPriority = (status, priority, category, todo) => {
  if (
    status === undefined &&
    priority !== undefined &&
    category === undefined &&
    todo === undefined
  ) {
    return true;
  } else {
    return false;
  }
};
const isOnlyTodo = (status, priority, category, todo) => {
  if (
    status === undefined &&
    priority === undefined &&
    category === undefined &&
    todo !== undefined
  ) {
    return true;
  } else {
    return false;
  }
};
function isPriorityAndStatus(status, priority, category, todo) {
  if (
    status !== undefined &&
    priority !== undefined &&
    category === undefined &&
    todo === undefined
  ) {
    return true;
  } else {
    return false;
  }
}
function isOnlySearchQuery(status, priority, category, todo, search_q) {
  if (
    status === undefined &&
    priority === undefined &&
    category === undefined &&
    todo === undefined &&
    search_q !== undefined
  ) {
    return true;
  } else {
    return false;
  }
}
function isCategoryAndStatus(status, priority, category, todo) {
  if (
    status !== undefined &&
    priority === undefined &&
    category !== undefined &&
    todo === undefined
  ) {
    return true;
  } else {
    return false;
  }
}
function isOnlyCategory(status, priority, category, todo) {
  if (
    status === undefined &&
    priority === undefined &&
    category !== undefined &&
    todo === undefined
  ) {
    return true;
  } else {
    return false;
  }
}
function isCategoryAndPriority(status, priority, category, todo) {
  if (
    status === undefined &&
    priority !== undefined &&
    category !== undefined &&
    todo === undefined
  ) {
    return true;
  } else {
    return false;
  }
}
// API1 GET todos

app.get("/todos/", async (request, response) => {
  const { status, priority, category, todo, search_q } = request.query;
  if (isOnlyStatus(status, priority, category, todo)) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      const getStatusQuery = `
        SELECT id,todo,priority,status,category,due_date AS dueDate
        FROM todo
        WHERE 
        status = '${status}'`;
      const statusArray = await db.all(getStatusQuery);
      response.send(statusArray);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (isOnlyPriority(status, priority, category, todo)) {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      const getPriorityQuery = `
            SELECT id,todo,priority,status,category,due_date AS dueDate
            FROM todo
            WHERE 
            priority = '${priority}'`;
      const priorityArray = await db.all(getPriorityQuery);
      response.send(priorityArray);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (isPriorityAndStatus(status, priority, category, todo)) {
    const hasPriority =
      priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";
    const hasStatus =
      status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
    if (hasPriority && hasStatus) {
      const getQuery = `
            SELECT id,todo,priority,status,category,due_date AS dueDate
            FROM todo
            WHERE 
            priority = '${priority}' AND status = '${status}'`;
      const priorityAndStatusArray = await db.all(getQuery);
      response.send(priorityAndStatusArray);
    } else {
      if (hasPriority && !hasStatus) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    }
  } else if (isOnlySearchQuery(status, priority, category, todo, search_q)) {
    const searchQuery = `
      SELECT id,todo,priority,status,category,due_date AS dueDate 
      FROM todo
      WHERE 
      todo LIKE '%${search_q}%';`;
    const searchQueryArray = await db.all(searchQuery);
    response.send(searchQueryArray);
    console.log(search_q);
  } else if (isCategoryAndStatus(status, priority, category, todo)) {
    const hasCategory =
      category === "WORK" || category === "HOME" || category === "LEARNING";
    const hasStatus =
      status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
    if (hasCategory && hasStatus) {
      const getQuery = `
            SELECT id,todo,priority,status,category,due_date AS dueDate
            FROM todo
            WHERE 
            category = '${category}' AND status = '${status}'`;
      const categoryAndStatusArray = await db.all(getQuery);
      response.send(categoryAndStatusArray);
    } else {
      if (hasCategory && !hasStatus) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    }
  } else if (isOnlyCategory(status, priority, category, todo)) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      const getQuery = `
            SELECT id,todo,priority,status,category,due_date AS dueDate
            FROM todo
            WHERE 
            category = '${category}'`;
      const categoryArray = await db.all(getQuery);
      response.send(categoryArray);
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (isCategoryAndPriority(status, priority, category, todo)) {
    const hasCategory =
      category === "WORK" || category === "HOME" || category === "LEARNING";
    const hasPriority =
      priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";
    if (hasCategory && hasPriority) {
      const getQuery = `
            SELECT id,todo,priority,status,category,due_date AS dueDate
            FROM todo
            WHERE 
            category = '${category}' AND priority = '${priority}'`;
      const categoryAndPriorityArray = await db.all(getQuery);
      response.send(categoryAndPriorityArray);
    } else {
      if (hasCategory && !hasPriority) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    }
  }
});
// API2 GET a specific todo
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `
    SELECT id,todo,priority,status,category,due_date AS dueDate
    FROM todo
    WHERE 
    id = ${todoId};`;
  const toDo = await db.get(getQuery);
  response.send(toDo);
});
// API3 GET all todos with a specific due date
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isValid(new Date(date))) {
    let dateArray = date.split("-");
    let y = dateArray[0];
    let m = dateArray[1];
    let d = dateArray[2];
    const formatDate = format(new Date(y, parseInt(m) - 1, d), "yyyy-MM-dd");

    const getQuery = `
  SELECT id,todo,priority,status,category,due_date AS dueDate
  FROM todo
  WHERE 
  due_date = '${formatDate}';`;
    const todoArray = await db.all(getQuery);
    if (todoArray.length !== 0) {
      response.send(todoArray);
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});
// API4 POST a todo
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const isValidStatus =
    status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
  const isValidPriority =
    priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";
  const isValidCategory =
    category === "WORK" || category === "HOME" || category === "LEARNING";
  const isValidDuedate = isValid(new Date(dueDate));
  if (isValidStatus && isValidPriority && isValidCategory && isValidDuedate) {
    const postQuery = `
    INSERT INTO 
    todo(id,todo,priority,status,category,due_date)
    VALUES (${id},'${todo}','${priority}','${status}','${category}','${dueDate}');`;
    await db.run(postQuery);
    response.send("Todo Successfully Added");
    console.log(typeof dueDate);
  } else if (!isValidStatus) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (!isValidCategory) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (!isValidPriority) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (!isValidDuedate) {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

// API5 PUT (update) a todo
app.put("/todos/:todoId/", async (request, response) => {
  const { status, priority, category, todo, dueDate } = request.body;
  const { todoId } = request.params;
  const isValidDuedate = isValid(new Date(dueDate));
  if (isOnlyStatus(status, priority, category, todo)) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      const updateStatusQuery = `
        UPDATE
            todo
        SET
            status = '${status}'
        WHERE
            id = ${todoId};`;
      await db.run(updateStatusQuery);
      response.send("Status Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (isOnlyPriority(status, priority, category, todo)) {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      const updateQuery = `
        UPDATE
            todo
        SET
            priority = '${priority}'
        WHERE
            id = ${todoId};`;
      await db.run(updateQuery);
      response.send("Priority Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (isOnlyTodo(status, priority, category, todo)) {
    const updateQuery = `
        UPDATE
            todo
        SET
            todo = '${todo}'
        WHERE
            id = ${todoId};`;
    await db.run(updateQuery);
    response.send("Todo Updated");
  } else if (isOnlyCategory(status, priority, category, todo)) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      const updateQuery = `
        UPDATE
            todo
        SET
            category = '${category}'
        WHERE
            id = ${todoId};`;
      await db.run(updateQuery);
      response.send("Category Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (isValidDuedate) {
    const updateQuery = `
        UPDATE
            todo
        SET
            due_date = '${dueDate}'
        WHERE
            id = ${todoId};`;
    await db.run(updateQuery);
    response.send("Due Date Updated");
  } else if (!isValidDuedate) {
    response.status(400);
    response.send("Invalid Due Date");
  }
});
// API6 DELETE a todo
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM 
    todo
    WHERE 
        id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
