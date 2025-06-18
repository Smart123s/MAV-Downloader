
# MÁV Downloader

This application allows you to easily access, view, and download your MÁV (Hungarian State Railways) tickets and passes. It's particularly useful for obtaining digital copies of tickets, including those that might typically be restricted to mobile app viewing, like the country or county passes.

## Getting Started

### Running Locally with Docker (Recommended)

The easiest way to run the application locally is using the pre-built Docker image from GitHub Container Registry or by using Docker Compose.

**Using `docker run`:**

```bash
docker run -p 9002:3000 ghcr.io/smart123s/mav-downloader:latest
```

After starting the container with either method, open your browser and navigate to `http://localhost:9002`.

*(The image `ghcr.io/smart123s/mav-downloader:latest` is built by the GitHub Actions workflow in this repository.)*

### Running Locally for Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Smart123s/MAV-Downloader.git
    cd MAV-Downloader
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the Next.js development server, typically on `http://localhost:3000` (but configured for `http://localhost:9002` in `package.json`).

## Building for Production

To create a production build:

```bash
npm run build
```
This will generate an optimized build in the `.next` folder. You can then start the production server using:
```bash
npm run start
```

## CORS Proxy Backend

Directly accessing MÁV's APIs from a web browser is often hindered by Cross-Origin Resource Sharing (CORS) policies. This application includes a backend that acts as a proxy, securely forwarding requests from the frontend to the MÁV APIs and returning the data. This approach bypasses CORS limitations and allows the application to function smoothly in a browser environment.

## Rate Limiting

To prevent abuse and to respect MÁV's API limits, this application includes a global rate limiter for requests proxied to the MÁV servers. By default, it allows 3000 requests per hour from this application instance. The rate-limiting window is fixed at 1 hour.

This limit applies globally to all users of this instance of the application. If you are self-hosting and expect high traffic, you might need to adjust this limit or implement a more robust distributed rate-limiting solution if deploying multiple instances.

### Configuration

The maximum number of requests per hour can be configured using the following environment variable:

-   `MAV_API_MAX_HOURLY_REQUESTS`: The maximum number of requests allowed within a 1-hour window. (Default: `3000`)

For example, to set the limit to 1000 requests per hour, you would set this environment variable before running the application:
```bash
export MAV_API_MAX_HOURLY_REQUESTS=1000
```

## Disclaimer

This application is an independent project and is not affiliated with, endorsed by, or in any way officially connected with MÁV-START Zrt. or MÁV Zrt. All MÁV trademarks, service marks, and trade names are the property of their respective owners.

Use this application at your own risk. The developers are not responsible for any issues arising from its use.

The entire codebase in this repository was built using Firebase Studio (Gemini).
