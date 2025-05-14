// analytics.js
const axios = require('axios');

const GA_MEASUREMENT_ID = 'G-B3VEXEJC2M'; // replace with your Measurement ID
const GA_API_SECRET = 'yBgKw3tJRZSYlyIbXHOlHQ'; // from GA4 → Data Streams → Measurement Protocol API

async function sendGAEvent({ clientId, eventName, params = {} }) {
  const url =` https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`;

  const payload = {
    client_id: clientId || Date.now(), // can be random, or user._id
    events: [
      {
        name: eventName,
        params: params
      }
    ]
  };

  try {
    await axios.post(url, payload);
    console.log("This is paylodada ",payload)
    console.log("GA event sent:", eventName);
  } catch (err) {
    console.error("GA event error:", err.message);
  }
}

module.exports = { sendGAEvent };































// const { sendGAEvent } = require('./analytics'); // adjust path if needed
