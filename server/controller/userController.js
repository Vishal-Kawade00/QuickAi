
import sql from '../configs/db.js'

// Get user's own creations
export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth();

        const creations = await sql`
            SELECT * FROM creations 
            WHERE user_id = ${userId} 
            ORDER BY created_at DESC
        `;

        res.json({ success: true, creations });
    } catch (error) {
        console.error('Get User Creations Error:', error);
        res.json({ success: false, message: error.message });
    }
}

// Get published creations (public feed)
export const getPublishCreations = async (req, res) => {
    try {
        const creations = await sql`
            SELECT * FROM creations 
            WHERE publish = true 
            ORDER BY created_at DESC
        `;
        
        res.json({ success: true, creations });
    } catch (error) {
        console.error('Get Publish Creations Error:', error);
        res.json({ success: false, message: error.message });
    }
}

// Like / Unlike a creation
export const toggleLikeCreation = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    // Validate id
    if (!id) {
      return res.json({ success: false, message: "Creation ID is required" });
    }

    const [creation] = await sql`
 SELECT * FROM creations WHERE id = ${id}
 `;

    if (!creation) {
      return res.json({ success: false, message: "Creation not found" });
    }

    // If likes are stored correctly, it will be a native array or null.
    const currentLikes = creation.likes || [];
    const userIdStr = userId.toString();
    let updatedLikes;
    let message;

    if (currentLikes.includes(userIdStr)) {
      // Unlike
      updatedLikes = currentLikes.filter((user) => user !== userIdStr);
      message = "Creation unliked";
    } else {
      // Like
      updatedLikes = [...currentLikes, userIdStr];
      message = "Creation liked";
    }

    // **FIX:** Pass the JavaScript array directly to the database driver.
    // It will handle formatting it correctly for PostgreSQL.
    await sql`
 UPDATE creations 
 SET likes = ${updatedLikes} 
 WHERE id = ${id}
 `;

    res.json({ success: true, message, likesCount: updatedLikes.length });
  } catch (error) {
    console.error("Toggle Like Error:", error);
    res.json({ success: false, message: error.message });
  }
};
