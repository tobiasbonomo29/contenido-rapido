import cron from "node-cron";
import { publicationService } from "../services/publication.service";
import { videoService } from "../services/video.service";

export function startScheduler() {
  cron.schedule("*/1 * * * *", async () => {
    await publicationService.processDueJobs();
    await videoService.syncActiveGenerations();
  });
}
