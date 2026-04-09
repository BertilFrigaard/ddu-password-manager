import app from "./app.ts";
import { PORT } from "./config.ts";

app.listen(PORT, () => {
	console.log(`Now listening on port ${PORT}`);
});
