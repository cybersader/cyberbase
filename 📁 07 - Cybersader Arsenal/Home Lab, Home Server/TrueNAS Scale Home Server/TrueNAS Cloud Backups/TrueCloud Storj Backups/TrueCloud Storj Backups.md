---
aliases: 
tags: 
publish: true
permalink:
title:
date created: Thursday, June 19th 2025, 10:38 am
date modified: Sunday, April 26th 2026, 6:30 pm
---
- [youtube.com > TrueNAS TrueCloud: Affordable Secure Cloud Backup With Storj](https://www.youtube.com/watch?v=xSuG9CUaoCc)
	- Good tutorial for newer versions of TrueNAS

## Troubleshooting Log

### `403 Forbidden for url: https://gateway.storjshare.io/?attribution`
- Hit this when first creating a TrueCloud Backup task against Storj.
- Root cause: the Storj S3 gateway rejects the `PUT /?attribution` call rclone makes on first write. Triggered by a stale/wrong S3 credential state or a bucket whose attribution was already set by a different client.
- Fix that worked: regenerate fresh S3 credentials with full perms (Read/Write/List/Delete) and target a clean bucket.

### `InvalidAccessKeyId: The Access Key Id you provided does not exist in our records`
- Got this after the attribution error, while testing the credential.
- Cause in my case: had generated an **Access Grant** in Storj and tried to paste pieces of it into TrueNAS's `Access Key ID` / `Secret Access Key` fields. Wrong access type.
- TrueNAS's "Storj" provider (at least in this version) is a pre-configured S3 gateway client under the hood — not libuplink. So it needs **S3 Credentials** from Storj, not an Access Grant.

### Working setup
- In Storj console: New Access → choose **S3 Credentials** (not Access Grant) → Read/Write/List/Delete → run wizard fully to the final screen → copy `Access Key`, `Secret Key`, `Endpoint` (one-time reveal, save immediately).
- In TrueNAS: Credentials → Backup Credentials → Add → Provider = **Storj** → paste Access Key into `Access Key ID`, Secret into `Secret Access Key`. Endpoint is handled by the provider, no need to set it manually.
- Point the TrueCloud Backup task at a clean bucket created under the new credentials.

### Notes
- Access Grant ≠ Access Key. Access Grant is one long base58 string; Access Key is short. They are not interchangeable.
- Storj S3 credentials only display once. If the final wizard screen is closed before copying, generate a new set — they cannot be re-revealed.
- `?attribution` is only called on first write to a bucket under a given credential. Reusing a bucket previously written to by a different account/partner ID is a recurring source of this 403.
