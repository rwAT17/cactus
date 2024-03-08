window.BENCHMARK_DATA = {
  "lastUpdate": 1709911569434,
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
      },
      {
        "commit": {
          "author": {
            "email": "peter.somogyvari@accenture.com",
            "name": "Peter Somogyvari",
            "username": "petermetz"
          },
          "committer": {
            "email": "petermetz@users.noreply.github.com",
            "name": "Peter Somogyvari",
            "username": "petermetz"
          },
          "distinct": true,
          "id": "21fd747e37d20e2427ad6e86b6d5d15435fbc660",
          "message": "refactor(connector-fabric): deployContractGoSourceV1 uses Fabric v2.5.6\n\nThe deployContractGoSourceV1() method now assumes that the underlying\ntest ledger is Fabric 2.5 (current LTS).\n\nThis will allow us to upgrade the contracts that are being used by the\nSupply chain app to Fabric 2.x from Fabric 1.x which will then implicitly\nfix a large number of other issues at the same time.\n\nThis change is part of laying the foundation for that follow-up work.\n\nPrimary changes:\n-----------------\n\n1. Added a new, standalone utility function to deploy go source contracts\nwith the name of `deployContractGoSourceImplFabricV256()`.\n2. The code of this function was derived from the original Fabric v1\ncompatible deployContractGoSourceV1 method of the Fabric connector.\n3. 2 organizations are supported for deployment via the endpoint.\n4. The endpoint is only used by the supply chain app example at the moment\nand there is no test coverage of it due to dependencies that will be\nresolved in a follow-up pull request that is coming soon.\n\nSecondary changes:\n1. Also extracted the SSH execution function from the fabric connector\ninto a standalone function that can be used without having to have a\nFabric connector instance created first.\n2. Also extracted/abstracted some logic into a utility function for\nsimilar reasons that is used to replace logging configuration environment\nvariables in shell commands that we use to perform contract deployment\nonto the Fabric test ledgers.\n\nDepends on #3054\n\nSigned-off-by: Peter Somogyvari <peter.somogyvari@accenture.com>",
          "timestamp": "2024-03-07T10:23:49-08:00",
          "tree_id": "88182f18cecf9098fc401d25df6bd5870af5bcb8",
          "url": "https://github.com/rwat17/cactus/commit/21fd747e37d20e2427ad6e86b6d5d15435fbc660"
        },
        "date": 1709911567732,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "cmd-api-server_HTTP_GET_getOpenApiSpecV1",
            "value": 623,
            "range": "±1.63%",
            "unit": "ops/sec",
            "extra": "176 samples"
          },
          {
            "name": "cmd-api-server_gRPC_GetOpenApiSpecV1",
            "value": 384,
            "range": "±1.74%",
            "unit": "ops/sec",
            "extra": "182 samples"
          }
        ]
      }
    ]
  }
}