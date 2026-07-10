// Single source of truth for the "Room" and "Furniture" visualization modes
// on the Artwork Detail page.
//
// HOW TO ADD YOUR REAL PHOTOS
// ----------------------------------------------------------------------------
// 1. Drop your images into:
//      public/rooms/living-room.jpg
//      public/rooms/bedroom.jpg
//      public/rooms/office.jpg
//      public/rooms/hallway.jpg
//
//      public/furniture/sofa.png
//      public/furniture/bed.png
//      public/furniture/desk.png
//      public/furniture/dining-table.png
//
//    (Vite serves anything in /public at the site root, so a file at
//    public/rooms/living-room.jpg is reachable at /rooms/living-room.jpg —
//    that's exactly the `image` path used below. You can use .jpg/.png/.webp,
//    just update the extension in the path if it differs.)
//
// 2. That's it — RoomView / FurnitureView read from these arrays, so the new
//    photos show up automatically with no other code changes.


//CALIBRATION
// ----------------------------------------------------------------------------
// `calibration` is what makes placement pixel-accurate instead of estimated.
// Once you share a photo, I fill this in by inspecting it directly:
//
//   naturalWidth / naturalHeight  — the photo file's real pixel dimensions
//   referenceTopPct / referenceBottomPct
//       — where the reference object (e.g. the doorway) starts and ends,
//         each as a fraction (0–1) of the photo's own height
//   hangCenterXPct   — horizontal center of the empty wall space, as a
//                      fraction (0–1) of the photo's width
//   hangBottomPct    — where the artwork's bottom edge should sit, as a
//                      fraction (0–1) of the photo's height
//
// All four "Pct" values are measured against the PHOTO itself, not the
// screen — so they're correct on any device once set, no separate mobile
// handling needed. Leave `calibration: null` and the view falls back to a
// generic estimate (what it's doing today).

//
// HOW THE SCALING WORKS
// ----------------------------------------------------------------------------
// Each entry has a `referenceHeightCm`: the real-world height of something
// already visible in that photo (a doorway, a sofa back, a desk). The
// artwork's own dimensions_h_cm are compared against that reference to size
// it believably against the photo. If you swap in a photo where the
// reference object is a different real height, just update the number —
// no other code needs to change.

export const ROOM_SCENES = [
  {
    key: 'living_room',
    label: 'Living Room',
    image: '/rooms/living-room1.jpg',
    referenceHeightCm: 205,
    referenceLabel: 'Standard doorway',
    calibration: {
      naturalWidth: 736,
      naturalHeight: 359,
      referenceTopPct: 0.21,
      referenceBottomPct: 0.97,
      hangCenterXPct: 0.50,
      hangBottomPct: 0.60,
    },
  },
  {
    key: 'bedroom',
    label: 'Bedroom',
    image: '/rooms/bedroom1.jpg',
    referenceHeightCm: 60,
    referenceLabel: 'Nightstand height',
    calibration: {
      naturalWidth: 704,
      naturalHeight: 724,
      referenceTopPct: 0.576,
      referenceBottomPct: 0.816,
      hangCenterXPct: 0.50,
      hangBottomPct: 0.50,
    },
  },
  {
    key: 'office',
    label: 'Office',
    image: '/rooms/office1.jpg',
    referenceHeightCm: 75,
    referenceLabel: 'Desk height',
    calibration: {
      naturalWidth: 736,
      naturalHeight: 802,
      referenceTopPct: 0.636,
      referenceBottomPct: 0.937,
      hangCenterXPct: 0.38,
      hangBottomPct: 0.46,
    },
  },
  // {
  //   key: 'hallway',
  //   label: 'Hallway',
  //   image: '/rooms/hallway.jpg',
  //   referenceHeightCm: 210,
  //   referenceLabel: 'Standard 210cm doorway',
  // },
];

// Fallback used only if /rooms/<file> hasn't been added yet, so the page
// never shows a broken image while you're still gathering photos.
export const ROOM_FALLBACK_IMAGE = '/room-background.jpg';

export const FURNITURE_ITEMS = [
  {
    key: 'sofa',
    label: 'Above a Sofa',
    image: '/furniture/sofa1.jpg',
    referenceHeightCm: 70,
    referenceLabel: 'Sofa back height',
    hangGapCm: 20, // typical gap left between furniture top and artwork bottom
    calibration: {
      naturalWidth: 626,
      naturalHeight: 463,
      referenceTopPct: 0.55,
      referenceBottomPct: 0.97,
      hangCenterXPct: 0.42,
      hangBottomPct: 0.35,
    },
  },
  {
    key: 'bed',
    label: 'Above a Bed',
    image: '/furniture/bed1.jpg',
    referenceHeightCm: 120,
    referenceLabel: 'Headboard height',
    hangGapCm: 15,
    calibration: {
      naturalWidth: 236,
      naturalHeight: 243,
      referenceTopPct: 0.36,
      referenceBottomPct: 0.93,
      hangCenterXPct: 0.50,
      hangBottomPct: 0.28,
    },
  },
  {
    key: 'desk',
    label: 'Above a Desk',
    image: '/furniture/desk1.jpg',
    referenceHeightCm: 75,
    referenceLabel: 'Desk height',
    hangGapCm: 30,
    calibration: {
      naturalWidth: 736,
      naturalHeight: 837,
      referenceTopPct: 0.62,
      referenceBottomPct: 0.97,
      hangCenterXPct: 0.45,
      hangBottomPct: 0.50,
    },
  },
  {
    key: 'dining_table',
    label: 'Above a Dining Table',
    image: '/furniture/dinning1.jpg',
    referenceHeightCm: 75,
    referenceLabel: 'Table height',
    hangGapCm: 35,
    calibration: {
      naturalWidth: 576,
      naturalHeight: 791,
      referenceTopPct: 0.68,
      referenceBottomPct: 0.97,
      hangCenterXPct: 0.50,
      hangBottomPct: 0.40,
    },
  },
];

// Average adult standing height used to scale the Person Silhouette mode.
export const AVERAGE_PERSON_HEIGHT_CM = 170;
