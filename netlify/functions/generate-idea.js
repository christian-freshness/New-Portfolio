// This is a Netlify Function. It runs on the server, not in the browser.
// It acts as a secure proxy to the Gemini API.

exports.handler = async function (event) {
  // Get the prompt sent from the front-end.
  const { prompt } = JSON.parse(event.body);

  // Securely access the API key from Netlify's environment variables.
  const apiKey = process.env.GEMINI_API_KEY;

  // Stop if the API key is not set.
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key is not configured." }),
    };
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  // Construct the payload for the Gemini API.
  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  try {
    // Call the Gemini API from the server.
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `API request failed: ${errorBody}` }),
      };
    }

    const result = await response.json();

    // Send the successful result back to the front-end.
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
