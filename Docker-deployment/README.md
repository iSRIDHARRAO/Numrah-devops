### Steps to deploy Chat Server in docker compose

1. Replace all placeholders in `example.env` with valid values such as `database name`, `username`, `password`,  `access_token_secret` and `refresh_token_secret`
2. Run the following command to rename env file 
    ```bash
    mv example.env .env
    ```
3. Run the following command to deploy services
   ```bash
    docker compose up --build -d
    ```
4. Access chat server on port 3001 and api server on port 3000.