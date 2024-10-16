require("dotenv").config();
const express = require("express");
const app = express();
const PORT = 4500;

// Middleware to parse JSON request bodies
app.use(express.json());

app.use((req, res, next) => {
  const apiKey = req.headers["api_key"];
  if (apiKey && apiKey === process.env.API_KEY) {
    next();
  } else {
    res.status(403).send("Forbidden: Invalid API Key");
  }
});

// POST endpoint to sum two numbers
app.post("/sum", (req, res) => {
  const { arg_1, arg_2 } = req.body; // Extract arg_1 and arg_2 from the request body

  // Validate that both arguments are numbers
  if (typeof arg_1 !== "number" || typeof arg_2 !== "number") {
    return res.status(400).json({
      status: "error",
      message: "Both arg_1 and arg_2 must be numbers.",
    });
  }

  const result = arg_1 + arg_2; // Sum the two numbers

  // Return the response in the desired format
  res.json({
    status: "success",
    data: {
      result: result,
    },
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
