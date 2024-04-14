<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/altmp/ragemp-altv-bridge">
    <img src="https://altv.mp/img/branding/logo_green_with_label.svg" alt="Logo" width="400" height="100">
  </a>

<h3 align="center">RAGEMP - alt:V Multiplayer bridge</h3>

  <p align="center">
    A bridge that enables a swift transition from the RAGE Multiplayer platform to alt:V Multiplayer.
    <br />
    <a href="https://docs.altv.mp/"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://majestic-rp.ru">View Demo</a>
    ·
    <a href="https://github.com/altmp/ragemp-altv-bridge/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/altmp/ragemp-altv-bridge/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#recommended-settings">Usage</a></li>
    <li><a href="#incompatible-systems">Usage</a></li>
    <li><a href="#self-building">Self-Building</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

Over the past year, `alt:V Multiplayer` has been developing at a rapid pace, and there are no signs of it slowing down. In collaboration with `Majestic RP`, `alt:V Multiplayer` has developed a bridge that enables a swift transition from the `RAGE Multiplayer` platform to `alt:V Multiplayer`. This project provides a set of APIs that mimic the `RAGE Multiplayer` API.



<!-- GETTING STARTED -->
## Getting Started

Next we will explain how to install the bridge in alt:V, as well as explain the nuances that exist

### Prerequisites

Before installation, ensure that you have `alt:v` client and server modules installed on your system. Visit [altV Official Site](https://altv.mp/) for more details:

1. Create empty folder and install alt:V server using `npx altv-pkg dev` command inside new folder. (We recommend using the `dev` version for development purposes. And `npx altv-pkg release` for production purposes.)

2. Create `resources` folder inside your project folder.

### Installation


1. **Pre-requisites**: Before installation, ensure that you have `alt:v` client and server modules installed on your system. Visit [altV Official Site](https://altv.mp/) for more details.
   
2. **Download**: Download the latest version of the bridge from the [Releases](https://github.com/altmp/ragemp-altv-bridge/releases) page.

3. **Installation**:

    - Extract folder to resources directory of your `alt:V` server. (So it should look like `myproject/resources/bridge`)
    - Create `server.toml` file, and adjust settings to your needs. Visit [alt:V Documentation](https://docs.altv.mp/articles/configs/server.html) for more details.
    - For bridge to work, you need to add `bridge` resource to your server configuration file `server.toml` by including a line like:
      ```toml
      modules = [
          "js-module"
      ]

      resources = [    
          "dlc_resources/*", # aka client_packages/game_resources/dlcpacks folder
          "game_resources",  # aka client_packages/game_resources folder (common, raw, x64 and etc)

          "bridge", # Adding bridge resource

          "client_resources", # aka client_packages folder
          "server_resources" # aka packages/myserver folder
      ]
      ```

4. **Start the Server**: Run your `alt:V` server as usual and ensure that the project module loads correctly.


<!-- SETTINGS-->
## Recommended settings
We recommended adding this settings in server.toml for best performance
```toml
  mtu=1000 # Maximum safe value is 1200. Setting higher values may cause network issues.
  highThreadPriority = true # Forces the server to prioritize CPU resources for itself.
  hashClientResourceName = true # Hashes the resource names sent to the client.

  disableOptionalProps = true # Disables GTA:O extra world objects. (May cause FPS drops for high load servers)

  # Streamer settings, many high load servers in RAGEMP use ~200 distance for streaming. Majestic uses 300 in their server.
  streamingDistance = 300.0
  migrationDistance = 200.0
  mapCellAreaSize = 100


  sendPlayerNames = false # Disables sending player names to the client. (Most RAGEMP servers use their own name tags system)
  spawnAfterConnect = true # RAGEMP spawns players after they connect, alt:V don't spawn unless you do it manually. This setting will spawn players after they connect.
  connectionQueue = false # Disables connection queue. (RAGEMP doesn't have connection queue)

  # Limiting streamed entities. (RAGEMP has a limit of 200 streamed peds in total. Play around with these values to find the best value for your server)
  [maxStreamedEntities]
  player = 200
  vehicle = 128
  ped = 50
  object = 256

  # Disables collision checks so client sided natives like setNoCollision will work.
  [antiCheat]
  collision = false
```

<!-- INCOMPATIBLE SYSTEMS -->
## Incompatible Systems

There are some systems that is impossible to port from `RAGE Multiplayer` to `alt:V` due to the differences in the platforms. Some of these systems include:

- **Voice Chat**: `RAGE Multiplayer` uses different system for voice chat, while `alt:V` uses a channel voice chat system. To port voice chat, you will need to rewrite the voice chat system from scratch. Visit [alt:V Documentation](https://docs.altv.mp/articles/voice.html) for more details.
- **Weapon damage system**: `RAGE Multiplayer` uses different weapon damage system, while `alt:V` uses a different system. You will need to rewrite the weapon damage system from scratch. (In `alt:V` it is very similar to `RAGE Multiplayer`. Visit [alt:V Documentation](https://docs.altv.mp/js/api/alt-server.IServerEvent.html#_altmp_altv_types_alt_server_IServerEvent_weaponDamage) for more details.
- **CEF Textures**: `RAGE Multiplayer` in March 2024 added `http://game-textures/put` endpoint to allow CEF textures to be loaded into game, which is currently not supported in `alt:V`.

To rewrite this project for another platform, you will need deep understanding of the target platform’s API and possibly a complete overhaul of the networking code.



<!-- SELF-BUILDING -->
## Self-Building

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/altmp/ragemp-altv-bridge
   cd ragemp-altv-bridge
   npm install
    ```

2. **Build the Project**:
   ```bash
   npm run build
   ```

3. **Copy the Output**:
   - Copy the `bindings/dist` folder to your `alt:V` server bridge resource folder.


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.


<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [alt:V Documentation](https://docs.altv.mp/)
* [alt:V External voice chat](https://docs.altv.mp/articles/external_voice_server.html)
* [alt:V server.toml settings](https://docs.altv.mp/articles/configs/server.html)
* [alt:V CDN](https://docs.altv.mp/articles/cdn.html)


<p align="right">(<a href="#readme-top">back to top</a>)</p>