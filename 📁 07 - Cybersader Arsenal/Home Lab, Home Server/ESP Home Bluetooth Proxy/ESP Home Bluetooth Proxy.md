---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Wednesday, October 29th 2025, 7:41 pm
date modified: Wednesday, October 29th 2025, 8:10 pm
---

> [youtube.com > Add Bluetooth To Home Assistant With These EASY $10 ESP32 Bluetooth Proxies!](https://www.youtube.com/watch?v=_f9nbzjczSEs)

# Resources/Links

- [esphome.io > Bluetooth Proxy](https://esphome.io/components/bluetooth_proxy/)
- [bthome.io > BTHome: Open standard for broadcasting sensor data over Bluetooth LE](https://bthome.io/)

# Steps

## 0) Pre-requisites

- [Home Assistant](../Home%20Assistant/Home%20Assistant.md) Server
- A laptop with **Chrome/Edge** (WebSerial required)

> [!IMPORTANT] USB CABLE CHECK — MOST COMMON FAILURE
> Many micro-USB/USB-C cables are **charge-only** (no data lines).
> **Signs it’s charge-only:**
> • The browser flasher **doesn’t show any serial ports** to select.
> • **No new COM/tty device** appears in your OS when you plug the board in.
> **Fix:** Try another known-good **data** cable (preferably the one from a phone that supports file transfer) or swap ports.

---

## 1) Buy an ESP32

I bought this one:

[Amazon.com: ESP-WROOM-32 ESP32 ESP-32S Development Board…](https://www.amazon.com/dp/B07WCG1PLV) — **$8.99**

> [!TIP]
> For Bluetooth Proxy, stick to classic **ESP32-WROOM/DevKit V1**.
> Avoid **ESP32-C3/S2** for this specific “ready-made” flow.

---

## 2) Flash the ESP32 as a **Bluetooth Proxy** (no coding)

**Visual: data path**

```text
[Home Assistant] ⇄ Wi-Fi ⇄ [ESP32 Bluetooth Proxy] ⇄ BLE ⇄ [Your Lock/Sensors]
```

1. Plug ESP32 into your laptop **with a data-capable cable**.
2. Open the **ESPHome Ready-Made Projects** web flasher → choose **Generic ESP32 → Bluetooth Proxy**.
3. Click **Connect**, pick your **COM/tty** port, enter **Wi-Fi SSID/Password**, and **Install**.
4. After reboot, it joins your Wi-Fi.

> [!WARNING] If the serial port list is empty
>
> 1. **Swap the cable** (90% fix).
> 2. Try a different USB port (avoid flaky hubs).
> 3. Close any app that might “hold” the port (Arduino IDE/VS Code).
> 4. **Force bootloader:** hold **BOOT**, tap **EN/RST**, keep **BOOT** pressed for ~2–3s, then click **Connect** again.
> 5. **Drivers** (Windows especially):
>    • CP210x (Silicon Labs) or CH340/CH341 (WCH) — install the matching **USB-to-UART** driver.
> 6. On macOS/Linux, check `ls /dev/tty.*` (mac) or `dmesg | tail` (Linux) to see if a new device appears.

---

## 3) Add the proxy to **Home Assistant**

1. HA → **Settings → Devices & Services → Integrations**
2. You should see **ESPHome** → **Configure** → **Add** (or **Add Integration → ESPHome** and type the device’s IP).
3. Ensure the **Bluetooth Proxy** toggle on the device page is **ON**.

> [!TIP]
> Want OTA updates and logs later? Install the **ESPHome Add-on** in HA and “**adopt**” the device. Optional.

---

## 4) Place the proxy for best range

**ASCII layout**

```text
[Router]----(Wi-Fi)----[HA Host]
                       \
                        \(Wi-Fi)
                         \
                       [ESP32 Proxy]   ~5–15 ft    [Door/Lock]
                                     (BLE)  <---->
```

- Put the ESP32 **near the door/lock** (same room or adjacent wall).
- Avoid plugging it behind metal surfaces/enclosures.
- BLE indoors: plan on **~10–15 ft** reliable range through typical walls.

> [!TIP]
> Need more coverage? Add a **second** proxy in another outlet near the device.

---

## 5) August/Yale lock integrations

Pick one (or use both if you want cloud for key provisioning + local for daily control):

### A) Local (less cloud, faster)

- Add **Yale Access Bluetooth** in HA (uses your new proxy).
- It needs the lock’s **offline key**. Easiest flow: also add the **August** integration **once** to provision the key; then keep using the **local BLE** entities.

### B) Cloud (simplest)

- Add the **August** integration in HA, sign in (2FA).
- If you buy the **August Connect** bridge later, place it **~10–15 ft** from the lock; HA controls via August’s cloud.

> [!NOTE]
> Many people keep **August (cloud)** purely to **sync keys**, and use **Yale Access Bluetooth** for **local** control via the proxy.

---

## 6) Quick Diagnostics — “Is my cable data-capable?”

**Windows**

- Plug in → open **Device Manager** → **Ports (COM & LPT)**.
- You should see **Silicon Labs CP210x**, **USB-SERIAL CH340**, or similar with a **COM#**.
- If nothing appears: try another cable/port/driver.

**macOS**

- Open **Terminal** → run `ls /dev/tty.*` before and after plugging in.
- New entries like `/dev/tty.SLAB_USBtoUART` or `/dev/tty.wchusbserial*` = success.
- No change? Swap cable.

**Linux**

- Run `dmesg -w` then plug in; look for `cp210x` or `ch341` lines and a new `/dev/ttyUSB#` or `/dev/ttyACM#`.
- No new device? Cable/port/permissions issue (or missing driver on some distros).

> [!TIP]
> If the board powers on but **no new serial device** appears in the OS, it’s almost always the **cable**.

---

## 7) Test & Troubleshoot

- **Lock doesn’t show locally?**

  - In HA, confirm **ESPHome device → Bluetooth Proxy = ON**.
  - Move the proxy closer (try **5–10 ft**).
  - Kill the phone’s August/Yale app so it doesn’t monopolize BLE.
- **Proxy not discovered?**

  - Power-cycle ESP32.
  - Manually add via **ESPHome** and the device’s IP.
  - IoT VLANs: allow mDNS (UDP 5353) and ESPHome API (TCP 6053) within LAN.
- **Web flasher still sees nothing?**

  - Swap to a **known data** cable.
  - Install the **correct USB-UART driver**.
  - Use Chrome/Edge (no Firefox for WebSerial).

---

## 8) Handy automations

### 8.1 Lock when everyone leaves

```yaml
alias: Lock when house is empty
trigger:
  - platform: state
    entity_id: group.all_people
    to: not_home
action:
  - service: lock.lock
    target:
      entity_id: lock.front_door
mode: single
```

### 8.2 Nightly “left unlocked” reminder

```yaml
alias: Nightly unlocked door alert
trigger:
  - platform: time
    at: "23:00:00"
condition:
  - condition: state
    entity_id: lock.front_door
    state: unlocked
action:
  - service: notify.mobile_app_phone
    data:
      message: "Front door is still unlocked."
mode: single
```

### 8.3 Auto-lock after door closes

```yaml
alias: Auto-lock after close
trigger:
  - platform: state
    entity_id: binary_sensor.front_door_contact
    to: "off"  # closed
    for: "00:01:00"
action:
  - service: lock.lock
    target:
      entity_id: lock.front_door
mode: single
```

---

## TL;DR Checklist

- [ ] Use a **data-capable** USB cable (swap first if the port list is empty)
- [ ] Flash **Generic ESP32 → Bluetooth Proxy** via web flasher
- [ ] Add device in HA (ESPHome integration)
- [ ] Place proxy **near door** (5–15 ft)
- [ ] Add **Yale Access Bluetooth** (local) and/or **August** (cloud for keys)
- [ ] Optional: install ESPHome add-on → adopt device for OTA updates

---

Want me to tailor the driver/cable notes to **Windows vs macOS** with screenshots or add a mini “How to spot a data cable” photo panel?
