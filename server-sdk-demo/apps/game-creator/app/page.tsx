"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Home() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        userEmail: "",
        pointsPerJump: "10",
        lives: "3",
        platform: "web",
        twitter: "",
        discord: "",
        telegram: "",
        maxScorePerSession: "",
        maxSessionsPerDay: "",
        maxCumulativePointsPerDay: "",
    });
    const [image, setImage] = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [viewGames, setViewGames] = useState(false);
    const [userGames, setUserGames] = useState<any[]>([]);
    const [loadingGames, setLoadingGames] = useState(false);
    const [gamesEmail, setGamesEmail] = useState("");
    const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
    const [editingGame, setEditingGame] = useState<any | null>(null);
    const [userOgpId, setUserOgpId] = useState<string | null>(null);
    const [viewingLeaderboard, setViewingLeaderboard] = useState<string | null>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: "",
        description: "",
        twitter: "",
        discord: "",
        telegram: "",
        platform: "web",
        maxScorePerSession: "",
        maxSessionsPerDay: "",
        maxCumulativePointsPerDay: "",
    });

    // Listen for token selection changes from OGP widget
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.action === 'OGP_WIDGET_ON_CHANGE') {
                const { tokenIdentifiers } = event.data.data;
                console.log('Selected token identifiers:', tokenIdentifiers.map((s: { network: string, address: string }) => s.address));
                setSelectedTokens(tokenIdentifiers.map((s: { network: string, address: string }) => s.address) || []);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "image" | "coverImage") => {
        if (e.target.files && e.target.files[0]) {
            if (field === "image") {
                setImage(e.target.files[0]);
            } else if (field === "coverImage") {
                setCoverImage(e.target.files[0]);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const formDataToSend = new FormData();

            // Add game data
            const gameData = {
                ...formData,
                maxScorePerSession: formData.maxScorePerSession ? Number(formData.maxScorePerSession) : undefined,
                maxSessionsPerDay: formData.maxSessionsPerDay ? Number(formData.maxSessionsPerDay) : undefined,
                maxCumulativePointsPerDay: formData.maxCumulativePointsPerDay ? Number(formData.maxCumulativePointsPerDay) : undefined,
                tokens: selectedTokens.length > 0 ? selectedTokens : undefined,
            };

            formDataToSend.append("data", JSON.stringify(gameData));

            // Add files
            if (image) {
                formDataToSend.append("image", image);
            }
            if (coverImage) {
                formDataToSend.append("coverImage", coverImage);
            }

            const response = await axios.post(`${API_URL}/api/games/submit`, formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setSuccess(`Game registered successfully! Game URL: ${response.data.data.gameUrl}`);
            setFormData({
                name: "",
                description: "",
                userEmail: "",
                pointsPerJump: "10",
                lives: "3",
                platform: "web",
                twitter: "",
                discord: "",
                telegram: "",
                maxScorePerSession: "",
                maxSessionsPerDay: "",
                maxCumulativePointsPerDay: "",
            });
            setImage(null);
            setCoverImage(null);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to submit game. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewGames = async () => {
        if (!gamesEmail) {
            setError("Please enter an email address to view games");
            return;
        }

        setLoadingGames(true);
        setError(null);

        try {
            const response = await axios.get(`${API_URL}/api/games`, {
                params: { userEmail: gamesEmail }
            });
            setUserGames(response.data.data);
            setUserOgpId(response.data.userOgpId || null);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch games");
        } finally {
            setLoadingGames(false);
        }
    };

    const handleEditGame = (game: any) => {
        setEditingGame(game);
        setEditFormData({
            name: game.name || "",
            description: game.description || "",
            twitter: game.twitter || "",
            discord: game.discord || "",
            telegram: game.telegram || "",
            platform: game.platform || "web",
            maxScorePerSession: game.maxScorePerSession?.toString() || "",
            maxSessionsPerDay: game.maxSessionsPerDay?.toString() || "",
            maxCumulativePointsPerDay: game.maxCumulativePointsPerDay?.toString() || "",
        });
        setError(null);
        setSuccess(null);
    };

    const handleEditInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdateGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGame) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const updateData = {
                name: editFormData.name,
                description: editFormData.description,
                twitter: editFormData.twitter || undefined,
                discord: editFormData.discord || undefined,
                telegram: editFormData.telegram || undefined,
                platform: editFormData.platform,
                maxScorePerSession: editFormData.maxScorePerSession ? Number(editFormData.maxScorePerSession) : undefined,
                maxSessionsPerDay: editFormData.maxSessionsPerDay ? Number(editFormData.maxSessionsPerDay) : undefined,
                maxCumulativePointsPerDay: editFormData.maxCumulativePointsPerDay ? Number(editFormData.maxCumulativePointsPerDay) : undefined,
            };

            await axios.put(`${API_URL}/api/games/${editingGame.id}`, updateData);

            setSuccess("Game updated successfully!");
            setEditingGame(null);
            
            // Refresh games list
            if (gamesEmail) {
                await handleViewGames();
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to update game");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingGame(null);
        setError(null);
        setSuccess(null);
    };

    const handleViewLeaderboard = async (gameId: string) => {
        setViewingLeaderboard(gameId);
        setLoadingLeaderboard(true);
        setError(null);

        try {
            const response = await axios.get(`${API_URL}/api/games/${gameId}/leaderboard`, {
                params: { limit: 20 }
            });
            setLeaderboard(response.data.data);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch leaderboard");
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    const handleCloseLeaderboard = () => {
        setViewingLeaderboard(null);
        setLeaderboard([]);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Game Creator Platform</h1>
                <p className={styles.subtitle}>Create and register games to the Open Game Protocol - Earn 50% of creator rewards!</p>
            </header>

            <main className={styles.main}>
                <div className={styles.viewToggle}>
                    <button
                        onClick={() => setViewGames(false)}
                        className={!viewGames ? styles.activeTab : styles.inactiveTab}
                    >
                        Create Game
                    </button>
                    <button
                        onClick={() => setViewGames(true)}
                        className={viewGames ? styles.activeTab : styles.inactiveTab}
                    >
                        View My Games
                    </button>
                </div>

                {!viewGames ? (
                    <div className={styles.formContainer}>
                        <h2>Register Your Game</h2>
                        <p className={styles.rewardsInfo}>
                            🎉 You'll receive 50% of all creator rewards for this game!
                        </p>

                        {success && <div className={styles.success}>{success}</div>}
                        {error && <div className={styles.error}>{error}</div>}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="userEmail">Your Email *</label>
                                <input
                                    type="email"
                                    id="userEmail"
                                    name="userEmail"
                                    value={formData.userEmail}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="creator@example.com"
                                />
                                <small>You'll receive 50% of creator rewards</small>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="name">Game Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="My Awesome Game"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="description">Description *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={4}
                                    placeholder="Describe your game..."
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Associated Tokens (Optional)</label>
                                <iframe
                                    src="https://gtokenselect.opengameprotocol.com/"
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px'
                                    }}
                                    title="Token Selector"
                                />
                                {selectedTokens.length > 0 && (
                                    <small style={{ marginTop: '0.5rem', display: 'block' }}>
                                        Selected {selectedTokens.length} token{selectedTokens.length !== 1 ? 's' : ''}
                                    </small>
                                )}
                            </div>

                            <div className={styles.gameSettings}>
                                <h3>Game Settings</h3>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="pointsPerJump">Points Per Jump *</label>
                                        <input
                                            type="number"
                                            id="pointsPerJump"
                                            name="pointsPerJump"
                                            value={formData.pointsPerJump}
                                            onChange={handleInputChange}
                                            required
                                            min="1"
                                            placeholder="10"
                                        />
                                        <small>How many points players earn per successful jump</small>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="lives">Starting Lives *</label>
                                        <input
                                            type="number"
                                            id="lives"
                                            name="lives"
                                            value={formData.lives}
                                            onChange={handleInputChange}
                                            required
                                            min="1"
                                            max="10"
                                            placeholder="3"
                                        />
                                        <small>Number of lives players start with</small>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="platform">Platform *</label>
                                <select
                                    id="platform"
                                    name="platform"
                                    value={formData.platform}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="web">Web</option>
                                    <option value="ios">iOS</option>
                                    <option value="android">Android</option>
                                    <option value="steam">Steam</option>
                                    <option value="itch">Itch.io</option>
                                    <option value="epic">Epic Games</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="image">Game Image</label>
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "image")}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="coverImage">Cover Image</label>
                                <input
                                    type="file"
                                    id="coverImage"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "coverImage")}
                                />
                            </div>

                            <details className={styles.optionalSection}>
                                <summary>Optional Settings</summary>

                                <div className={styles.formGroup}>
                                    <label htmlFor="twitter">Twitter</label>
                                    <input
                                        type="url"
                                        id="twitter"
                                        name="twitter"
                                        value={formData.twitter}
                                        onChange={handleInputChange}
                                        placeholder="https://x.com/username"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="discord">Discord</label>
                                    <input
                                        type="url"
                                        id="discord"
                                        name="discord"
                                        value={formData.discord}
                                        onChange={handleInputChange}
                                        placeholder="https://discord.com/invite/..."
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="telegram">Telegram</label>
                                    <input
                                        type="url"
                                        id="telegram"
                                        name="telegram"
                                        value={formData.telegram}
                                        onChange={handleInputChange}
                                        placeholder="https://t.me/username"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="maxScorePerSession">Max Score Per Session</label>
                                    <input
                                        type="number"
                                        id="maxScorePerSession"
                                        name="maxScorePerSession"
                                        value={formData.maxScorePerSession}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="maxSessionsPerDay">Max Sessions Per Day</label>
                                    <input
                                        type="number"
                                        id="maxSessionsPerDay"
                                        name="maxSessionsPerDay"
                                        value={formData.maxSessionsPerDay}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="maxCumulativePointsPerDay">Max Cumulative Points Per Day</label>
                                    <input
                                        type="number"
                                        id="maxCumulativePointsPerDay"
                                        name="maxCumulativePointsPerDay"
                                        value={formData.maxCumulativePointsPerDay}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </div>
                            </details>

                            <button type="submit" className={styles.submitButton} disabled={loading}>
                                {loading ? "Submitting..." : "Register Game to OGP"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className={styles.formContainer}>
                        <h2>My Games</h2>
                        <div className={styles.formGroup}>
                            <label htmlFor="gamesEmail">Enter your email to view your games</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="email"
                                    id="gamesEmail"
                                    value={gamesEmail}
                                    onChange={(e) => setGamesEmail(e.target.value)}
                                    placeholder="your-email@example.com"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    onClick={handleViewGames}
                                    disabled={loadingGames}
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    {loadingGames ? "Loading..." : "View Games"}
                                </button>
                            </div>
                        </div>

                        {success && <div className={styles.success}>{success}</div>}
                        {error && <div className={styles.error}>{error}</div>}

                        {viewingLeaderboard ? (
                            <div className={styles.formContainer} style={{ marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h2>Leaderboard</h2>
                                    <button
                                        onClick={handleCloseLeaderboard}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: '#666',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>

                                {loadingLeaderboard ? (
                                    <p style={{ textAlign: 'center' }}>Loading leaderboard...</p>
                                ) : leaderboard.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Rank</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Player</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaderboard.map((entry, index) => (
                                                <tr key={entry.userId || index} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '0.75rem' }}>#{index + 1}</td>
                                                    <td style={{ padding: '0.75rem' }}>{entry.ogpId || entry.userId || 'Anonymous'}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>{entry.points?.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ textAlign: 'center', marginTop: '20px' }}>No leaderboard entries yet.</p>
                                )}
                            </div>
                        ) : editingGame ? (
                            <div className={styles.formContainer} style={{ marginTop: '1rem' }}>
                                <h2>Edit Game: {editingGame.name}</h2>
                                <form onSubmit={handleUpdateGame} className={styles.form}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="editName">Game Name *</label>
                                        <input
                                            type="text"
                                            id="editName"
                                            name="name"
                                            value={editFormData.name}
                                            onChange={handleEditInputChange}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="editDescription">Description *</label>
                                        <textarea
                                            id="editDescription"
                                            name="description"
                                            value={editFormData.description}
                                            onChange={handleEditInputChange}
                                            required
                                            rows={4}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="editPlatform">Platform *</label>
                                        <select
                                            id="editPlatform"
                                            name="platform"
                                            value={editFormData.platform}
                                            onChange={handleEditInputChange}
                                            required
                                        >
                                            <option value="web">Web</option>
                                            <option value="ios">iOS</option>
                                            <option value="android">Android</option>
                                            <option value="steam">Steam</option>
                                            <option value="itch">Itch.io</option>
                                            <option value="epic">Epic Games</option>
                                        </select>
                                    </div>

                                    <details className={styles.optionalSection} open>
                                        <summary>Optional Settings</summary>

                                        <div className={styles.formGroup}>
                                            <label htmlFor="editTwitter">Twitter</label>
                                            <input
                                                type="url"
                                                id="editTwitter"
                                                name="twitter"
                                                value={editFormData.twitter}
                                                onChange={handleEditInputChange}
                                                placeholder="https://x.com/username"
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label htmlFor="editDiscord">Discord</label>
                                            <input
                                                type="url"
                                                id="editDiscord"
                                                name="discord"
                                                value={editFormData.discord}
                                                onChange={handleEditInputChange}
                                                placeholder="https://discord.com/invite/..."
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label htmlFor="editTelegram">Telegram</label>
                                            <input
                                                type="url"
                                                id="editTelegram"
                                                name="telegram"
                                                value={editFormData.telegram}
                                                onChange={handleEditInputChange}
                                                placeholder="https://t.me/username"
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label htmlFor="editMaxScorePerSession">Max Score Per Session</label>
                                            <input
                                                type="number"
                                                id="editMaxScorePerSession"
                                                name="maxScorePerSession"
                                                value={editFormData.maxScorePerSession}
                                                onChange={handleEditInputChange}
                                                min="0"
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label htmlFor="editMaxSessionsPerDay">Max Sessions Per Day</label>
                                            <input
                                                type="number"
                                                id="editMaxSessionsPerDay"
                                                name="maxSessionsPerDay"
                                                value={editFormData.maxSessionsPerDay}
                                                onChange={handleEditInputChange}
                                                min="0"
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label htmlFor="editMaxCumulativePointsPerDay">Max Cumulative Points Per Day</label>
                                            <input
                                                type="number"
                                                id="editMaxCumulativePointsPerDay"
                                                name="maxCumulativePointsPerDay"
                                                value={editFormData.maxCumulativePointsPerDay}
                                                onChange={handleEditInputChange}
                                                min="0"
                                            />
                                        </div>
                                    </details>

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <button type="submit" className={styles.submitButton} disabled={loading}>
                                            {loading ? "Updating..." : "Update Game"}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={handleCancelEdit}
                                            className={styles.submitButton}
                                            style={{ background: '#666' }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : userGames.length > 0 ? (
                            <div className={styles.gamesList}>
                                {userGames.map((game) => (
                                    <div key={game.id} className={styles.gameCard}>
                                        <h3>{game.name}</h3>
                                        <p>{game.description}</p>
                                        <div className={styles.gameLinks}>
                                            <a href={game.gameUrl} target="_blank" rel="noopener noreferrer">
                                                Play Game
                                            </a>
                                            <span>Platform: {game.platform}</span>
                                        </div>
                                        {game.orgRewardsSplit && userOgpId && (() => {
                                            const rewardsSplit = game.orgRewardsSplit as unknown as Record<string, number>;
                                            // Find the user's share using their OGP ID
                                            const userShare = rewardsSplit[userOgpId] ?? 0;
                                            return (
                                                <div className={styles.rewardInfo}>
                                                    Your share: {userShare / 100}%
                                                </div>
                                            );
                                        })()}
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                            <button
                                                onClick={() => handleEditGame(game)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem 1rem',
                                                    background: 'var(--primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleViewLeaderboard(game.id)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem 1rem',
                                                    background: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Leaderboard
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : gamesEmail && !loadingGames ? (
                            <p style={{ textAlign: 'center', marginTop: '20px' }}>
                                No games found for this email address.
                            </p>
                        ) : null}
                    </div>
                )}
            </main>
        </div>
    );
}
