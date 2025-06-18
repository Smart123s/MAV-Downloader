# MÁV Downloader

This application allows you to easily access, view, and download your MÁV (Hungarian State Railways) tickets and passes. It's particularly useful for obtaining digital copies of tickets, including those that might typically be restricted to mobile app viewing, like the country or county passes.

## Getting Started

### Running Locally with Docker

The easiest way to run the application locally is using the pre-built Docker image from GitHub Container Registry:

```bash
docker run -p 9002:3000 ghcr.io/smart123s/mav-downloader:latest
```
Then, open your browser and navigate to `http://localhost:9002`.

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
    This will start the Next.js development server, typically on `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
```
This will generate an optimized build in the `.next` folder. You can then start the production server using:
```bash
npm run start
```

## CORS Limitations

Directly accessing MÁV's APIs from a web browser is often hindered by Cross-Origin Resource Sharing (CORS) policies. This application includes a backend that acts as a proxy, securely forwarding requests to the MÁV APIs and returning the data to the frontend, thus bypassing these CORS limitations.

## Disclaimer

This application is an independent project and is not affiliated with, endorsed by, or in any way officially connected with MÁV-START Zrt. or MÁV Zrt. All MÁV trademarks, service marks, and trade names are the property of their respective owners.

Use this application at your own risk. The developers are not responsible for any issues arising from its use.
