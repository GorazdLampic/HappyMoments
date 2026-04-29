# HappyMoments - Android Testing Guide

## Quick Start (3 Steps)

### Step 1: Generate Icons
1. Open `web/generate-icons.html` in your browser (just double-click it)
2. Click "Download All Icons"
3. Save all icons to the `web/icons/` folder

### Step 2: Start the Server
**Option A - Double-click:**
- Double-click `start-server.bat`

**Option B - Command line:**
```
cd C:\Users\LokalniAdmin\Projects\HappyMoments
python serve.py
```

You'll see something like:
```
  Local URL:   http://localhost:8080
  Network URL: http://192.168.1.100:8080
```

### Step 3: Open on Android
1. Make sure your phone is on the **same WiFi** as your computer
2. Open **Chrome** on your Android phone
3. Type the **Network URL** from Step 2 (e.g., `http://192.168.1.100:8080`)
4. The app should load!

---

## Installing as an App (PWA)

Once the app is open in Chrome:

1. Tap the **menu** (three dots in top-right corner)
2. Tap **"Add to Home screen"** or **"Install app"**
3. Tap **"Add"** to confirm
4. The app icon will appear on your home screen!

Now you can use HappyMoments like a native app.

---

## Troubleshooting

### "Site can't be reached" on phone
- Make sure phone and computer are on the same WiFi network
- Check Windows Firewall isn't blocking Python
- Try disabling VPN if you have one

### Finding your computer's IP
1. Press `Win + R`, type `cmd`, press Enter
2. Type `ipconfig` and press Enter
3. Look for "IPv4 Address" under your WiFi adapter (usually starts with 192.168.x.x)

### "Install app" option not showing
- Make sure you're using Chrome (not other browsers)
- The page must load successfully first
- Try refreshing the page

### Icons not loading
- Make sure you generated and saved icons to `web/icons/` folder
- Icon files should be named: `icon-72.png`, `icon-96.png`, `icon-128.png`, `icon-144.png`, `icon-152.png`, `icon-192.png`, `icon-384.png`, `icon-512.png`

---

## Alternative: USB Debugging

If WiFi doesn't work, you can use USB:

1. Enable "Developer options" on your phone
2. Enable "USB debugging" in Developer options
3. Connect phone to computer via USB
4. Open Chrome on computer, go to `chrome://inspect`
5. Your phone should appear - click "Port forwarding"
6. Add: `8080` -> `localhost:8080`
7. Now on your phone, open Chrome and go to `http://localhost:8080`

---

## Files Created

```
HappyMoments/
├── web/
│   ├── index.html          (Updated with PWA support)
│   ├── manifest.json       (NEW - PWA manifest)
│   ├── sw.js               (NEW - Service worker)
│   ├── generate-icons.html (NEW - Icon generator)
│   └── icons/
│       ├── icon.svg        (NEW - Source icon)
│       └── icon-*.png      (Generate these!)
├── serve.py                (NEW - Python server)
├── start-server.bat        (NEW - Windows launcher)
└── ANDROID-TESTING.md      (This file)
```

---

## Enjoy HappyMoments on your phone!
