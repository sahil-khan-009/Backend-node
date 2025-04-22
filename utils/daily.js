// // utils/daily.js
// const axios = require("axios");

// const DAILY_API_URL = "https://api.daily.co/v1/rooms";
// const DAILY_API_KEY = "e0bbaaa71e18a22d8ace3e3fda670995b26bd6e7786d1f359053ed89f4b774a5"; // 🔒 Keep this in env in production

// async function createDailyRoom() {
//   try {
//     const response = await axios.post(
//       DAILY_API_URL,
//       {
//         properties: {
//           enable_chat: true,
//           start_video_off: true,
//           exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${DAILY_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     return response.data.url;
//   } catch (err) {
//     console.error("Daily.co Room Error:", err.message);
//     return null;
//   }
// }

// module.exports = { createDailyRoom };
