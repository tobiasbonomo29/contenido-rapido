import { app } from "./app";
import { env } from "./config/env";
import { startScheduler } from "./jobs/scheduler";

app.listen(env.port, () => {
  console.log(`API running on port ${env.port}`);
});

startScheduler();
