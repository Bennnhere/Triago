const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "ONCALL AI Backend Running 🚀"
    });
});

app.listen(PORT, () => {
    console.log(`ONCALL AI backend running on http://localhost:${PORT}`);
});