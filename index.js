const express = require("express");
const grafanaImportRouter = require("./routes/grafanaImportRouter");
const dotenv = require("dotenv"); 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 80;

app.use(express.json());
app.use('/graf-import-tool', grafanaImportRouter);

app.use((req, res, next) => {
    res.status(404).json(
        {
	  "timestamp":  new Date().toUTCString(),
	  "code": 404,
	  "title": "Bad request",
	  "detail": "Page not found"
	}
    )
})
 
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
