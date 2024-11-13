Here's my solution built in Typescript. It works like this:

- Next.js App with an API calling Farcaster
- Textarea to enter comma- or space-separated usernames to send to API
- Lookup farcaster ID from usernames and store in Nodes array
- Compare each FID for follow status (this takes a lot of time to query for many users)
- For each user that follows another store in Edges array
- Return Nodes and Edges to frontend and display in Network Graph
- Filter graph based on Range slider input
- Display Metrics for filtered graph in tables (number of edges, adjacency matrix, shortest path)

Note: Some issues I wasn't able to solve in time

- fetching many users takes a lot of time due to cross-referencing the follow state
- after fetching from API, the slider messes up the network graph (not sure why this is happening)

https://replit.com/@CarlBarrdahl/farcaster-network-graph
