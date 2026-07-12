FROM rust:1.97-bookworm AS builder

WORKDIR /src

RUN apt-get update \
    && apt-get install -y --no-install-recommends flatbuffers-compiler ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY RBackend /src/RBackend
COPY Backend/DB /src/Backend/DB
COPY tests /src/tests
COPY Frontend/Web/static/images/items /src/Frontend/Web/static/images/items

WORKDIR /src/RBackend

RUN cargo test --workspace
RUN cargo run --release -p builder -- validate-all
RUN cargo run --release -p builder -- build-all-packs
RUN cargo run --release -p builder -- verify-all-packs
RUN cargo build --release -p api

FROM debian:bookworm-slim AS runtime

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /src/RBackend/target/release/api /app/api
COPY --from=builder /src/RBackend/generated /app/RBackend/generated

ENV ROOT_PROJECT_ROOT=/app
ENV ROOT_ENV=production
ENV ROOT_API_ADDR=0.0.0.0:8000

EXPOSE 8000

CMD ["/app/api"]
