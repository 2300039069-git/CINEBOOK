export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve static assets from the frontend build
    return env.ASSETS.fetch(request);
  },
};
