module.exports = {
  sleep: async (t) => {
    // sleeps for a random amount of time between 0 and t
    const randomMs = Math.floor(Math.random() * t)
    await new Promise(res => setTimeout(res, randomMs));
  }
}