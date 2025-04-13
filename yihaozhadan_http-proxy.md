flowchart TD
%% External Actors
Client["Client<br/>(HTTP Client, Test Suite)"]:::external
PerfTest["Performance Test Script<br/>(perf-test/failure-rate.js)"]:::external
Target["Target Service(s)<br/>(Any HTTP/HTTPS Endpoint)"]:::external
%% Docker Container
subgraph "Docker Container"
direction TB
DockerEnv["Configuration<br/>(Env Vars)"]:::config
subgraph "HTTP Proxy Service<br/>(Rust Application)"
direction TB
HTTPServer["HTTP Server<br/>(Handles /delay, /failure)"]:::proxy
ConfigLoader["Configuration Loader<br/>(Env Vars & Headers)"]:::config
RequestParser["Request Parser"]:::proxy
DelaySimulator["Delay Simulator"]:::proxy
FailureSimulator["Failure Simulator"]:::proxy
ProxyForwarder["Proxy Forwarder"]:::proxy
ErrorHandler["Error Handler"]:::error
Logger["Logger"]:::proxy
end
end
%% Configuration via Headers (per-request)
Headers["Configuration<br/>(HTTP Headers)"]:::config
%% Flows
Client -->|"HTTP POST /delay<br/>HTTP POST /failure"| HTTPServer
PerfTest -->|"Load Test Requests"| HTTPServer
%% Configuration Flows
DockerEnv -- "Env Vars" --> ConfigLoader
Headers -- "Per-Request Config" --> ConfigLoader
%% Proxy Service Internal Flow
HTTPServer -->|"Parse Request"| RequestParser
RequestParser --> ConfigLoader
ConfigLoader --> DelaySimulator
DelaySimulator --> FailureSimulator
%% Conditional Flow: Failure or Forward
FailureSimulator -- "Simulated Failure<br/>(probabilistic)" --- ErrorHandler
FailureSimulator -- "Forward if Success" --> ProxyForwarder
ProxyForwarder -->|"Forward Request"| Target
Target -->|"Response"| ProxyForwarder
ProxyForwarder -->|"Response"| HTTPServer
ErrorHandler -->|"Error Response"| HTTPServer
HTTPServer -->|"Response"| Client
HTTPServer -->|"Response"| PerfTest
%% Logger
HTTPServer -.->|"Log Request"| Logger
DelaySimulator -.->|"Log Delay"| Logger
FailureSimulator -.->|"Log Failure Decision"| Logger
ProxyForwarder -.->|"Log Forwarding"| Logger
ErrorHandler -.->|"Log Error"| Logger
%% Styles
classDef external fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#0d47a1;
classDef proxy fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#1b5e20;
classDef config fill:#fffde7,stroke:#fbc02d,stroke-width:2px,color:#f57c00;
classDef error fill:#ffebee,stroke:#d32f2f,stroke-width:2px,color:#b71c1c;
classDef docker fill:#ececec,stroke:#757575,stroke-width:2px,color:#424242;
%% Click Events
click HTTPServer "https://github.com/yihaozhadan/http-proxy/blob/main/src/main.rs"
click ConfigLoader "https://github.com/yihaozhadan/http-proxy/blob/main/src/main.rs"
click RequestParser "https://github.com/yihaozhadan/http-proxy/blob/main/src/main.rs"
click DelaySimulator "https://github.com/yihaozhadan/http-proxy/blob/main/src/main.rs"
click FailureSimulator "https://github.com/yihaozhadan/http-proxy/blob/main/src/main.rs"
click ProxyForwarder "https://github.com/yihaozhadan/http-proxy/blob/main/src/main.rs"
click ErrorHandler "https://github.com/yihaozhadan/http-proxy/blob/main/src/main.rs"
click Logger "https://github.com/yihaozhadan/http-proxy/blob/main/src/main.rs"
click PerfTest "https://github.com/yihaozhadan/http-proxy/blob/main/perf-test/failure-rate.js"
click DockerEnv "https://github.com/yihaozhadan/http-proxy/tree/main/Dockerfile"
click DockerContainer "https://github.com/yihaozhadan/http-proxy/blob/main/docker-compose.yml"
click DockerContainer "https://github.com/yihaozhadan/http-proxy/tree/main/Dockerfile"
%% Docker Container click event (for both files)
%% Since the Docker Container is a subgraph, we can't click it directly, so we apply click to its config/env nodes
%% Configuration click events
click DockerEnv "https://github.com/yihaozhadan/http-proxy/blob/main/docker-compose.yml"
click Headers "https://github.com/yihaozhadan/http-proxy/blob/main/src/main.rs"