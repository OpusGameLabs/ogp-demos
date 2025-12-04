import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "dotenv";
import { OGPServerAPI } from "@opusgamelabs/server-sdk";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";
import {
  userDb,
  gameDb,
  extractOgpUserIdFromRewardsSplit,
  closeDatabase,
} from "./database";

config();

const app = express();
const PORT = process.env.PORT || 3001;

const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Validate environment variables
if (!process.env.OGP_API_KEY) {
  throw new Error("OGP_API_KEY environment variable not set.");
}

if (!process.env.OGP_SECRET_KEY) {
  throw new Error("OGP_SECRET_KEY environment variable not set.");
}

// Initialize the OGP SDK
const api = new OGPServerAPI({
  apiKey: process.env.OGP_API_KEY,
  secretKey: process.env.OGP_SECRET_KEY,
  baseUrl: process.env.OGP_API_BASE_URL || "https://api.opengameprotocol.com",
});

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const S3_BUCKET = process.env.AWS_S3_BUCKET;

// Helper function to upload to S3
async function uploadToS3(
  fileContent: string | Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileName,
    Body: fileContent,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return `${process.env.CDN_BASE_URL}/${fileName}`;
}

// Helper function to generate game HTML
function generateGameHTML(
  gameName: string,
  pointsPerJump: number,
  lives: number,
  platformApiUrl: string,
  gameId?: string
): string {
  const templatePath = path.join(__dirname, "game-template.html");
  let template = fs.readFileSync(templatePath, "utf-8");

  template = template.replace(/{{GAME_NAME}}/g, gameName);
  template = template.replace(/{{POINTS_PER_JUMP}}/g, String(pointsPerJump));
  template = template.replace(/{{LIVES}}/g, String(lives));
  template = template.replace(
    /{{OGP_API_KEY}}/g,
    process.env.OGP_API_KEY || ""
  );
  template = template.replace(/{{PLATFORM_API_URL}}/g, platformApiUrl || "");
  template = template.replace(/{{GAME_ID}}/g, gameId || "");

  return template;
}

// Types
interface GameSubmission {
  name: string;
  description: string;
  pointsPerJump: number;
  lives: number;
  platform: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  maxScorePerSession?: number;
  maxSessionsPerDay?: number;
  maxCumulativePointsPerDay?: number;
  jwksUrl?: string;
  userEmail: string;
  tokens?: string[];
}

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get current OGP user (platform's user)
app.get("/api/ogp/me", async (req: Request, res: Response) => {
  try {
    const me = await api.users.me();
    res.json({ success: true, data: me });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Submit a new game to OGP where the platform is the creator and the user receives 50% of the creator rewards
app.post(
  "/api/games/submit",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const gameData: GameSubmission = JSON.parse(req.body.data);

      // Validate required fields
      if (
        !gameData.name ||
        !gameData.description ||
        !gameData.pointsPerJump ||
        !gameData.lives ||
        !gameData.userEmail
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: name, description, pointsPerJump, lives, or userEmail",
        });
      }

      // Get the platform's OGP user ID
      const platformUser = await api.users.me();

      if (!platformUser || !platformUser.id) {
        return res.status(500).json({
          success: false,
          error: "Failed to get platform user information",
        });
      }

      // Generate game HTML with parameters (without game ID initially)
      const gameHTML = generateGameHTML(
        gameData.name,
        gameData.pointsPerJump,
        gameData.lives,
        process.env.PLATFORM_API_URL || "http://localhost:3001/api"
      );

      // Upload game HTML to S3 (first time without game ID)
      const gameFileName = `demo-games/${uuidv4()}.html`;
      const gameUrl = await uploadToS3(gameHTML, gameFileName, "text/html");

      // Prepare orgRewardsSplit
      // Platform gets 50% (5000), creator gets 50% (5000)
      const orgRewardsSplit = {
        [platformUser.id]: 5000, // Platform's share
        [`email:${gameData.userEmail}`]: 5000, // Creator's share
      };

      // Prepare game registration data
      const registrationData = {
        name: gameData.name,
        description: gameData.description,
        gameUrl: gameUrl,
        isHTMLGame: true,
        iframable: true,
        platform: (gameData.platform.toLowerCase() || "web") as any,
        twitter: gameData.twitter,
        discord: gameData.discord,
        telegram: gameData.telegram,
        maxScorePerSession: gameData.maxScorePerSession,
        maxSessionsPerDay: gameData.maxSessionsPerDay,
        maxCumulativePointsPerDay: gameData.maxCumulativePointsPerDay,
        orgRewardsSplit,
        tokens: gameData.tokens,
      };

      // Convert uploaded files to File objects if provided
      let imageFile: File | undefined;
      let coverImageFile: File | undefined;

      if (files.image && files.image[0]) {
        const imgBuffer = files.image[0].buffer;
        imageFile = new File([imgBuffer], files.image[0].originalname, {
          type: files.image[0].mimetype,
        });
      }

      if (files.coverImage && files.coverImage[0]) {
        const coverBuffer = files.coverImage[0].buffer;
        coverImageFile = new File(
          [coverBuffer],
          files.coverImage[0].originalname,
          {
            type: files.coverImage[0].mimetype,
          }
        );
      }

      if (!imageFile) {
        throw new Error("Game image file is required");
      }

      // Register the game with OGP
      const newGame = await api.games.registerGame(
        registrationData,
        imageFile,
        coverImageFile
      );

      if (!newGame || !newGame.id) {
        return res.status(500).json({
          success: false,
          error: "Failed to register game with OGP platform",
        });
      }

      // Now that we have the game ID, regenerate the HTML with the game ID embedded
      console.log("Regenerating HTML with game ID:", newGame.id);
      const gameHTMLWithId = generateGameHTML(
        gameData.name,
        gameData.pointsPerJump,
        gameData.lives,
        process.env.PLATFORM_API_URL || "http://localhost:3001/api",
        newGame.id
      );

      // Verify the game ID is in the HTML
      if (!gameHTMLWithId.includes(newGame.id)) {
        console.error("WARNING: Game ID not found in generated HTML!");
      } else {
        console.log("Game ID successfully embedded in HTML");
      }

      // Re-upload the game HTML with the game ID to the same file path
      console.log("Re-uploading HTML to S3 with game ID...");
      await uploadToS3(gameHTMLWithId, gameFileName, "text/html");
      console.log("HTML re-uploaded successfully");

      // NOTE: you will probably want to run a cache invalidation on your CDN here

      // Store in local database
      // First, get or create the user
      const user = userDb.getOrCreate(gameData.userEmail);

      // Extract and store the OGP user ID from the converted orgRewardsSplit
      // The newGame.orgRewardsSplit has the email converted to actual OGP user ID
      if (newGame.orgRewardsSplit) {
        const ogpUserId = extractOgpUserIdFromRewardsSplit(
          newGame.orgRewardsSplit,
          platformUser.id
        );
        if (ogpUserId && !user.ogp_user_id) {
          userDb.updateOgpUserId(gameData.userEmail, ogpUserId);
        }
      }

      // Store the game in the database with the converted orgRewardsSplit
      gameDb.create({
        game_id: newGame.id,
        user_email: gameData.userEmail,
        name: gameData.name,
        description: gameData.description,
        game_url: gameUrl,
        platform: gameData.platform,
        points_per_jump: gameData.pointsPerJump,
        lives: gameData.lives,
        image_url: newGame.imageUrl ?? undefined,
        cover_image_url: newGame.coverImage ?? undefined,
        twitter: gameData.twitter,
        discord: gameData.discord,
        telegram: gameData.telegram,
        max_score_per_session: gameData.maxScorePerSession,
        max_sessions_per_day: gameData.maxSessionsPerDay,
        max_cumulative_points_per_day: gameData.maxCumulativePointsPerDay,
        org_rewards_split: JSON.stringify(
          newGame.orgRewardsSplit || orgRewardsSplit
        ),
      });

      res.status(201).json({
        success: true,
        data: {
          game: newGame,
          gameUrl: gameUrl,
          message: "Game successfully created and registered to OGP platform",
        },
      });
    } catch (error) {
      console.error("Error submitting game:", error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Get all games registered by the platform
app.get("/api/games", async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0, userEmail } = req.query;

    // If userEmail is provided, get games where that user is present in the orgRewardsSplit
    if (userEmail && typeof userEmail === "string") {
      const ogpRes = await api.games.getMyGames({
        limit: Number(limit),
        offset: Number(offset),
        include_extra: true,
        collaborator: `email:${userEmail}` || undefined,
      });

      // Get the user's OGP ID from local database for share calculation
      const user = userDb.getByEmail(userEmail);

      res.json({
        success: true,
        data: ogpRes,
        userOgpId: user?.ogp_user_id,
      });
    } else {
      // Otherwise, get all games
      const allGames = await api.games.getMyGames({
        limit: Number(limit),
        offset: Number(offset),
        include_extra: true,
      });

      res.json({ success: true, data: allGames });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get a specific game by ID
app.get("/api/games/:gameId", async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    if (!gameId) {
      return res
        .status(400)
        .json({ success: false, error: "gameId is required" });
    }
    const game = await api.games.getGameById(gameId);
    res.json({ success: true, data: game });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Update an existing game
app.put("/api/games/:gameId", async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const gameData = req.body;

    if (!gameId) {
      return res
        .status(400)
        .json({ success: false, error: "gameId is required" });
    }

    const updatedGameId = await api.games.updateGame(gameId, gameData);

    // Update in database
    const localGame = gameDb.getByGameId(gameId);
    if (localGame) {
      const updates: Partial<typeof localGame> = {};

      if (gameData.name) updates.name = gameData.name;
      if (gameData.description) updates.description = gameData.description;
      if (gameData.twitter) updates.twitter = gameData.twitter;
      if (gameData.discord) updates.discord = gameData.discord;
      if (gameData.telegram) updates.telegram = gameData.telegram;
      if (gameData.platform) updates.platform = gameData.platform;
      if (gameData.maxScorePerSession !== undefined)
        updates.max_score_per_session = gameData.maxScorePerSession;
      if (gameData.maxSessionsPerDay !== undefined)
        updates.max_sessions_per_day = gameData.maxSessionsPerDay;
      if (gameData.maxCumulativePointsPerDay !== undefined)
        updates.max_cumulative_points_per_day =
          gameData.maxCumulativePointsPerDay;

      gameDb.update(gameId, updates);
    }

    res.json({ success: true, data: { id: updatedGameId } });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get leaderboard for a game
app.get(
  "/api/games/:gameId/leaderboard",
  async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const { limit = 10 } = req.query;

      if (!gameId) {
        return res
          .status(400)
          .json({ success: false, error: "gameId is required" });
      }
      const leaderboard = await api.games.leaderboard(gameId, Number(limit));
      res.json({ success: true, data: leaderboard });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }
);

// Submit game score from player
app.post("/api/game-scores", async (req: Request, res: Response) => {
  try {
    const { playerEmail, score, sessionId, gameId } = req.body;

    if (!playerEmail || score === undefined || !gameId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: playerEmail, score, or gameId",
      });
    }

    // Submit score to OGP
    await api.games.addPointsByUserId(gameId, `email:${playerEmail}`, score);

    res.json({
      success: true,
      message: "Score recorded successfully",
      data: { playerEmail, score, sessionId },
    });
  } catch (error) {
    console.error("Error submitting score:", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");
  closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down gracefully...");
  closeDatabase();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`OGP Game Platform Server running on http://localhost:${PORT}`);
  console.log(`Ready to accept game submissions`);
  console.log(`Database ready for storing games and users`);
});
