window.BENCHMARK_DATA = {
  "lastUpdate": 1708338658231,
  "repoUrl": "https://github.com/rwat17/cactus",
  "entries": {
    "Benchmark": [
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "petermetz@users.noreply.github.com",
            "name": "Peter Somogyvari",
            "username": "petermetz"
          },
          "distinct": true,
          "id": "38e5f6d0a0e7d582cb27d4266db1696f010627a7",
          "message": "build(deps): bump undici from 5.26.2 to 5.28.3\n\nBumps [undici](https://github.com/nodejs/undici) from 5.26.2 to 5.28.3.\n- [Release notes](https://github.com/nodejs/undici/releases)\n- [Commits](https://github.com/nodejs/undici/compare/v5.26.2...v5.28.3)\n\n---\nupdated-dependencies:\n- dependency-name: undici\n  dependency-type: direct:production\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2024-02-18T19:56:48-08:00",
          "tree_id": "6dd8e218bf754c848b3e86090bbfd6b41805ff97",
          "url": "https://github.com/rwat17/cactus/commit/38e5f6d0a0e7d582cb27d4266db1696f010627a7"
        },
        "date": 1708338655838,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "cmd-api-server_HTTP_GET_getOpenApiSpecV1",
            "value": 611,
            "range": "±1.64%",
            "unit": "ops/sec",
            "extra": "175 samples"
          },
          {
            "name": "cmd-api-server_gRPC_GetOpenApiSpecV1",
            "value": 384,
            "range": "±1.40%",
            "unit": "ops/sec",
            "extra": "181 samples"
          }
        ]
      }
    ]
  }
}