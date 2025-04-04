---
permalink:
aliases: []
tags: []
publish: true
date created: Friday, March 29th 2024, 11:03 pm
date modified: Friday, April 4th 2025, 7:49 pm
---

# Links

- [3 Ways to Start Your Own Plex Server - YouTube](https://www.youtube.com/watch?v=XKDSld-CrHU)
- [Important information for users running Plex Media Server on Nvidia Shield devices - Announcements - Plex Forum](https://forums.plex.tv/t/important-information-for-users-running-plex-media-server-on-nvidia-shield-devices/883484 "Important information for users running Plex Media Server on Nvidia Shield devices - Announcements - Plex Forum")
- [Prowlarr](https://prowlarr.com/ "Prowlarr")
- [Clients | Jellyfin](https://jellyfin.org/downloads/clients/?platform=Roku "Clients | Jellyfin")
- [Jellyfin | Open Source Alternative to Plex, Emby, Netflix](https://www.opensourcealternative.to/project/jellyfin "Jellyfin | Open Source Alternative to Plex, Emby, Netflix")
- [Must have Plex addons : r/PleX](https://www.reddit.com/r/PleX/comments/1bwfffx/must_have_plex_addons/ "Must have Plex addons : r/PleX")
- [Open Source Home Theater Software | Kodi](https://kodi.tv/ "Open Source Home Theater Software | Kodi")
- [Plex Pass | Plex](https://www.plex.tv/plex-pass/ "Plex Pass | Plex")
- [Open source alternatives to Emby](https://www.opensourcealternative.to/alternativesto/emby "Open source alternatives to Emby")
- [2 Open Source Alternatives to Plex](https://www.opensourcealternative.to/alternativesto/plex "2 Open Source Alternatives to Plex")
- [Build your own DVR with Plex Server! #plex #homeserver #antenna - YouTube](https://www.youtube.com/watch?v=0HxtccUFtm8)
- [The Ultimate Guide to Configuring Live TV & DVR with Plex! - YouTube](https://www.youtube.com/watch?v=Q5okoyPewyU) 
- [disable this plex setting RIGHT NOW - YouTube](https://www.youtube.com/watch?v=RENjSPXJUdg)
- [The ULTIMATE Budget Jellyfin Server - YouTube](https://www.youtube.com/watch?v=WCDmHljsinY)
- [Time to UNSUBSCRIBE from Disney+, Netflix, etc! - YouTube](https://www.youtube.com/watch?v=RZ8ijmy3qPo)
- [Better than Disney+: Jellyfin on my NAS - YouTube](https://www.youtube.com/watch?v=4VkY1vTpCJY)
- [Piracy Doesn’t Pay - YouTube](https://www.youtube.com/watch?v=SPWiCm5tT7Y)

# Plex Addons

- [Plex and the *ARR stack |](https://sysblob.com/posts/plex/)
- [Servarr | Servarr Wiki](https://wiki.servarr.com/)
- [Prowlarr](https://prowlarr.com/)
- [Must have Plex addons : r/PleX](https://www.reddit.com/r/PleX/comments/1bwfffx/must_have_plex_addons/)
- [Streaming, Plex, and Arr's | RapidSeedbox — Help Desk](https://help.rapidseedbox.com/en/collections/615805-streaming-plex-and-arr-s)
- [Plex | ARR Wiki](https://arr.passthebits.com/en/plex)
- [The Ultimate Plex Software Stack - Arrs and More! : r/PleX](https://www.reddit.com/r/PleX/comments/1arzr1y/the_ultimate_plex_software_stack_arrs_and_more/)
- [Ravencentric/awesome-arr: A collection of *arrs and related stuff.](https://github.com/Ravencentric/awesome-arr)
- [Radarr/Sonarr Settings - Kometa Wiki](https://metamanager.wiki/en/develop/files/arr/)
- [DonMcD/ultimate-plex-stack: This comprehensive Plex stack configuration simplifies the setup for your media server, integrating Plex, Radarr, Sonarr, Prowlarr, and more for seamless movie and TV show streaming with enhanced management and automation features, including VPN support, subtitle management and much more!](https://github.com/DonMcD/ultimate-plex-stack)
- [Overseerr](https://overseerr.dev/)
- 

# Plex vs Jellyfin

- [(19) The open source alternative to my sponsor - Jellyfin vs Plex - YouTube](https://www.youtube.com/watch?v=jKF5GtBIxpM&list=WL&index=98&t=25s)
- 

![600](_attachments/file-20241223193904241.png)

## Jellyfin

> [!tldr] It's open source and has some privacy and advanced benefits, but it lacks the convenience and sharability that I need for the time being

- [Jellyfin Feature Requests](https://features.jellyfin.org/?view=most-wanted)

- Client Options that I care about:
	- [Clients | Jellyfin](https://jellyfin.org/downloads/clients/all)
	- Android TV
	- Roku
	- Android

## Plex

- Client options:
	- [Best Media Streaming Devices | Live streaming apps powered by Plex](https://www.plex.tv/apps-devices/)
	- Apple TV
	- Fire TV
	- Google TV
	- Roku
	- Smart TVs
	- Android 
	- iOS

- Pros
	- Easy system to share with people
- Current issues:
	- Offline download stinks
	- Some technical privacy issues at times
- Cons
	- Costs money for plex pass for people who want to use your library

# Plex on TrueNAS Scale

- Docs
	- [Plex | TrueNAS Documentation Hub](https://www.truenas.com/docs/truenasapps/stableapps/plexapp/)

## 1) Plex Account

- Sign up with a Plex account - [Plex plex.tv › home › sign up Sign Up | Plex](https://www.plex.tv/sign-up/ "") 

## 1.a) First time in TrueNAS?

Set a pool for applications to use if not already assigned.
- You can use either an existing pool or [create a new one](https://www.truenas.com/docs/scale/scaletutorials/storage/createpoolwizard/). TrueNAS creates the **ix-apps** (hidden) dataset in the pool set as the application pool. This dataset is internally managed, so you cannot use this as the parent when you create required application datasets.

## 2) Create Plex-Related "Datasets" in TrueNAS

- Go to **Datasets** and select the pool or dataset where you want to place the dataset(s) for the app. For example, _/tank/apps/appName_.
    
> [!important] 
> Plex uses 2 main storage volumes: 
> 1) **data** to use as the Plex data directory for database and metadata storage, and 
> 2) **config** for Plex application configuration storage.
>    
> - For **log data**, you should just use a temporary directory. 
> - **Transcode data** is also not useful or meant for persistent storage, so using a temporary directory is a better option.


> [!info]- [Creating Datasets for Apps](https://www.truenas.com/docs/truenasapps/stableapps/plexapp/ "Plex | TrueNAS Documentation Hub")
> 
> When creating datasets for apps follow these steps:
> 
> 1. Go to **Datasets**, select the location for the parent dataset if organizing required datasets under a parent dataset, then click **Add Dataset**. For example, select the root dataset of the pool, and click **Add Dataset** to create a new parent called _apps_ or _appName_*, where _appName_ is the name of the app.
>     
>     Do not create the app datasets under the ix-applications or ix-apps dataset.
>     
> 2. Enter the name of the dataset, then select **Apps** as the **Dataset Preset**. Creating the parent dataset with the preset set to **Generic** causes permissions issues when you try to create the datasets the app requires with the preset set to **Apps**.
>     
> 3. Click **Save**. Return to dataset creation when prompted rather than configuring ACL permissions.
>     
>     You can set up permissions (ACLs) for a dataset after adding it by selecting **Go to ACL Manager** to open the **Edit ACL** screen, or wait and use the app Install wizard ACL settings to add permissions. You can also edit permissions after installing the app using either method.
>     
> 4. Select the parent dataset and then click **Create Dataset** to open the **Add Dataset** screen again.
>     
> 5. Enter the name of a dataset required for the app, such as _config_, select **Apps** as the **Dataset Preset**, and then click **Save**. When prompted, return to creating datasets rather than setting up ACL permissions.
>     
> 6. Repeat for remaining datasets required for the app.
>     
> 
> You can set up the permissions (ACLs) for these datasets after adding them using the **Edit ACL** screen, or wait and use the **Install Plex** wizard ACL settings to add permissions. You can also edit permissions after using either method.

## 3) Installing Plex to TrueNAS

> [!note] You can have multiple deployments of the same app (for example, two or more from the **stable** or **enterprise** trains, or a combination of the **stable** and **enterprise** trains).

Go to **Apps**, click on **Discover Apps**, and locate the app widget by either scrolling down to it or begin typing the name into the search field. 

Select the timezone where your TrueNAS system is located. Begin typing the location into the **Timezone** field to filter the list until the location shows, then select it.

While logged into your Plex account, go to the [Plex **Claim Code** web page](https://www.plex.tv/claim/) to copy the **Claim Code** string provided by Plex, and then paste it into the TrueNAS **Install Plex** wizard **Claim Token** field. This authentication token provides TrueNAS access to your Plex account.

### 3.a) Network Settings & Devices

Next, either accept the default values shown or enter the IP addresses for local network connections (Ethernet or WiFi routers) you want in your Plex network. See [Setting Up Local Network](https://www.truenas.com/docs/truenasapps/stableapps/plexapp/#setting-up-local-network) below for more information.

You can add devices and additional environment variables, but this is not required to deploy the app. For more information, see [Adding Devices](https://www.truenas.com/docs/truenasapps/stableapps/plexapp/#adding-devicess) below.

> [!important]
> The app does not require configuring advanced DNS options. Accept the default settings or click **Add** to the right of **DNS Options** to enter the option name and value.

Click Install!

## 4) Access Plex

- Once deployed, go to the app and click the `Web UI` button to get redirect and attach it
- If that doesn't work, you can add `/manage` to the end of the URL from the app settings for Plex in TrueNAS Apps

# Jellyfin on TrueNAS Scale

- [github.com > homelab/media/jelly-compose.yaml at main · TechHutTV/homelab](https://github.com/TechHutTV/homelab/blob/main/media/jelly-compose.yaml)
- 

- Docs & Guides
	- [youtube.com > my NEW Proxmox Media Server - Full Walkthrough Guide Pt.2 (Jellyfin](https://www.youtube.com/watch?v=Uzqf0qlcQlo)
	- [github.com > media-stack/README.md at main · navilg/media-stack](https://github.com/navilg/media-stack/blob/main/README.md)
	- [jellyfin.org > TrueNAS SCALE | Jellyfin](https://jellyfin.org/docs/general/installation/truenas/)
	- 

## 1) Create Jellyfin-Related "Datasets" in TrueNAS

- Go to **Datasets** and select the pool or dataset where you want to place the dataset(s) for the app. For example, _/tank/apps/appName_.
    
> [!important] 
> Jellyfin uses 3 main storage volumes.  
> Create a dataset for each.
> 1. cache
> 2. config
> 3. cache/transcodes

> [!info]- [Creating Datasets for Apps](https://www.truenas.com/docs/truenasapps/stableapps/plexapp/ "Plex | TrueNAS Documentation Hub")
> 
> When creating datasets for apps follow these steps:
> 
> 1. Go to **Datasets**, select the location for the parent dataset if organizing required datasets under a parent dataset, then click **Add Dataset**. For example, select the root dataset of the pool, and click **Add Dataset** to create a new parent called _apps_ or _appName_*, where _appName_ is the name of the app.
>     
>     Do not create the app datasets under the ix-applications or ix-apps dataset.
>     
>     
> 2. Enter the name of the dataset, then select **Apps** as the **Dataset Preset**. Creating the parent dataset with the preset set to **Generic** causes permissions issues when you try to create the datasets the app requires with the preset set to **Apps**.
>     
> 3. Click **Save**. Return to dataset creation when prompted rather than configuring ACL permissions.
>     
>     You can set up permissions (ACLs) for a dataset after adding it by selecting **Go to ACL Manager** to open the **Edit ACL** screen, or wait and use the app Install wizard ACL settings to add permissions. You can also edit permissions after installing the app using either method.
>     
> 4. Select the parent dataset and then click **Create Dataset** to open the **Add Dataset** screen again.
>     
> 5. Enter the name of a dataset required for the app, such as _config_, select **Apps** as the **Dataset Preset**, and then click **Save**. When prompted, return to creating datasets rather than setting up ACL permissions.
>     
> 6. Repeat for remaining datasets required for the app.
>     
> 
> You can set up the permissions (ACLs) for these datasets after adding them using the **Edit ACL** screen, or wait and use the **Install Plex** wizard ACL settings to add permissions. You can also edit permissions after using either method.

## 2) Installing Jellyfin to TrueNAS

> [!note] You can have multiple deployments of the same app (for example, two or more from the **stable** or **enterprise** trains, or a combination of the **stable** and **enterprise** trains).

Go to **Apps**, click on **Discover Apps**, and locate the app widget by either scrolling down to it or begin typing the name into the search field. 

Select the timezone where your TrueNAS system is located. Begin typing the location into the **Timezone** field to filter the list until the location shows, then select it.

### 2.a) Published Server URL & Environment Variables

You can accept the defaults in the **Jellyfin Configuration** settings, or enter the settings you want to use.

You can enter a **Published Server URL** for use in UDP autodiscovery, or leave it blank.

If needed, click **Add** to define **Additional Environment Variables**, see [Configuration](https://jellyfin.org/docs/general/administration/configuration/) for options.

### 2.b) Network Settings & Devices

Select **Host Network** under **Network Configuration** if using [DLNA](https://jellyfin.org/docs/general/networking/dlna/), to bind network configuration to the host network settings. Otherwise, leave **Host Network** unselected.

![](_attachments/file-20250404194425902.png)

You can accept the default port number in **WebUI Port**, which is **30013**.

You can change this to port **8096**. Most Jellyfin clients have built-in scanning features that look for port **8096** by default.

Refer to the TrueNAS [default port list](https://www.truenas.com/docs/references/defaultports/) for a list of assigned port numbers.

### 2.c) Storage Settings

Jellyfin requires three app storage datasets for:

1. Jellyfin Config Storage
2. Jellyfin Cache Storage
3. Jellyfin Transcodes Storage

Solid state storage is recommended for config, cache, and transcode storage. Do not use datasets located on spinning disks where your media storage/libraries are found for these datasets to avoid slowdowns.

You can install Jellyfin using the default setting **ixVolume (dataset created automatically by the system)** or use the host path option with datasets [created before installing the app](https://jellyfin.org/docs/general/installation/truenas/#datasets--jellyfin).

![](_attachments/file-20250404194647653.png)

Select **Host Path (Path that already exists on the system)** to browse to and select the datasets.

![Configure Storage Host Paths](https://jellyfin.org/assets/images/install-truenas-14-15ab514cdc50e7c78dc03d4147e7757b.png)

For **Jellyfin Transcodes Storage**, in **Type**, select:

- **Host Path (Path that already exists on the system)** to use an existing dataset created on the system
- **ixVolume (dataset created automatically by the system)** to let SCALE create the dataset
- **Temporary (Temporary directory created on the disk)** to use a temporary storage directory created somewhere on the storage pool you set for the Apps system
- **tmpfs (Temporary directory created on the RAM)** to use a temporary storage directory created on the system RAM

It is recommended to link the transcode directory to a location with decent amount of available storage. Transcodes can take up a lot of space depending on the type of content that is being transcoded. If there's not enough storage here, you will run into playback issues when a transcode doesn't have space to continue being written out.

#### Mounting Additional Storage

Click **Add** next to **Additional Storage** to add the media library storage path(s) on your system.

![Additional Storage](https://jellyfin.org/assets/images/install-truenas-15-a9fc18c38209e67252830b6438cb684e.png)

Select **Host Path (Path that already exists on the system)** or **SMB/CIFS Share (Mounts a volume to a SMB share)** in **Type**. You can select **iXvolume (Dataset created automatically by the system)** to create a new library dataset, but this is not recommended.

Mounting an SMB share allows data synchronization between the share and the app. The SMB share mount does not include ACL protections at this time. Permissions are currently limited to the permissions of the user that mounted the share. Alternate data streams (metadata), finder colors tags, previews, resource forks, and MacOS metadata are stripped from the share along with filesystem permissions, but this functionality is undergoing active development and implementation planned for a future TrueNAS SCALE release.

- Note that if you want to take advantage of Jellyfin's built-in feature of **real-time media scanning**, you need to mount your media directly with a **Host Path** as SMB connections do not support this feature.

For all types, enter a **Mount Path** to be used within the Jellyfin container.

- For example, the local **Host Path** /mnt/tank/video/movies could be assigned the **Mount Path** /media/movies.
    - With this example, you would browse to `/media/movies` in Jellyfin to see the contents of `/mnt/tank/video/movies` on your SCALE server.

> [!info]- Additional Storage Fields
> |Type|Field|Description|
> |---|---|---|
> |All|Mount Path|The virtual path to mount the storage within the container.|
> |Host Path|Host Path|The local path to an existing dataset on the System.|
> |ixVolume|Dataset Name|The name for the dataset the system creates.|
> |SMB Share|Server|The server for the SMB share.|
> |SMB Share|Share|The name of the share.|
> |SMB Share|Domain (Optional)|The domain for the SMB share.|
> |SMB Share|Username|The user name used to access the SMB share.|
> |SMB Share|Password|The password for the SMB share user.|
> |SMB Share|Size (in Gi)|The quota size for the share volume. You can edit the size after deploying the application if you need to increase the storage volume capacity for the share.|

### 2.d) Resource Configuration Settings

![Resource Limits](https://jellyfin.org/assets/images/install-truenas-16-dc290fc47acdebb6d4f782cc8f3e36ee.png)

You can customize limits on the CPU and memory allocated to the container Jellyfin will reside in.

- **CPUs** expects a value in **number of threads** to assign as a max CPU thread limit.
    - You should set this option to the number of threads your CPU contains.
    - [Refer here for reasonable CPU limits based on your SCALE server's CPU](https://jellyfin.org/docs/general/administration/hardware-selection#cpu)
- **Memory (in MB)** expects a value in **megabytes**.
    - The default is **4096** which means the container will be limited to 4GB of RAM usage.
    - To calculate a value in gigabytes, use this formula where **X** is a number in MB: `X * 1024`
    - [Refer here for sensible RAM limits for your Jellyfin server](https://jellyfin.org/docs/general/administration/hardware-selection#system-memory-ram)
- The max limit you can assign to either limit depends on your SCALE server's specs.

For the GPU Configuration, check the **Passthrough available (non-NVIDIA) GPUs** option if you need to pass a GPU device for hardware acceleration use with Jellyfin.

- If you have an NVIDIA GPU, [please read this](https://jellyfin.org/docs/general/installation/truenas/#nvidia-gpus-on-scale-v2410).

### Finalizing Install

Click **Install**.

A container launches with root privileges to apply the correct permissions to the Jellyfin directories. Afterward, the Jellyfin container runs as a non-root user (default: 568). Configured storage directory ownership is changed if the parent directory does not match the configured user.

The system opens the **Installed Applications** screen with the Jellyfin app in the **Deploying** state. When the installation completes, it changes to **Running**.

![App Page](https://jellyfin.org/assets/images/install-truenas-17-bbcc437a38e3ba84d17d19de3ca6befa.png)

Click the **Web UI** button on the **Application Info** widget to open the Jellyfin web initial setup wizard to set up your admin account and begin administering libraries.

![Jellyfin Web Portal](https://jellyfin.org/assets/images/install-truenas-18-62e2c2f8da5da44e6d8db572940b730e.png)

## 3) Access Jellyfin

- Once deployed, go to the app and click the `Web UI` button to get redirect and attach it
- If that doesn't work, you can add `/manage` to the end of the URL from the app settings for Plex in TrueNAS Apps
