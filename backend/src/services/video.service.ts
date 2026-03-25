import { videoRepo } from "../repositories/video.repo";
import { contentRepo } from "../repositories/content.repo";
import { AppError } from "../utils/errors";

const PROVIDER = "mock-ai";

function buildScript(bodyText: string) {
  return `Guion sugerido:\n${bodyText}`;
}

function buildPrompt(title: string, script: string) {
  return `Genera un video corto para: ${title}\n${script}`;
}

export const videoService = {
  async generate(contentId: string) {
    const content = await contentRepo.getById(contentId);
    if (!content) {
      throw new AppError("Content not found", 404);
    }

    if (!['DRAFT', 'READY'].includes(content.status)) {
      throw new AppError("Video generation allowed only for DRAFT or READY content", 400);
    }

    const script = buildScript(content.bodyText);
    const prompt = buildPrompt(content.title, script);

    const video = await videoRepo.create({
      content: { connect: { id: contentId } },
      promptUsed: prompt,
      scriptUsed: script,
      provider: PROVIDER,
      status: "PENDING"
    });

    setTimeout(async () => {
      await videoRepo.update(video.id, { status: "PROCESSING" });
    }, 500);

    setTimeout(async () => {
      await videoRepo.update(video.id, {
        status: "COMPLETED",
        videoUrl: `https://videos.local/${video.id}.mp4`,
        subtitlesText: "Subtitulos generados...",
        voiceoverText: "Voiceover generado..."
      });
    }, 1500);

    return video;
  },
  getById(id: string) {
    return videoRepo.getById(id);
  },
  getByContent(contentId: string) {
    return videoRepo.getByContent(contentId);
  }
};
