# Datita

Datita is a web application built with Node.js and Express.js, designed to provide key data about the Argentine economy that directly impacts your life.

## Purpose

This project aims to consolidate and present essential economic indicators in a user-friendly format, making it easier for individuals to understand and track how the Argentine economy affects their daily lives.

## Features (Planned/Current)

* **Real-time/Up-to-date Economic Data:**
    * Minimum wage.
    * Cost of the basic basket.
    * Minimum retirement.
* **Clear and Concise Visualizations:**
    * Show the most important values.
    * Easy-to-understand data presentations.
* **User-Friendly Interface:**
    * Simple and intuitive design.
    * Responsive across different devices.
* **Data Sources:**
    * INDEC
    * ANSES
    * BCRA

## Technologies Used

* **Node.js:** Runtime environment.
* **Express.js:** Web application framework.

## Getting Started

### Prerequisites

* Node.js (>= 22.14)
* npm (>= 10.9)

### Installation

1.  Clone the repository:

    ```bash
    git clone git@github.com:rgmamani/datita.git
    cd datita
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Configure environment variables:
    * Create a `.env` file based on the `.env.example` file (if provided).
    * Set the necessary environment variables (e.g., API keys, database connection strings).

4.  Run the application:

    ```bash
    DEBUG=datati:* npm start
    ```

5.  Open your browser and navigate to `http://localhost:3000` (or the port specified in your configuration).

## Development

This section outlines the development setup and processes for this project.

Local development runs with `npm start` (http://localhost:3000). The site is deployed automatically to Vercel on every push to `main` (https://datita-app.vercel.app); deploy configuration lives in `vercel.json`.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues to suggest improvements or report bugs.

## License

(Add a license, e.g., MIT)